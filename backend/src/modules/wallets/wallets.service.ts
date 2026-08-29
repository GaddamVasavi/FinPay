import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';
import crypto from 'crypto';

export class WalletsService {
  /**
   * Get primary wallet and multi-currency balances for user
   */
  static async getWalletOverview(userId: string) {
    let wallet = await prisma.wallet.findFirst({
      where: { userId },
      include: {
        balances: true,
        cards: {
          select: {
            id: true,
            cardBrand: true,
            maskedPan: true,
            status: true,
            cardType: true,
          },
        },
      },
    });

    if (!wallet) {
      // Auto provision if missing
      const walletNumber = 'FP' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
      wallet = await prisma.wallet.create({
        data: {
          userId,
          walletNumber,
          currency: 'USD',
          status: 'ACTIVE',
          balances: {
            create: {
              currency: 'USD',
              currentBalance: 0.0,
              availableBalance: 0.0,
              lockedBalance: 0.0,
            },
          },
        },
        include: {
          balances: true,
          cards: true,
        },
      });
    }

    // Calculate aggregated portfolio total in USD
    const totalBalanceUsd = wallet.balances.reduce((acc, b) => {
      return Money.add(acc, b.currentBalance.toString());
    }, Money.parse(0));

    const totalAvailableUsd = wallet.balances.reduce((acc, b) => {
      return Money.add(acc, b.availableBalance.toString());
    }, Money.parse(0));

    return {
      id: wallet.id,
      walletNumber: wallet.walletNumber,
      currency: wallet.currency,
      status: wallet.status,
      dailyLimit: wallet.dailyLimit,
      monthlyLimit: wallet.monthlyLimit,
      balances: wallet.balances,
      cardsCount: wallet.cards.length,
      portfolio: {
        totalBalanceUsd: totalBalanceUsd.toFixed(4),
        totalAvailableUsd: totalAvailableUsd.toFixed(4),
        displayFormatted: Money.formatDisplay(totalBalanceUsd),
      },
    };
  }

  /**
   * Add / Deposit funds into wallet using atomic transactions and immutable ledger entries
   */
  static async addFunds(
    userId: string,
    dto: {
      amount: number;
      currency?: string;
      paymentMethod: string;
      sourceAccountId?: string;
      idempotencyKey: string;
      description?: string;
    },
    req?: any
  ) {
    const currency = dto.currency || 'USD';
    const amountDec = Money.parse(dto.amount);

    // Idempotency check: if transaction with this idempotency key already exists, return it
    const existingTx = await prisma.transaction.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
      include: { entries: true },
    });

    if (existingTx) {
      return {
        isReplay: true,
        transaction: existingTx,
        message: 'Transaction already processed (Idempotency Key match)',
      };
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
      include: { balances: true },
    });

    if (!wallet) {
      throw new ApiError('Wallet not found for this user', 404, 'WALLET_NOT_FOUND');
    }

    if (wallet.status !== 'ACTIVE') {
      throw new ApiError(`Wallet is currently ${wallet.status}. Deposits not permitted.`, 403, 'WALLET_NOT_ACTIVE');
    }

    const referenceNumber = 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    // Execute atomic balance update and double-entry recording
    const result = await prisma.$transaction(async (tx) => {
      // Find or create currency balance record
      let balance = await tx.walletBalance.findUnique({
        where: {
          walletId_currency: {
            walletId: wallet.id,
            currency,
          },
        },
      });

      if (!balance) {
        balance = await tx.walletBalance.create({
          data: {
            walletId: wallet.id,
            currency,
            currentBalance: 0.0,
            availableBalance: 0.0,
            lockedBalance: 0.0,
          },
        });
      }

      const newCurrentBalance = Money.add(balance.currentBalance.toString(), amountDec);
      const newAvailableBalance = Money.add(balance.availableBalance.toString(), amountDec);

      // 1. Update wallet balance
      const updatedBalance = await tx.walletBalance.update({
        where: { id: balance.id },
        data: {
          currentBalance: newCurrentBalance.toFixed(4),
          availableBalance: newAvailableBalance.toFixed(4),
        },
      });

      // 2. Create immutable transaction record
      const transaction = await tx.transaction.create({
        data: {
          referenceNumber,
          walletId: wallet.id,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount: amountDec.toFixed(4),
          currency,
          fee: '0.0000',
          description: dto.description || `Deposit via ${dto.paymentMethod.replace(/_/g, ' ')}`,
          idempotencyKey: dto.idempotencyKey,
          metadata: {
            paymentMethod: dto.paymentMethod,
            sourceAccountId: dto.sourceAccountId || 'N/A',
            depositedAt: new Date().toISOString(),
          },
        },
      });

      // 3. Create double-entry ledger journals
      // Credit user's wallet
      await tx.transactionEntry.create({
        data: {
          transactionId: transaction.id,
          entryType: 'CREDIT',
          accountName: `USER_WALLET_${currency}`,
          amount: amountDec.toFixed(4),
          currency,
          balanceAfter: newCurrentBalance.toFixed(4),
        },
      });

      // Debit external clearing / gateway account
      await tx.transactionEntry.create({
        data: {
          transactionId: transaction.id,
          entryType: 'DEBIT',
          accountName: `CLEARING_${dto.paymentMethod}_${currency}`,
          amount: amountDec.toFixed(4),
          currency,
          balanceAfter: '0.0000',
        },
      });

      // 4. Rule-based risk monitor: Trigger alert if amount > $10,000 threshold
      if (amountDec.greaterThanOrEqualTo(10000)) {
        await tx.riskAlert.create({
          data: {
            transactionId: transaction.id,
            ruleTriggered: 'LARGE_DEPOSIT_THRESHOLD_EXCEEDED',
            severity: 'MEDIUM',
            status: 'OPEN',
            details: {
              amount: amountDec.toFixed(4),
              currency,
              userId,
              threshold: 10000,
            },
          },
        });
      }

      return {
        transaction,
        balance: updatedBalance,
      };
    });

    await AuditService.log({
      userId,
      action: 'WALLET_DEPOSIT',
      entityType: 'Transaction',
      entityId: result.transaction.id,
      details: {
        amount: dto.amount,
        currency,
        referenceNumber: result.transaction.referenceNumber,
      },
      req,
    });

    return {
      success: true,
      message: `Successfully deposited ${Money.formatDisplay(amountDec, currency)} into wallet`,
      transaction: result.transaction,
      newBalance: result.balance,
    };
  }

  /**
   * Withdraw funds from wallet to a linked verified bank account
   */
  static async withdrawFunds(
    userId: string,
    dto: {
      amount: number;
      currency?: string;
      destinationBankAccountId: string;
      idempotencyKey: string;
      description?: string;
    },
    req?: any
  ) {
    const currency = dto.currency || 'USD';
    const amountDec = Money.parse(dto.amount);

    // Idempotency check
    const existingTx = await prisma.transaction.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });

    if (existingTx) {
      return {
        isReplay: true,
        transaction: existingTx,
        message: 'Withdrawal transaction already processed',
      };
    }

    // Verify bank account ownership & status
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: dto.destinationBankAccountId,
        userId,
      },
    });

    if (!bankAccount) {
      throw new ApiError('Destination bank account not found or does not belong to this user', 404, 'BANK_ACCOUNT_NOT_FOUND');
    }

    if (bankAccount.status !== 'VERIFIED') {
      throw new ApiError('Bank account must be in VERIFIED status before initiating withdrawals', 400, 'BANK_ACCOUNT_UNVERIFIED');
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
      include: { balances: true },
    });

    if (!wallet) {
      throw new ApiError('Wallet not found', 404, 'WALLET_NOT_FOUND');
    }

    if (wallet.status !== 'ACTIVE') {
      throw new ApiError(`Wallet is ${wallet.status}. Withdrawals blocked.`, 403, 'WALLET_NOT_ACTIVE');
    }

    const currentBalanceRecord = wallet.balances.find((b) => b.currency === currency);
    if (!currentBalanceRecord) {
      throw new ApiError(`No balance record found for currency ${currency}`, 400, 'INSUFFICIENT_FUNDS');
    }

    const currentAvail = Money.parse(currentBalanceRecord.availableBalance.toString());
    if (amountDec.greaterThan(currentAvail)) {
      throw new ApiError(
        `Insufficient available funds. Available: ${Money.formatDisplay(currentAvail, currency)}, Requested: ${Money.formatDisplay(amountDec, currency)}`,
        400,
        'INSUFFICIENT_FUNDS'
      );
    }

    const referenceNumber = 'WTH-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    // Execute atomic deduction and journal creation
    const result = await prisma.$transaction(async (tx) => {
      const newCurrent = Money.subtract(currentBalanceRecord.currentBalance.toString(), amountDec);
      const newAvail = Money.subtract(currentBalanceRecord.availableBalance.toString(), amountDec);

      const updatedBalance = await tx.walletBalance.update({
        where: { id: currentBalanceRecord.id },
        data: {
          currentBalance: newCurrent.toFixed(4),
          availableBalance: newAvail.toFixed(4),
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          referenceNumber,
          walletId: wallet.id,
          bankAccountId: bankAccount.id,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          amount: amountDec.toFixed(4),
          currency,
          fee: '0.0000',
          description: dto.description || `Withdrawal to ${bankAccount.bankName} (${bankAccount.accountNumberMasked})`,
          idempotencyKey: dto.idempotencyKey,
          metadata: {
            bankName: bankAccount.bankName,
            accountMasked: bankAccount.accountNumberMasked,
            processedAt: new Date().toISOString(),
          },
        },
      });

      // Debit User Wallet
      await tx.transactionEntry.create({
        data: {
          transactionId: transaction.id,
          entryType: 'DEBIT',
          accountName: `USER_WALLET_${currency}`,
          amount: amountDec.toFixed(4),
          currency,
          balanceAfter: newCurrent.toFixed(4),
        },
      });

      // Credit Clearing Outbound
      await tx.transactionEntry.create({
        data: {
          transactionId: transaction.id,
          entryType: 'CREDIT',
          accountName: `ACH_CLEARING_${currency}`,
          amount: amountDec.toFixed(4),
          currency,
          balanceAfter: '0.0000',
        },
      });

      return {
        transaction,
        balance: updatedBalance,
      };
    });

    await AuditService.log({
      userId,
      action: 'WALLET_WITHDRAWAL',
      entityType: 'Transaction',
      entityId: result.transaction.id,
      details: {
        amount: dto.amount,
        bankAccountId: bankAccount.id,
        referenceNumber: result.transaction.referenceNumber,
      },
      req,
    });

    return {
      success: true,
      message: `Withdrawal of ${Money.formatDisplay(amountDec, currency)} to ${bankAccount.bankName} completed`,
      transaction: result.transaction,
      newBalance: result.balance,
    };
  }

  /**
   * Query filtered, paginated wallet transactions with search and sorting
   */
  static async getTransactions(
    userId: string,
    query: {
      page: number;
      limit: number;
      type?: any;
      status?: any;
      startDate?: string;
      endDate?: string;
      search?: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    }
  ) {
    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      return { transactions: [], meta: { page: 1, limit: query.limit, total: 0, totalPages: 0 } };
    }

    const where: any = {
      walletId: wallet.id,
    };

    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { referenceNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const total = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: {
        [query.sortBy]: query.sortOrder,
      },
      include: {
        bankAccount: {
          select: {
            bankName: true,
            accountNumberMasked: true,
          },
        },
        transfer: {
          select: {
            sender: { select: { firstName: true, lastName: true, email: true } },
            receiver: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    return {
      transactions,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * Generate formal account statements in specified date range
   */
  static async generateStatement(
    userId: string,
    dto: { startDate: string; endDate: string; format: string; currency?: string }
  ) {
    const wallet = await prisma.wallet.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            address: true,
          },
        },
        balances: true,
      },
    });

    if (!wallet) {
      throw new ApiError('Wallet not found', 404, 'WALLET_NOT_FOUND');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    const transactions = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    let totalDeposits = Money.parse(0);
    let totalWithdrawals = Money.parse(0);
    let totalTransfers = Money.parse(0);

    for (const t of transactions) {
      if (t.type === 'DEPOSIT') totalDeposits = Money.add(totalDeposits, t.amount.toString());
      if (t.type === 'WITHDRAWAL') totalWithdrawals = Money.add(totalWithdrawals, t.amount.toString());
      if (t.type === 'TRANSFER' || t.type === 'PAYMENT') totalTransfers = Money.add(totalTransfers, t.amount.toString());
    }

    return {
      statementId: 'STMT-' + Date.now().toString(36).toUpperCase(),
      period: {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
      accountHolder: {
        name: `${wallet.user.firstName} ${wallet.user.lastName}`,
        email: wallet.user.email,
        walletNumber: wallet.walletNumber,
        address: wallet.user.address,
      },
      summary: {
        totalDeposits: totalDeposits.toFixed(4),
        totalWithdrawals: totalWithdrawals.toFixed(4),
        totalTransfers: totalTransfers.toFixed(4),
        transactionCount: transactions.length,
      },
      transactions,
      generatedAt: new Date().toISOString(),
    };
  }
}
