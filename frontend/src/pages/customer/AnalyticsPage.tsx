import React, { useState, useEffect } from 'react';
import { AnalyticsService } from '../../services/analytics.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await AnalyticsService.getOverview();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const sampleCashflow = data?.monthlyCashflow || [
    { month: 'Jan', income: 4500, expenses: 2100, netSavings: 2400 },
    { month: 'Feb', income: 4600, expenses: 1950, netSavings: 2650 },
    { month: 'Mar', income: 4800, expenses: 2300, netSavings: 2500 },
    { month: 'Apr', income: 4500, expenses: 2000, netSavings: 2500 },
    { month: 'May', income: 5200, expenses: 2400, netSavings: 2800 },
    { month: 'Jun', income: 5000, expenses: 2100, netSavings: 2900 },
    { month: 'Jul', income: 4900, expenses: 1850, netSavings: 3050 },
    { month: 'Aug', income: 5400, expenses: 1940, netSavings: 3460 },
  ];

  const sampleCategory = data?.categorySpending?.length > 0
    ? data.categorySpending
    : [
        { name: 'Food & Dining', amount: 620, color: '#EF4444' },
        { name: 'Housing & Rent', amount: 1400, color: '#3B82F6' },
        { name: 'Transportation', amount: 240, color: '#F59E0B' },
        { name: 'Entertainment', amount: 180, color: '#8B5CF6' },
        { name: 'Utilities', amount: 190, color: '#10B981' },
      ];

  const summary = data?.summary || {
    totalIncome: 39800,
    totalExpenses: 16640,
    totalSavedInGoals: 6200,
    netLiquidWorth: 18700,
    savingsRatePercentage: 58,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Financial Analytics & Cash Flow Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Visual insights into annual cash flow, savings velocity, and categorized expenditure trends.
        </p>
      </div>

      {/* Top Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-finpay-500 space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Total Net Worth</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${summary.netLiquidWorth?.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">Liquid balances + Goal funds</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Savings Rate</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summary.savingsRatePercentage}%
          </div>
          <p className="text-xs text-emerald-500 font-medium">Above recommended 20%</p>
        </Card>

        <Card className="border-l-4 border-l-purple-500 space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Annual Inflows</span>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            ${summary.totalIncome?.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">YTD total earnings</p>
        </Card>

        <Card className="border-l-4 border-l-rose-500 space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Annual Outflows</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            ${summary.totalExpenses?.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">YTD cumulative spend</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Cashflow Bar Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Income vs Expenses (Monthly Breakdown)
            </h3>
            <Badge variant="info">2026 YTD</Badge>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleCashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Income ($)" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses ($)" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card className="space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Spending by Category
            </h3>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sampleCategory}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {sampleCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 text-xs">
            {sampleCategory.slice(0, 4).map((c: any) => (
              <div key={c.name} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">${c.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Net Savings Trend Area Chart */}
      <Card className="space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Net Savings Accumulation Trend
          </h3>
        </div>
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampleCashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="netSavings" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
