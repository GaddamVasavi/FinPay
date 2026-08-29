import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';
import crypto from 'crypto';

export class LoansService {
  /**
   * Apply for personal/business loan and generate amortization installment schedule
   */
  static async applyLoan(
    userId: string,
    dto: {
      principalAmount: number;
      termMonths: number;
      purpose: string;
      annualIncome: number;
      employmentStatus: string;
    },
    req?: any
  ) {
    const interestRate = 8.99; // Standard 8.99% APR
    const principal = Money.parse(dto.principalAmount);
    const n = dto.termMonths;
    const monthlyRate = interestRate / 100 / 12;

    // Standard EMI formula: [P * r * (1+r)^n] / [(1+r)^n - 1]
    const emiFactor = Math.pow(1 + monthlyRate, n);
    const monthlyInstallmentNum = (dto.principalAmount * monthlyRate * emiFactor) / (emiFactor - 1);
    const monthlyInstallment = Money.parse(monthlyInstallmentNum.toFixed(4));
    const totalAmount = Money.parse((monthlyInstallmentNum * n).toFixed(4));

    const loanNumber = 'LN' + Math.floor(10000000 + Math.random() * 90000000).toString();

    // Create loan and installments in database
    const loan = await prisma.$transaction(async (tx) => {
      const createdLoan = await tx.loan.create({
        data: {
          userId,
          loanNumber,
          principalAmount: principal.toFixed(4),
          totalAmount: totalAmount.toFixed(4),
          outstandingAmount: totalAmount.toFixed(4),
          interestRate: interestRate.toFixed(2),
          termMonths: n,
          monthlyInstallment: monthlyInstallment.toFixed(4),
          status: 'APPLICATION',
          purpose: dto.purpose,
        },
      });

      // Create loan application metadata
      await tx.loanApplication.create({
        data: {
          loanId: createdLoan.id,
          annualIncome: Money.parse(dto.annualIncome).toFixed(4),
          employmentStatus: dto.employmentStatus,
          creditScore: 740, // Simulated sandbox credit scoring
          status: 'APPLICATION',
        },
      });

      // Generate amortized installments
      let remainingPrincipal = dto.principalAmount;
      for (let i = 1; i <= n; i++) {
        const interestForMonth = remainingPrincipal * monthlyRate;
        const principalForMonth = monthlyInstallmentNum - interestForMonth;
        remainingPrincipal -= principalForMonth;

        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);

        await tx.loanInstallment.create({
          data: {
            loanId: createdLoan.id,
            installmentNumber: i,
            dueDate,
            amount: monthlyInstallment.toFixed(4),
            principal: Money.parse(principalForMonth.toFixed(4)).toFixed(4),
            interest: Money.parse(interestForMonth.toFixed(4)).toFixed(4),
            status: 'PENDING',
          },
        });
      }

      return createdLoan;
    });

    await AuditService.log({
      userId,
      action: 'LOAN_APPLICATION_SUBMITTED',
      entityType: 'Loan',
      entityId: loan.id,
      details: { principal: dto.principalAmount, termMonths: dto.termMonths },
      req,
    });

    return loan;
  }

  /**
   * Get user loans with repayment schedule breakdown
   */
  static async getLoans(userId: string) {
    return prisma.loan.findMany({
      where: { userId },
      include: {
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
        repayments: {
          orderBy: { paidAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin / Underwriter review and approval with instant wallet disbursement
   */
  static async reviewLoan(
    reviewerId: string,
    loanId: string,
    dto: { status: 'APPROVED' | 'REJECTED'; adminNotes?: string },
    req?: any
  ) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        user: {
          include: {
            wallets: {
              include: { balances: true },
            },
          },
        },
      },
    });

    if (!loan) {
      throw new ApiError('Loan not found', 404, 'NOT_FOUND');
    }

    if (loan.status !== 'APPLICATION' && loan.status !== 'UNDER_REVIEW') {
      throw new ApiError('Loan has already been reviewed', 400, 'ALREADY_REVIEWED');
    }

    if (dto.status === 'REJECTED') {
      const updated = await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'REJECTED' },
      });
      return { message: 'Loan application rejected', loan: updated };
    }

    // If APPROVED, disburse funds directly into customer's primary wallet
    const wallet = loan.user.wallets[0];
    if (!wallet) {
      throw new ApiError('Borrower does not have an active wallet for disbursement', 400, 'NO_WALLET');
    }

    const principalDec = Money.parse(loan.principalAmount.toString());
    const referenceNumber = 'DISB-' + loan.loanNumber;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update loan status to ACTIVE
      const activeLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: 'ACTIVE',
          approvedAt: new Date(),
          disbursedAt: new Date(),
        },
      });

      // 2. Disburse principal into wallet
      const usdBal = wallet.balances.find((b) => b.currency === 'USD')!;
      const newCurrent = Money.add(usdBal.currentBalance.toString(), principalDec);
      const newAvail = Money.add(usdBal.availableBalance.toString(), principalDec);

      await tx.walletBalance.update({
        where: { id: usdBal.id },
        data: {
          currentBalance: newCurrent.toFixed(4),
          availableBalance: newAvail.toFixed(4),
        },
      });

      // 3. Create disbursement transaction
      const transaction = await tx.transaction.create({
        data: {
          referenceNumber,
          walletId: wallet.id,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount: principalDec.toFixed(4),
          currency: 'USD',
          description: `Loan Disbursement - #${loan.loanNumber} (${loan.purpose})`,
          metadata: {
            loanId: loan.id,
            loanNumber: loan.loanNumber,
          },
        },
      });

      // 4. Ledger credit user, debit lending pool
      await tx.transactionEntry.create({
        data: {
          transactionId: transaction.id,
          entryType: 'CREDIT',
          accountName: `USER_WALLET_${loan.userId}_USD`,
          amount: principalDec.toFixed(4),
          currency: 'USD',
          balanceAfter: newCurrent.toFixed(4),
        },
      });

      // 5. Send Notification
      await tx.notification.create({
        data: {
          userId: loan.userId,
          title: 'Loan Approved & Disbursed! 🎉',
          message: `Your loan #${loan.loanNumber} for $${principalDec.toFixed(2)} has been approved and disbursed to your wallet.`,
          type: 'LOAN',
        },
      });

      return activeLoan;
    });

    await AuditService.log({
      userId: reviewerId,
      action: 'LOAN_APPROVED_AND_DISBURSED',
      entityType: 'Loan',
      entityId: loanId,
      details: { amount: loan.principalAmount.toString() },
      req,
    });

    return {
      message: `Loan approved and ${Money.formatDisplay(principalDec)} disbursed to borrower.`,
      loan: result,
    };
  }

  /**
   * Repay monthly installment from wallet balance
   */
  static async repayInstallment(
    userId: string,
    dto: { installmentId: string; amount: number },
    req?: any
  ) {
    const installment = await prisma.loanInstallment.findUnique({
      where: { id: dto.installmentId },
      include: {
        loan: {
          include: {
            user: {
              include: {
                wallets: {
                  include: { balances: true },
                },
              },
            },
          },
        },
      },
    });

    if (!installment || installment.loan.userId !== userId) {
      throw new ApiError('Installment not found', 404, 'NOT_FOUND');
    }

    if (installment.status === 'PAID') {
      throw new ApiError('This installment is already paid', 400, 'ALREADY_PAID');
    }

    const wallet = installment.loan.user.wallets[0];
    const usdBal = wallet.balances.find((b) => b.currency === 'USD')!;
    const installmentAmount = Money.parse(installment.amount.toString());

    const avail = Money.parse(usdBal.availableBalance.toString());
    if (installmentAmount.greaterThan(avail)) {
      throw new ApiError('Insufficient funds in wallet to cover loan installment', 400, 'INSUFFICIENT_FUNDS');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Deduct wallet
      const newCurrent = Money.subtract(usdBal.currentBalance.toString(), installmentAmount);
      const newAvail = Money.subtract(usdBal.availableBalance.toString(), installmentAmount);

      await tx.walletBalance.update({
        where: { id: usdBal.id },
        data: {
          currentBalance: newCurrent.toFixed(4),
          availableBalance: newAvail.toFixed(4),
        },
      });

      // Mark installment as PAID
      await tx.loanInstallment.update({
        where: { id: installment.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Create Repayment entity
      const repayment = await tx.repayment.create({
        data: {
          loanId: installment.loanId,
          installmentId: installment.id,
          amount: installmentAmount.toFixed(4),
          status: 'PAID',
          paymentMethod: 'WALLET',
        },
      });

      // Reduce loan outstanding balance
      const newOutstanding = Money.subtract(installment.loan.outstandingAmount.toString(), installmentAmount);
      const isLoanCompleted = newOutstanding.lessThanOrEqualTo(0);

      await tx.loan.update({
        where: { id: installment.loanId },
        data: {
          outstandingAmount: Math.max(0, newOutstanding.toNumber()).toFixed(4),
          status: isLoanCompleted ? 'COMPLETED' : installment.loan.status,
        },
      });

      // Record transaction in ledger
      const referenceNumber = 'REPAY-' + installment.id.slice(-8).toUpperCase();
      await tx.transaction.create({
        data: {
          referenceNumber,
          walletId: wallet.id,
          type: 'PAYMENT',
          status: 'COMPLETED',
          amount: installmentAmount.toFixed(4),
          currency: 'USD',
          description: `Loan Repayment - #${installment.loan.loanNumber} (Installment ${installment.installmentNumber})`,
        },
      });

      return { repayment, isLoanCompleted };
    });

    await AuditService.log({
      userId,
      action: 'LOAN_INSTALLMENT_REPAID',
      entityType: 'Repayment',
      entityId: result.repayment.id,
      details: { installmentId: dto.installmentId, amount: dto.amount },
      req,
    });

    return {
      message: result.isLoanCompleted
        ? 'Final installment paid! Loan is now fully completed.'
        : `Installment #${installment.installmentNumber} paid successfully.`,
      repayment: result.repayment,
    };
  }
}
