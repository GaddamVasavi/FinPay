import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  CreditCard,
  PieChart,
  ShieldCheck,
  PiggyBank,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hello, {user?.firstName || 'Customer'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your financial portfolio summary and digital wallet overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/transfers">
            <Button size="sm" variant="outline" leftIcon={<Send className="w-4 h-4" />}>
              Send Money
            </Button>
          </Link>
          <Link to="/wallet">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Funds
            </Button>
          </Link>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Wallet Balance */}
        <Card className="relative overflow-hidden border-l-4 border-l-finpay-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Wallet Balance
            </span>
            <div className="p-2 rounded-lg bg-finpay-500/10 text-finpay-500">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              $12,500.00
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Available: </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">$12,500.00 USD</span>
            </div>
          </div>
        </Card>

        {/* Monthly Income */}
        <Card className="relative overflow-hidden border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +$4,850.00
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% vs last month</span>
            </div>
          </div>
        </Card>

        {/* Monthly Expenses */}
        <Card className="relative overflow-hidden border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Spent
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              -$1,940.50
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Budget Used: </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">48.5%</span>
            </div>
          </div>
        </Card>

        {/* Savings Goals */}
        <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Saved
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              $6,200.00
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Across 3 active goals</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs font-semibold text-finpay-600 dark:text-finpay-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {[
              {
                id: 'tx-1',
                desc: 'Payroll Direct Deposit - TechCorp Inc',
                date: 'Today, 09:30 AM',
                amount: '+$3,400.00',
                type: 'credit',
                status: 'COMPLETED',
              },
              {
                id: 'tx-2',
                desc: 'Transfer to Sarah Jenkins',
                date: 'Yesterday, 04:15 PM',
                amount: '-$150.00',
                type: 'debit',
                status: 'COMPLETED',
              },
              {
                id: 'tx-3',
                desc: 'Whole Foods Market (Virtual Card)',
                date: 'Aug 27, 2026',
                amount: '-$84.20',
                type: 'debit',
                status: 'COMPLETED',
              },
              {
                id: 'tx-4',
                desc: 'Cloud Services Subscription',
                date: 'Aug 25, 2026',
                amount: '-$29.99',
                type: 'debit',
                status: 'COMPLETED',
              },
            ].map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'credit'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {tx.desc}
                    </p>
                    <span className="text-[11px] text-slate-400">{tx.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold block ${
                      tx.type === 'credit'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.amount}
                  </span>
                  <Badge variant="success" size="sm">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Sidebar: Active Cards & Budget Progress */}
        <div className="space-y-6">
          {/* Virtual Card Widget */}
          <Card className="space-y-4 bg-gradient-to-tr from-slate-900 via-navy-900 to-slate-950 text-white border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Virtual Debit Card</span>
              <span className="text-sky-400 font-bold">VISA</span>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-mono tracking-widest text-slate-200">
                4111 •••• •••• 1111
              </div>
              <div className="flex justify-between text-xs text-slate-400 pt-2">
                <span>{user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}</span>
                <span>EXP: 12/28</span>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <Link to="/cards" className="w-full">
                <Button size="sm" variant="secondary" className="w-full text-xs">
                  Manage Card Controls
                </Button>
              </Link>
            </div>
          </Card>

          {/* Budget Snapshot */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">August Budget</h4>
              <span className="text-xs text-slate-500 font-medium">$1,940 / $4,000</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-finpay-500 h-full rounded-full" style={{ width: '48.5%' }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              You are on track. $2,059.50 remaining for this month.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
