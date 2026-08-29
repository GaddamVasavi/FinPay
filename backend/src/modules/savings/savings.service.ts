import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';

export class SavingsService {
  /**
   * Create target-oriented savings goal
   */
  static async createGoal(
    userId: string,
    dto: {
      name: string;
      targetAmount: number;
      targetDate: string;
      currency?: string;
      color?: string;
    },
    req?: any
  ) {
    const targetDec = Money.parse(dto.targetAmount);
    const targetDate = new Date(dto.targetDate);

    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: targetDec.toFixed(4),
        currentAmount: '0.0000',
        targetDate,
        currency: dto.currency || 'USD',
        color: dto.color || '#0ea5e9',
        isCompleted: false,
      },
    });

    await AuditService.log({
      userId,
      action: 'SAVINGS_GOAL_CREATED',
      entityType: 'SavingsGoal',
      entityId: goal.id,
      details: { name: goal.name, targetAmount: dto.targetAmount },
      req,
    });

    return goal;
  }

  /**
   * Get all user savings goals with contribution logs and percentage progress
   */
  static async getGoals(userId: string) {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((g) => {
      const current = Money.parse(g.currentAmount.toString());
      const target = Money.parse(g.targetAmount.toString());
      const percentage = target.greaterThan(0)
        ? Math.min(100, Math.round(current.dividedBy(target).toNumber() * 100))
        : 0;

      return {
        ...g,
        progressPercentage: percentage,
        remainingAmount: Math.max(0, Money.subtract(target, current).toNumber()).toFixed(2),
      };
    });
  }

  /**
   * Contribute money from wallet into savings goal
   */
  static async contribute(
    userId: string,
    goalId: string,
    dto: { amount: number; note?: string },
    req?: any
  ) {
    const amountDec = Money.parse(dto.amount);

    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new ApiError('Savings goal not found', 404, 'NOT_FOUND');
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
      include: { balances: true },
    });

    if (!wallet) {
      throw new ApiError('Wallet not found', 404, 'NO_WALLET');
    }

    const balRecord = wallet.balances.find((b) => b.currency === goal.currency)!;
    const avail = Money.parse(balRecord.availableBalance.toString());

    if (amountDec.greaterThan(avail)) {
      throw new ApiError('Insufficient available funds in wallet to contribute to goal', 400, 'INSUFFICIENT_FUNDS');
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct from available wallet balance, move to locked balance
      const newAvail = Money.subtract(balRecord.availableBalance.toString(), amountDec);
      const newLocked = Money.add(balRecord.lockedBalance.toString(), amountDec);

      await tx.walletBalance.update({
        where: { id: balRecord.id },
        data: {
          availableBalance: newAvail.toFixed(4),
          lockedBalance: newLocked.toFixed(4),
        },
      });

      // 2. Increase goal current amount
      const newGoalAmount = Money.add(goal.currentAmount.toString(), amountDec);
      const isCompleted = newGoalAmount.greaterThanOrEqualTo(goal.targetAmount.toString());

      const updatedGoal = await tx.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: newGoalAmount.toFixed(4),
          isCompleted,
        },
      });

      // 3. Record contribution
      const contribution = await tx.savingsContribution.create({
        data: {
          savingsGoalId: goalId,
          amount: amountDec.toFixed(4),
          type: 'DEPOSIT',
          note: dto.note || 'Manual Contribution',
        },
      });

      return { updatedGoal, contribution };
    });

    await AuditService.log({
      userId,
      action: 'SAVINGS_CONTRIBUTION',
      entityType: 'SavingsContribution',
      entityId: result.contribution.id,
      details: { goalId, amount: dto.amount },
      req,
    });

    return {
      message: `Contributed ${Money.formatDisplay(amountDec, goal.currency)} to ${goal.name}!`,
      goal: result.updatedGoal,
      contribution: result.contribution,
    };
  }

  /**
   * Withdraw money back from savings goal to wallet
   */
  static async withdraw(
    userId: string,
    goalId: string,
    dto: { amount: number; note?: string },
    req?: any
  ) {
    const amountDec = Money.parse(dto.amount);

    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new ApiError('Savings goal not found', 404, 'NOT_FOUND');
    }

    const currentInGoal = Money.parse(goal.currentAmount.toString());
    if (amountDec.greaterThan(currentInGoal)) {
      throw new ApiError('Withdrawal amount exceeds available saved funds in this goal', 400, 'INSUFFICIENT_FUNDS');
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
      include: { balances: true },
    });

    const balRecord = wallet!.balances.find((b) => b.currency === goal.currency)!;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Move locked balance back to available balance in wallet
      const newAvail = Money.add(balRecord.availableBalance.toString(), amountDec);
      const newLocked = Money.subtract(balRecord.lockedBalance.toString(), amountDec);

      await tx.walletBalance.update({
        where: { id: balRecord.id },
        data: {
          availableBalance: newAvail.toFixed(4),
          lockedBalance: newLocked.toFixed(4),
        },
      });

      // 2. Decrease goal amount
      const newGoalAmount = Money.subtract(goal.currentAmount.toString(), amountDec);
      const updatedGoal = await tx.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: newGoalAmount.toFixed(4),
          isCompleted: false,
        },
      });

      // 3. Record contribution withdrawal
      const contribution = await tx.savingsContribution.create({
        data: {
          savingsGoalId: goalId,
          amount: amountDec.toFixed(4),
          type: 'WITHDRAWAL',
          note: dto.note || 'Withdrawal to Wallet',
        },
      });

      return { updatedGoal, contribution };
    });

    await AuditService.log({
      userId,
      action: 'SAVINGS_WITHDRAWAL',
      entityType: 'SavingsContribution',
      entityId: result.contribution.id,
      details: { goalId, amount: dto.amount },
      req,
    });

    return {
      message: `Withdrew ${Money.formatDisplay(amountDec, goal.currency)} from ${goal.name} back to wallet.`,
      goal: result.updatedGoal,
    };
  }
}
