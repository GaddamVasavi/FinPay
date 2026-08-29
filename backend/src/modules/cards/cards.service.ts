import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';
import crypto from 'crypto';

export class CardsService {
  /**
   * Issue a new Virtual or Physical card linked to the customer's wallet
   */
  static async createCard(
    userId: string,
    dto: {
      cardType?: 'VIRTUAL' | 'PHYSICAL';
      cardBrand?: string;
      nickname?: string;
      dailyLimit?: number;
      monthlyLimit?: number;
    },
    req?: any
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallets: true },
    });

    if (!user || user.wallets.length === 0) {
      throw new ApiError('User or wallet not found', 404, 'WALLET_NOT_FOUND');
    }

    const wallet = user.wallets[0];

    const cardBrand = dto.cardBrand || 'VISA';
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const prefix = cardBrand === 'MASTERCARD' ? '5555' : '4111';
    const maskedPan = `${prefix}********${last4}`;
    const cardToken = 'tok_card_' + crypto.randomBytes(12).toString('hex');

    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 4);

    const card = await prisma.card.create({
      data: {
        userId,
        walletId: wallet.id,
        cardType: dto.cardType || 'VIRTUAL',
        cardBrand,
        maskedPan,
        cardToken,
        cardholderName: `${user.firstName} ${user.lastName}`.toUpperCase(),
        expiryMonth: expDate.getMonth() + 1,
        expiryYear: expDate.getFullYear(),
        nickname: dto.nickname || `${cardBrand} Virtual Card`,
        dailyLimit: dto.dailyLimit ? dto.dailyLimit : 5000.0,
        monthlyLimit: dto.monthlyLimit ? dto.monthlyLimit : 20000.0,
        status: 'ACTIVE',
        isFrozen: false,
      },
    });

    await AuditService.log({
      userId,
      action: 'CARD_ISSUED',
      entityType: 'Card',
      entityId: card.id,
      details: { maskedPan: card.maskedPan, cardType: card.cardType },
      req,
    });

    return card;
  }

  /**
   * Get all active and frozen cards for user
   */
  static async getCards(userId: string) {
    return prisma.card.findMany({
      where: { userId },
      include: {
        cardTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Freeze or Unfreeze card immediately
   */
  static async toggleFreeze(userId: string, cardId: string, req?: any) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new ApiError('Card not found', 404, 'NOT_FOUND');
    }

    const newFreezeStatus = !card.isFrozen;
    const newStatus = newFreezeStatus ? 'FROZEN' : 'ACTIVE';

    const updated = await prisma.card.update({
      where: { id: cardId },
      data: {
        isFrozen: newFreezeStatus,
        status: newStatus as any,
      },
    });

    await AuditService.log({
      userId,
      action: newFreezeStatus ? 'CARD_FROZEN' : 'CARD_UNFROZEN',
      entityType: 'Card',
      entityId: cardId,
      req,
    });

    return {
      message: `Card is now ${newStatus}`,
      card: updated,
    };
  }

  /**
   * Update card daily and monthly spending limits
   */
  static async updateLimits(
    userId: string,
    cardId: string,
    dto: { dailyLimit?: number; monthlyLimit?: number; nickname?: string },
    req?: any
  ) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new ApiError('Card not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.card.update({
      where: { id: cardId },
      data: {
        ...(dto.dailyLimit && { dailyLimit: dto.dailyLimit }),
        ...(dto.monthlyLimit && { monthlyLimit: dto.monthlyLimit }),
        ...(dto.nickname && { nickname: dto.nickname }),
      },
    });

    await AuditService.log({
      userId,
      action: 'CARD_LIMITS_UPDATED',
      entityType: 'Card',
      entityId: cardId,
      details: dto,
      req,
    });

    return updated;
  }

  /**
   * Simulate online POS / E-commerce authorization against virtual card
   */
  static async simulateAuthorization(
    userId: string,
    cardId: string,
    dto: { merchantName: string; amount: number; currency?: string },
    req?: any
  ) {
    const currency = dto.currency || 'USD';
    const amountDec = Money.parse(dto.amount);

    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
      include: {
        wallet: {
          include: { balances: true },
        },
      },
    });

    if (!card) {
      throw new ApiError('Card not found', 404, 'NOT_FOUND');
    }

    if (card.isFrozen || card.status !== 'ACTIVE') {
      throw new ApiError('Transaction declined: Card is currently FROZEN or inactive', 400, 'CARD_FROZEN');
    }

    if (amountDec.greaterThan(card.dailyLimit.toString())) {
      throw new ApiError('Transaction declined: Amount exceeds card daily limit threshold', 400, 'LIMIT_EXCEEDED');
    }

    const balRecord = card.wallet.balances.find((b) => b.currency === currency);
    if (!balRecord) {
      throw new ApiError('Transaction declined: Insufficient funds in primary wallet', 400, 'INSUFFICIENT_FUNDS');
    }

    const avail = Money.parse(balRecord.availableBalance.toString());
    if (amountDec.greaterThan(avail)) {
      throw new ApiError('Transaction declined: Insufficient available funds', 400, 'INSUFFICIENT_FUNDS');
    }

    const authCode = 'AUTH' + Math.floor(100000 + Math.random() * 900000);
    const referenceNumber = 'POS-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      // Deduct wallet balance
      const newCurrent = Money.subtract(balRecord.currentBalance.toString(), amountDec);
      const newAvail = Money.subtract(balRecord.availableBalance.toString(), amountDec);

      await tx.walletBalance.update({
        where: { id: balRecord.id },
        data: {
          currentBalance: newCurrent.toFixed(4),
          availableBalance: newAvail.toFixed(4),
        },
      });

      // Record Card Transaction
      const cardTx = await tx.cardTransaction.create({
        data: {
          cardId: card.id,
          merchantName: dto.merchantName,
          amount: amountDec.toFixed(4),
          currency,
          status: 'COMPLETED',
          authCode,
        },
      });

      // Record Master Transaction
      const transaction = await tx.transaction.create({
        data: {
          referenceNumber,
          walletId: card.walletId,
          type: 'PAYMENT',
          status: 'COMPLETED',
          amount: amountDec.toFixed(4),
          currency,
          description: `POS Card Purchase - ${dto.merchantName} (${card.maskedPan})`,
          metadata: {
            authCode,
            cardId: card.id,
            maskedPan: card.maskedPan,
          },
        },
      });

      return { cardTx, transaction };
    });

    await AuditService.log({
      userId,
      action: 'CARD_POS_PURCHASE',
      entityType: 'CardTransaction',
      entityId: result.cardTx.id,
      details: { merchant: dto.merchantName, amount: dto.amount, authCode },
      req,
    });

    return {
      message: 'Card authorization approved',
      authCode,
      transaction: result.transaction,
      cardTransaction: result.cardTx,
    };
  }
}
