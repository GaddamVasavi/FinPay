import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';

export class BudgetingService {
  /**
   * Get all system expense categories
   */
  static async getCategories() {
    return prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Record a new personal expense
   */
  static async addExpense(
    userId: string,
    dto: {
      categoryId: string;
      amount: number;
      currency?: string;
      date: string;
      description: string;
      isRecurring?: boolean;
    },
    req?: any
  ) {
    const amountDec = Money.parse(dto.amount);
    const date = new Date(dto.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const expense = await prisma.$transaction(async (tx) => {
      const exp = await tx.expense.create({
        data: {
          userId,
          categoryId: dto.categoryId,
          amount: amountDec.toFixed(4),
          currency: dto.currency || 'USD',
          date,
          description: dto.description,
          isRecurring: dto.isRecurring || false,
        },
        include: { category: true },
      });

      // Update current month budget category spent amount if budget exists
      const budget = await tx.budget.findUnique({
        where: {
          userId_month_year: {
            userId,
            month,
            year,
          },
        },
        include: { categories: true },
      });

      if (budget) {
        const catBudget = budget.categories.find((c) => c.categoryId === dto.categoryId);
        if (catBudget) {
          const newCatSpent = Money.add(catBudget.spent.toString(), amountDec);
          await tx.budgetCategory.update({
            where: { id: catBudget.id },
            data: { spent: newCatSpent.toFixed(4) },
          });

          // If over 85% limit, trigger alert
          const limitDec = Money.parse(catBudget.limit.toString());
          const ratio = newCatSpent.dividedBy(limitDec).toNumber();
          if (ratio >= 0.85) {
            await tx.notification.create({
              data: {
                userId,
                title: 'Budget Alert: Threshold Warning',
                message: `You have spent ${(ratio * 100).toFixed(0)}% of your ${exp.category.name} monthly budget.`,
                type: 'BUDGET',
              },
            });
          }
        }

        const newTotalSpent = Money.add(budget.totalSpent.toString(), amountDec);
        await tx.budget.update({
          where: { id: budget.id },
          data: { totalSpent: newTotalSpent.toFixed(4) },
        });
      }

      return exp;
    });

    await AuditService.log({
      userId,
      action: 'EXPENSE_RECORDED',
      entityType: 'Expense',
      entityId: expense.id,
      details: { amount: dto.amount, category: expense.category.name },
      req,
    });

    return expense;
  }

  /**
   * Get user expenses with category metadata
   */
  static async getExpenses(userId: string, month?: number, year?: number) {
    const where: any = { userId };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }

    return prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Record personal income source
   */
  static async addIncome(
    userId: string,
    dto: {
      source: string;
      amount: number;
      currency?: string;
      date: string;
      category?: string;
      isRecurring?: boolean;
      description?: string;
    },
    req?: any
  ) {
    const amountDec = Money.parse(dto.amount);
    const date = new Date(dto.date);

    const income = await prisma.income.create({
      data: {
        userId,
        source: dto.source,
        amount: amountDec.toFixed(4),
        currency: dto.currency || 'USD',
        date,
        category: dto.category || 'Salary',
        isRecurring: dto.isRecurring || false,
        description: dto.description || null,
      },
    });

    await AuditService.log({
      userId,
      action: 'INCOME_RECORDED',
      entityType: 'Income',
      entityId: income.id,
      details: { source: dto.source, amount: dto.amount },
      req,
    });

    return income;
  }

  /**
   * Get user incomes
   */
  static async getIncomes(userId: string) {
    return prisma.income.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Create or update monthly category budget
   */
  static async setBudget(
    userId: string,
    dto: {
      name: string;
      month: number;
      year: number;
      categories: Array<{ categoryId: string; limit: number }>;
    },
    req?: any
  ) {
    const totalLimit = dto.categories.reduce((acc, c) => {
      return Money.add(acc, c.limit);
    }, Money.parse(0));

    // Calculate existing spent in this month
    const start = new Date(dto.year, dto.month - 1, 1);
    const end = new Date(dto.year, dto.month, 0, 23, 59, 59);

    const monthlyExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
    });

    const budget = await prisma.$transaction(async (tx) => {
      const b = await tx.budget.upsert({
        where: {
          userId_month_year: {
            userId,
            month: dto.month,
            year: dto.year,
          },
        },
        update: {
          name: dto.name,
          totalLimit: totalLimit.toFixed(4),
        },
        create: {
          userId,
          name: dto.name,
          month: dto.month,
          year: dto.year,
          totalLimit: totalLimit.toFixed(4),
          totalSpent: '0.0000',
        },
      });

      let totalSpentAcc = Money.parse(0);

      // Create/Update category allocations
      for (const cat of dto.categories) {
        const catExpenses = monthlyExpenses.filter((e) => e.categoryId === cat.categoryId);
        const catSpent = catExpenses.reduce((acc, e) => Money.add(acc, e.amount.toString()), Money.parse(0));
        totalSpentAcc = Money.add(totalSpentAcc, catSpent);

        await tx.budgetCategory.upsert({
          where: {
            budgetId_categoryId: {
              budgetId: b.id,
              categoryId: cat.categoryId,
            },
          },
          update: {
            limit: Money.parse(cat.limit).toFixed(4),
            spent: catSpent.toFixed(4),
          },
          create: {
            budgetId: b.id,
            categoryId: cat.categoryId,
            limit: Money.parse(cat.limit).toFixed(4),
            spent: catSpent.toFixed(4),
          },
        });
      }

      await tx.budget.update({
        where: { id: b.id },
        data: { totalSpent: totalSpentAcc.toFixed(4) },
      });

      return tx.budget.findUnique({
        where: { id: b.id },
        include: {
          categories: {
            include: { category: true },
          },
        },
      });
    });

    await AuditService.log({
      userId,
      action: 'BUDGET_UPDATED',
      entityType: 'Budget',
      entityId: budget?.id,
      req,
    });

    return budget;
  }

  /**
   * Get budget for specific month and year
   */
  static async getBudget(userId: string, month: number, year: number) {
    return prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });
  }
}
