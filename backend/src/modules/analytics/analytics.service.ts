import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';

export class AnalyticsService {
  /**
   * Aggregate comprehensive financial analytics for customer dashboard
   */
  static async getFinancialAnalytics(userId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();

    // 1. Fetch Incomes & Expenses for current year
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const [incomes, expenses, categories, goals, wallet] = await Promise.all([
      prisma.income.findMany({
        where: { userId, date: { gte: startOfYear, lte: endOfYear } },
      }),
      prisma.expense.findMany({
        where: { userId, date: { gte: startOfYear, lte: endOfYear } },
        include: { category: true },
      }),
      prisma.expenseCategory.findMany(),
      prisma.savingsGoal.findMany({ where: { userId } }),
      prisma.wallet.findFirst({
        where: { userId },
        include: { balances: true },
      }),
    ]);

    // Monthly breakdown (Jan - Dec)
    const monthlyCashflow = Array.from({ length: 12 }, (_, i) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = i;

      const monthIncomes = incomes.filter((inc) => new Date(inc.date).getMonth() === monthIndex);
      const monthExpenses = expenses.filter((exp) => new Date(exp.date).getMonth() === monthIndex);

      const totalInc = monthIncomes.reduce((acc, inc) => Money.add(acc, inc.amount.toString()), Money.parse(0));
      const totalExp = monthExpenses.reduce((acc, exp) => Money.add(acc, exp.amount.toString()), Money.parse(0));
      const netSavings = Money.subtract(totalInc, totalExp);

      return {
        month: monthNames[i],
        income: totalInc.toNumber(),
        expenses: totalExp.toNumber(),
        netSavings: netSavings.toNumber(),
      };
    });

    // Spending by category breakdown
    const categorySpending = categories.map((cat) => {
      const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
      const total = catExpenses.reduce((acc, e) => Money.add(acc, e.amount.toString()), Money.parse(0));
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color || '#3b82f6',
        amount: total.toNumber(),
        count: catExpenses.length,
      };
    }).filter((c) => c.amount > 0);

    const totalIncomeAll = incomes.reduce((acc, inc) => Money.add(acc, inc.amount.toString()), Money.parse(0));
    const totalExpensesAll = expenses.reduce((acc, exp) => Money.add(acc, exp.amount.toString()), Money.parse(0));
    const totalSavedInGoals = goals.reduce((acc, g) => Money.add(acc, g.currentAmount.toString()), Money.parse(0));

    const totalWalletBalance = wallet?.balances?.reduce((acc, b) => Money.add(acc, b.currentBalance.toString()), Money.parse(0)) || Money.parse(0);

    return {
      summary: {
        totalIncome: totalIncomeAll.toNumber(),
        totalExpenses: totalExpensesAll.toNumber(),
        totalSavedInGoals: totalSavedInGoals.toNumber(),
        netLiquidWorth: Money.add(totalWalletBalance, totalSavedInGoals).toNumber(),
        savingsRatePercentage: totalIncomeAll.greaterThan(0)
          ? Math.round(Money.subtract(totalIncomeAll, totalExpensesAll).dividedBy(totalIncomeAll).toNumber() * 100)
          : 0,
      },
      monthlyCashflow,
      categorySpending,
    };
  }
}
