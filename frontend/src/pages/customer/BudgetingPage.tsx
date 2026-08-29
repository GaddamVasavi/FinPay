import React, { useState, useEffect } from 'react';
import { BudgetService } from '../../services/budget.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import {
  PieChart,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Layers,
} from 'lucide-react';

export const BudgetingPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Expense Form
  const [expenseForm, setExpenseForm] = useState({
    categoryId: '',
    amount: '45.00',
    date: new Date().toISOString().split('T')[0],
    description: 'Grocery Run at Trader Joes',
  });

  // Income Form
  const [incomeForm, setIncomeForm] = useState({
    source: 'TechCorp Consulting',
    amount: '3200',
    date: new Date().toISOString().split('T')[0],
    category: 'Consulting',
    description: 'Bi-weekly invoice payment',
  });

  // Budget Setup Form
  const [budgetLimit, setBudgetLimit] = useState('4000');

  const fetchData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const [catRes, expRes, incRes, bRes] = await Promise.all([
        BudgetService.getCategories(),
        BudgetService.getExpenses(now.getMonth() + 1, now.getFullYear()),
        BudgetService.getIncomes(),
        BudgetService.getBudget(now.getFullYear(), now.getMonth() + 1),
      ]);

      if (catRes.success) {
        setCategories(catRes.data);
        if (!expenseForm.categoryId && catRes.data.length > 0) {
          setExpenseForm((prev) => ({ ...prev, categoryId: catRes.data[0].id }));
        }
      }
      if (expRes.success) setExpenses(expRes.data);
      if (incRes.success) setIncomes(incRes.data);
      if (bRes.success) setBudget(bRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await BudgetService.addExpense({
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
      });
      if (res.success) {
        setIsExpenseModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await BudgetService.addIncome({
        ...incomeForm,
        amount: parseFloat(incomeForm.amount),
      });
      if (res.success) {
        setIsIncomeModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date();
      const perCatLimit = (parseFloat(budgetLimit) / Math.max(1, categories.length)).toFixed(2);
      const catAllocations = categories.map((c) => ({
        categoryId: c.id,
        limit: parseFloat(perCatLimit),
      }));

      const res = await BudgetService.setBudget({
        name: 'Monthly Operating Budget',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        categories: catAllocations,
      });

      if (res.success) {
        setIsBudgetModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalMonthlyExpense = expenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const totalMonthlyIncome = incomes.reduce((acc, inc) => acc + parseFloat(inc.amount), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Personal Budgeting & Expense Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Categorize daily spending, set strict threshold limits, and manage cash flow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ArrowDownLeft className="w-4 h-4" />}
            onClick={() => setIsIncomeModalOpen(true)}
          >
            + Add Income
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsExpenseModalOpen(true)}
          >
            + Record Expense
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-emerald-500 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Total Income Recorded</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            +${totalMonthlyIncome.toFixed(2)}
          </div>
          <span className="text-xs text-slate-500">Across active income streams</span>
        </Card>

        <Card className="border-l-4 border-l-rose-500 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Monthly Expenses</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            -${totalMonthlyExpense.toFixed(2)}
          </div>
          <span className="text-xs text-slate-500">{expenses.length} transactions this month</span>
        </Card>

        <Card className="border-l-4 border-l-finpay-500 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Net Monthly Savings</span>
          <div className="text-2xl font-extrabold text-finpay-600 dark:text-finpay-400">
            +${Math.max(0, totalMonthlyIncome - totalMonthlyExpense).toFixed(2)}
          </div>
          <span className="text-xs text-emerald-500 font-medium">Positive Cash Flow</span>
        </Card>
      </div>

      {/* Monthly Budget Category Progress */}
      <Card className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Category Budget Limits (August 2026)
            </h3>
            <p className="text-xs text-slate-400">Real-time spend against planned allocations</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsBudgetModalOpen(true)}>
            Adjust Budget
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const catSpent = expenses
              .filter((e) => e.categoryId === cat.id)
              .reduce((acc, e) => acc + parseFloat(e.amount), 0);
            const limit = 400.0;
            const percentage = Math.min(100, Math.round((catSpent / limit) * 100));
            const isNearLimit = percentage >= 80;

            return (
              <div key={cat.id} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                    {cat.name}
                  </span>
                  <span className="font-medium text-slate-500">
                    ${catSpent.toFixed(2)} / ${limit.toFixed(2)} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentage >= 90 ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-finpay-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Expenses List */}
      <Card className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Expenses</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {expenses.map((exp) => (
            <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  -
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{exp.description}</h5>
                  <span className="text-slate-400">{exp.category?.name} • {new Date(exp.date).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="font-bold text-rose-500 text-sm">-${parseFloat(exp.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Record Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Record Personal Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Input
            label="Expense Description"
            required
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount ($ USD)"
              type="number"
              step="0.01"
              required
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={expenseForm.categoryId}
                onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Date"
            type="date"
            required
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
          />
          <Button type="submit" className="w-full">
            Save Expense
          </Button>
        </form>
      </Modal>

      {/* Add Income Modal */}
      <Modal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} title="Record Income Source">
        <form onSubmit={handleAddIncome} className="space-y-4">
          <Input
            label="Source / Payer"
            required
            value={incomeForm.source}
            onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
          />
          <Input
            label="Income Amount ($ USD)"
            type="number"
            required
            value={incomeForm.amount}
            onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
            leftIcon={<DollarSign className="w-4 h-4" />}
          />
          <Input
            label="Date Received"
            type="date"
            required
            value={incomeForm.date}
            onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
          />
          <Button type="submit" className="w-full">
            Record Income
          </Button>
        </form>
      </Modal>

      {/* Set Monthly Budget Modal */}
      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="Set Monthly Budget Limit">
        <form onSubmit={handleSetBudget} className="space-y-4">
          <Input
            label="Total Monthly Budget Cap ($ USD)"
            type="number"
            required
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
          />
          <p className="text-xs text-slate-400">
            This amount will be distributed across your {categories.length} active spending categories with threshold alerts at 85%.
          </p>
          <Button type="submit" className="w-full">
            Apply Monthly Budget
          </Button>
        </form>
      </Modal>
    </div>
  );
};
