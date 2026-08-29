import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';
import crypto from 'crypto';

export class PaymentsService {
  /**
   * Process a merchant payment using wallet balance or simulated sandbox payment gateway
   */
  static async processPayment(
    userId: string,
    dto: {
      merchantName: string;
      merchantCategory?: string;
      amount: number;
      currency?: string;
      paymentMethod?: string;
      idempotencyKey: string;
    },
    req?: any
  ) {
    const currency = dto.currency || 'USD';
    const amountDec = Money.parse(dto.amount);
    const paymentMethod = dto.paymentMethod || 'WALLET';

    // Idempotency check
    const existingTx = await prisma.transaction.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
      include: { payment: true },
    });

    if (existingTx && existingTx.payment) {
      return {
        isReplay: true,
        payment: existingTx.payment,
        transaction: existingTx,
        message: 'Payment already processed (Idempotency matched)',
      };
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
      include: { balances: true },
    });

    if (!wallet) {
      throw new ApiError('User wallet not found', 404, 'WALLET_NOT_FOUND');
    }

    const balRecord = wallet.balances.find((b) => b.currency === currency);
    if (!balRecord) {
      throw new ApiError(`No ${currency} balance available`, 400, 'INSUFFICIENT_FUNDS');
    }

    const avail = Money.parse(balRecord.availableBalance.toString());
    if (amountDec.greaterThan(avail)) {
      throw new ApiError(
        `Insufficient wallet balance to complete payment of ${Money.formatDisplay(amountDec, currency)}. Available: ${Money.formatDisplay(avail, currency)}`,
        400,
        'INSUFFICIENT_FUNDS'
      );
    }

    const referenceNumber = 'PAY-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const providerPaymentId = 'ch_sandbox_' + crypto.randomBytes(12).toString('hex');
    const receiptUrl = `https://finpay.local/receipts/${referenceNumber}`;

    const result = await prisma.$transaction(async (tx) => {
      // Deduct from wallet balance
      const newCurrent = Money.subtract(balRecord.currentBalance.toString(), amountDec);
      const newAvail = Money.subtract(balRecord.availableBalance.toString(), amountDec);

      await tx.walletBalance.update({
        where: { id: balRecord.id },
        data: {
          currentBalance: newCurrent.toFixed(4),
          availableBalance: newAvail.toFixed(4),
        },
      });

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          referenceNumber,
          walletId: wallet.id,
          type: 'PAYMENT',
          status: 'COMPLETED',
          amount: amountDec.toFixed(4),
          fee: '0.0000',
          currency,
          description: `Payment to ${dto.merchantName}`,
          idempotencyKey: dto.idempotencyKey,
          metadata: {
            merchantName: dto.merchantName,
            merchantCategory: dto.merchantCategory || 'GENERAL',
            provider: 'stripe_sandbox',
            providerPaymentId,
          },
        },
      });

      // Ledger entries
      await tx.transactionEntry.create({
        data: {
          transactionId: transaction.id,
          entryType: 'DEBIT',
          accountName: `USER_WALLET_${userId}_${currency}`,
          amount: amountDec.toFixed(4),
          currency,
          balanceAfter: newCurrent.toFixed(4),
        },
      });

      await tx.transactionEntry.create({
        data: {
          transactionId: transaction.id,
          entryType: 'CREDIT',
          accountName: `MERCHANT_SETTLEMENT_${currency}`,
          amount: amountDec.toFixed(4),
          currency,
          balanceAfter: '0.0000',
        },
      });

      // Create Payment entity
      const payment = await tx.payment.create({
        data: {
          referenceNumber,
          transactionId: transaction.id,
          merchantName: dto.merchantName,
          merchantCategory: dto.merchantCategory || 'GENERAL',
          amount: amountDec.toFixed(4),
          currency,
          status: 'COMPLETED',
          provider: 'stripe_sandbox',
          providerPaymentId,
          paymentMethod,
          receiptUrl,
        },
      });

      return { transaction, payment, newBalance: newAvail.toFixed(4) };
    });

    await AuditService.log({
      userId,
      action: 'PAYMENT_PROCESSED',
      entityType: 'Payment',
      entityId: result.payment.id,
      details: {
        merchant: dto.merchantName,
        amount: dto.amount,
        referenceNumber,
      },
      req,
    });

    return {
      success: true,
      message: `Payment of ${Money.formatDisplay(amountDec, currency)} to ${dto.merchantName} successful`,
      payment: result.payment,
      newAvailableBalance: result.newBalance,
    };
  }

  /**
   * Process refund for a completed payment
   */
  static async refundPayment(
    executorId: string,
    dto: { paymentId: string; reason: string },
    req?: any
  ) {
    const payment = await prisma.payment.findUnique({
      where: { id: dto.paymentId },
      include: {
        transaction: {
          include: {
            wallet: {
              include: { balances: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError('Payment not found', 404, 'NOT_FOUND');
    }

    if (payment.status === 'REFUNDED') {
      throw new ApiError('This payment has already been refunded', 400, 'ALREADY_REFUNDED');
    }

    const wallet = payment.transaction.wallet;
    const currency = payment.currency;
    const amountDec = Money.parse(payment.amount.toString());

    const refundRef = 'REF-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      // Find balance record
      const balRecord = wallet.balances.find((b) => b.currency === currency)!;
      const newCurrent = Money.add(balRecord.currentBalance.toString(), amountDec);
      const newAvail = Money.add(balRecord.availableBalance.toString(), amountDec);

      await tx.walletBalance.update({
        where: { id: balRecord.id },
        data: {
          currentBalance: newCurrent.toFixed(4),
          availableBalance: newAvail.toFixed(4),
        },
      });

      // Update original payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });

      // Create Refund transaction
      const refundTx = await tx.transaction.create({
        data: {
          referenceNumber: refundRef,
          walletId: wallet.id,
          type: 'REFUND',
          status: 'COMPLETED',
          amount: amountDec.toFixed(4),
          currency,
          description: `Refund for payment ${payment.referenceNumber} (${payment.merchantName}): ${dto.reason}`,
          metadata: {
            originalPaymentId: payment.id,
            reason: dto.reason,
          },
        },
      });

      // Credit user's wallet
      await tx.transactionEntry.create({
        data: {
          transactionId: refundTx.id,
          entryType: 'CREDIT',
          accountName: `USER_WALLET_${wallet.userId}_${currency}`,
          amount: amountDec.toFixed(4),
          currency,
          balanceAfter: newCurrent.toFixed(4),
        },
      });

      return refundTx;
    });

    await AuditService.log({
      userId: executorId,
      action: 'PAYMENT_REFUNDED',
      entityType: 'Payment',
      entityId: payment.id,
      details: { amount: payment.amount.toString(), reason: dto.reason },
      req,
    });

    return {
      message: 'Refund completed successfully and funds returned to wallet.',
      refundTransaction: result,
    };
  }

  /**
   * Get user payment history
   */
  static async getPayments(userId: string) {
    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) return [];

    return prisma.payment.findMany({
      where: {
        transaction: {
          walletId: wallet.id,
        },
      },
      include: {
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
