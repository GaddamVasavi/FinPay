import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';
import crypto from 'crypto';

export class TransfersService {
  /**
   * Execute atomic user-to-user money transfer
   */
  static async sendTransfer(
    senderId: string,
    dto: {
      recipientEmail: string;
      amount: number;
      currency?: string;
      note?: string;
      idempotencyKey: string;
      saveBeneficiary?: boolean;
    },
    req?: any
  ) {
    const currency = dto.currency || 'USD';
    const amountDec = Money.parse(dto.amount);
    const recipientEmail = dto.recipientEmail.toLowerCase().trim();

    // 1. Idempotency Check
    const existingTx = await prisma.transaction.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
      include: {
        transfer: {
          include: {
            receiver: { select: { email: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (existingTx) {
      return {
        isReplay: true,
        transfer: existingTx.transfer,
        transaction: existingTx,
        message: 'Transfer already processed (Idempotency matched)',
      };
    }

    // 2. Validate Sender != Receiver
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!sender) {
      throw new ApiError('Sender profile not found', 404, 'SENDER_NOT_FOUND');
    }

    if (sender.email.toLowerCase() === recipientEmail) {
      throw new ApiError('Self-transfers are not permitted. Please use wallet balance exchange instead.', 400, 'SELF_TRANSFER_PROHIBITED');
    }

    // 3. Find and validate receiver
    const receiver = await prisma.user.findUnique({
      where: { email: recipientEmail },
      include: {
        wallets: {
          include: { balances: true },
        },
      },
    });

    if (!receiver) {
      throw new ApiError(`No FinPay customer found with email: ${dto.recipientEmail}`, 404, 'RECEIVER_NOT_FOUND');
    }

    if (receiver.status === 'SUSPENDED' || receiver.status === 'LOCKED') {
      throw new ApiError('Recipient account is currently suspended or unable to receive funds', 400, 'RECEIVER_ACCOUNT_BLOCKED');
    }

    // 4. Validate Sender Wallet & Available Balance
    const senderWallet = await prisma.wallet.findFirst({
      where: { userId: senderId },
      include: { balances: true },
    });

    if (!senderWallet || senderWallet.status !== 'ACTIVE') {
      throw new ApiError('Sender wallet is not active', 403, 'WALLET_INACTIVE');
    }

    const senderBal = senderWallet.balances.find((b) => b.currency === currency);
    if (!senderBal) {
      throw new ApiError(`You do not have a wallet balance in ${currency}`, 400, 'NO_CURRENCY_BALANCE');
    }

    const senderAvail = Money.parse(senderBal.availableBalance.toString());
    if (amountDec.greaterThan(senderAvail)) {
      throw new ApiError(
        `Insufficient available balance. Available: ${Money.formatDisplay(senderAvail, currency)}, Transfer: ${Money.formatDisplay(amountDec, currency)}`,
        400,
        'INSUFFICIENT_FUNDS'
      );
    }

    // 5. Ensure Receiver Wallet has matching balance record
    const receiverWallet = receiver.wallets[0];
    if (!receiverWallet) {
      throw new ApiError('Recipient does not have an active digital wallet', 400, 'RECEIVER_WALLET_MISSING');
    }

    const referenceNumber = 'TRF-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    // 6. Execute atomic database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct sender balance
      const newSenderCurrent = Money.subtract(senderBal.currentBalance.toString(), amountDec);
      const newSenderAvail = Money.subtract(senderBal.availableBalance.toString(), amountDec);

      await tx.walletBalance.update({
        where: { id: senderBal.id },
        data: {
          currentBalance: newSenderCurrent.toFixed(4),
          availableBalance: newSenderAvail.toFixed(4),
        },
      });

      // Credit receiver balance
      let receiverBal = await tx.walletBalance.findUnique({
        where: {
          walletId_currency: {
            walletId: receiverWallet.id,
            currency,
          },
        },
      });

      if (!receiverBal) {
        receiverBal = await tx.walletBalance.create({
          data: {
            walletId: receiverWallet.id,
            currency,
            currentBalance: 0.0,
            availableBalance: 0.0,
            lockedBalance: 0.0,
          },
        });
      }

      const newReceiverCurrent = Money.add(receiverBal.currentBalance.toString(), amountDec);
      const newReceiverAvail = Money.add(receiverBal.availableBalance.toString(), amountDec);

      await tx.walletBalance.update({
        where: { id: receiverBal.id },
        data: {
          currentBalance: newReceiverCurrent.toFixed(4),
          availableBalance: newReceiverAvail.toFixed(4),
        },
      });

      // Create primary Transaction Record
      const transaction = await tx.transaction.create({
        data: {
          referenceNumber,
          walletId: senderWallet.id,
          type: 'TRANSFER',
          status: 'COMPLETED',
          amount: amountDec.toFixed(4),
          fee: '0.0000',
          currency,
          description: dto.note || `P2P Transfer to ${receiver.firstName} ${receiver.lastName}`,
          idempotencyKey: dto.idempotencyKey,
          metadata: {
            senderEmail: sender.email,
            receiverEmail: receiver.email,
            note: dto.note || '',
          },
        },
      });

      // Create Ledger Entries (Debit Sender, Credit Receiver)
      await tx.transactionEntry.create({
        data: {
          transactionId: transaction.id,
          entryType: 'DEBIT',
          accountName: `USER_WALLET_${sender.id}_${currency}`,
          amount: amountDec.toFixed(4),
          currency,
          balanceAfter: newSenderCurrent.toFixed(4),
        },
      });

      await tx.transactionEntry.create({
        data: {
          transactionId: transaction.id,
          entryType: 'CREDIT',
          accountName: `USER_WALLET_${receiver.id}_${currency}`,
          amount: amountDec.toFixed(4),
          currency,
          balanceAfter: newReceiverCurrent.toFixed(4),
        },
      });

      // Create Transfer Record
      const transfer = await tx.transfer.create({
        data: {
          referenceNumber,
          transactionId: transaction.id,
          senderId: sender.id,
          receiverId: receiver.id,
          amount: amountDec.toFixed(4),
          currency,
          status: 'COMPLETED',
          note: dto.note || null,
        },
      });

      // Optionally save recipient to beneficiaries
      if (dto.saveBeneficiary) {
        const existingBeneficiary = await tx.beneficiary.findFirst({
          where: { userId: senderId, beneficiaryUserId: receiver.id },
        });
        if (!existingBeneficiary) {
          await tx.beneficiary.create({
            data: {
              userId: senderId,
              beneficiaryUserId: receiver.id,
              name: `${receiver.firstName} ${receiver.lastName}`,
              email: receiver.email,
              isVerified: true,
            },
          });
        }
      }

      // Create Notification for receiver
      await tx.notification.create({
        data: {
          userId: receiver.id,
          title: 'Money Received',
          message: `You received ${Money.formatDisplay(amountDec, currency)} from ${sender.firstName} ${sender.lastName}.`,
          type: 'TRANSACTION',
          linkUrl: '/transactions',
        },
      });

      // Rule-based risk monitor for high velocity / amount
      if (amountDec.greaterThanOrEqualTo(5000)) {
        await tx.riskAlert.create({
          data: {
            transactionId: transaction.id,
            ruleTriggered: 'HIGH_VALUE_P2P_TRANSFER',
            severity: amountDec.greaterThanOrEqualTo(10000) ? 'HIGH' : 'MEDIUM',
            status: 'OPEN',
            details: {
              senderId: sender.id,
              receiverId: receiver.id,
              amount: amountDec.toFixed(4),
              currency,
            },
          },
        });
      }

      return {
        transaction,
        transfer,
        senderBalance: newSenderAvail.toFixed(4),
      };
    });

    await AuditService.log({
      userId: senderId,
      action: 'P2P_TRANSFER_COMPLETED',
      entityType: 'Transfer',
      entityId: result.transfer.id,
      details: {
        amount: dto.amount,
        currency,
        recipientEmail,
        referenceNumber,
      },
      req,
    });

    return {
      success: true,
      message: `Successfully transferred ${Money.formatDisplay(amountDec, currency)} to ${receiver.firstName} ${receiver.lastName}`,
      transfer: {
        ...result.transfer,
        recipientName: `${receiver.firstName} ${receiver.lastName}`,
        recipientEmail: receiver.email,
      },
      newAvailableBalance: result.senderBalance,
    };
  }

  /**
   * Get user's sent and received transfer history
   */
  static async getHistory(userId: string) {
    return prisma.transfer.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { firstName: true, lastName: true, email: true } },
        receiver: { select: { firstName: true, lastName: true, email: true } },
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Get formatted transfer receipt
   */
  static async getReceipt(userId: string, referenceNumber: string) {
    const transfer = await prisma.transfer.findUnique({
      where: { referenceNumber },
      include: {
        sender: { select: { firstName: true, lastName: true, email: true } },
        receiver: { select: { firstName: true, lastName: true, email: true } },
        transaction: true,
      },
    });

    if (!transfer) {
      throw new ApiError('Transfer receipt not found', 404, 'NOT_FOUND');
    }

    if (transfer.senderId !== userId && transfer.receiverId !== userId) {
      throw new ApiError('Unauthorized to view this transaction receipt', 403, 'FORBIDDEN');
    }

    return {
      receiptNumber: 'RCP-' + transfer.referenceNumber,
      transferReference: transfer.referenceNumber,
      status: transfer.status,
      date: transfer.createdAt,
      amountFormatted: Money.formatDisplay(transfer.amount.toString(), transfer.currency),
      sender: transfer.sender,
      receiver: transfer.receiver,
      note: transfer.note,
      fee: Money.formatDisplay(transfer.fee.toString(), transfer.currency),
    };
  }
}
