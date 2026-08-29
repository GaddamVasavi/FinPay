import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';
import crypto from 'crypto';

export class BankAccountsService {
  /**
   * Securely link a new external bank account with masked information and tokenization
   */
  static async linkBankAccount(
    userId: string,
    dto: {
      bankName: string;
      accountHolder: string;
      accountNumber: string;
      routingNumber?: string;
      currency?: string;
      isDefault?: boolean;
    },
    req?: any
  ) {
    const rawNum = dto.accountNumber.trim();
    const last4 = rawNum.slice(-4);
    const maskedNumber = '*'.repeat(Math.max(0, rawNum.length - 4)) + last4;

    const rawRouting = dto.routingNumber?.trim();
    const maskedRouting = rawRouting ? '*****' + rawRouting.slice(-4) : null;

    // Simulate tokenized provider identifier (e.g. btok_sandbox_1234)
    const stripeBankToken = 'btok_test_' + crypto.randomBytes(12).toString('hex');

    // If marked as default, unset previous defaults
    if (dto.isDefault) {
      await prisma.bankAccount.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // Automatically check if this is user's first bank account
    const existingCount = await prisma.bankAccount.count({ where: { userId } });
    const isFirst = existingCount === 0;

    const account = await prisma.bankAccount.create({
      data: {
        userId,
        bankName: dto.bankName,
        accountHolder: dto.accountHolder,
        accountNumberMasked: maskedNumber,
        routingNumberMasked: maskedRouting,
        currency: dto.currency || 'USD',
        isDefault: dto.isDefault || isFirst,
        status: 'VERIFIED', // Sandbox default auto-verified for testing
        stripeBankToken,
      },
    });

    await AuditService.log({
      userId,
      action: 'BANK_ACCOUNT_LINKED',
      entityType: 'BankAccount',
      entityId: account.id,
      details: {
        bankName: account.bankName,
        accountNumberMasked: account.accountNumberMasked,
      },
      req,
    });

    return account;
  }

  /**
   * Get all linked bank accounts for user
   */
  static async getBankAccounts(userId: string) {
    return prisma.bankAccount.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Set an existing bank account as default
   */
  static async setDefault(userId: string, accountId: string, req?: any) {
    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new ApiError('Bank account not found', 404, 'NOT_FOUND');
    }

    await prisma.$transaction([
      prisma.bankAccount.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      prisma.bankAccount.update({
        where: { id: accountId },
        data: { isDefault: true },
      }),
    ]);

    await AuditService.log({
      userId,
      action: 'BANK_ACCOUNT_SET_DEFAULT',
      entityType: 'BankAccount',
      entityId: accountId,
      req,
    });

    return { message: 'Default bank account updated successfully' };
  }

  /**
   * Remove / Unlink bank account
   */
  static async remove(userId: string, accountId: string, req?: any) {
    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new ApiError('Bank account not found', 404, 'NOT_FOUND');
    }

    await prisma.bankAccount.delete({
      where: { id: accountId },
    });

    // If removed was default, promote next available
    if (account.isDefault) {
      const nextAccount = await prisma.bankAccount.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (nextAccount) {
        await prisma.bankAccount.update({
          where: { id: nextAccount.id },
          data: { isDefault: true },
        });
      }
    }

    await AuditService.log({
      userId,
      action: 'BANK_ACCOUNT_REMOVED',
      entityType: 'BankAccount',
      entityId: accountId,
      req,
    });

    return { message: 'Bank account unlinked successfully' };
  }
}
