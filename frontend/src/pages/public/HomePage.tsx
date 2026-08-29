import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  CreditCard,
  PieChart,
  Lock,
  Globe2,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-finpay-500/10 border border-finpay-500/20 text-finpay-600 dark:text-finpay-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" /> Next-Generation Fintech Architecture
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Smart Personal Finance & <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-finpay-500 to-sky-400">
            Digital Multi-Currency Payments
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Manage digital wallets, execute instant P2P transfers, generate virtual cards, budget monthly spending, and grow savings goals from a single secure platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Open Free Account
            </Button>
          </Link>
          <Link to="/features">
            <Button variant="outline" size="lg">
              Explore All Features
            </Button>
          </Link>
        </div>

        {/* Hero Preview Card */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="relative rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-navy-900 p-2 sm:p-4 shadow-2xl border border-slate-700/60">
            <div className="bg-slate-950/80 rounded-xl p-6 text-left space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Primary Wallet Balance</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1">$12,500.00 <span className="text-sm font-normal text-slate-400">USD</span></div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> KYC Verified
                  </span>
                  <span className="px-3 py-1 bg-finpay-500/10 text-finpay-400 border border-finpay-500/20 text-xs font-semibold rounded-full">
                    Active Wallet
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Monthly Income</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">+$4,850.00</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Monthly Spent</div>
                  <div className="text-base font-bold text-rose-400 mt-0.5">-$1,940.50</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Active Goals</div>
                  <div className="text-base font-bold text-sky-400 mt-0.5">3 ($6,200)</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Virtual Cards</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">2 Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Everything you need in modern financial software
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Built from the ground up with high performance, double-entry transaction safety, and strict regulatory compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-finpay-500/10 text-finpay-500 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Instant Money Transfers</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Transfer funds between users with zero delay, idempotency protection against duplicate charges, and instant receipt generation.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Virtual & Credit Cards</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Create virtual cards with customizable spending limits, real-time lock/freeze controls, and zero raw credential exposure.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Budgeting & Goal Tracking</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Set monthly category budgets, track cash-flow trends, receive overspending alerts, and automate target savings contributions.
            </p>
          </Card>
        </div>
      </section>

      {/* Security & Reliability Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 p-8 sm:p-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Enterprise-Grade Financial Security
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              We employ strict role-based access, JWT refresh token rotation, rule-based fraud detection, double-entry financial ledgers, and comprehensive immutable audit logging.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> PostgreSQL Decimal Integrity</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Idempotent API Keys</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tokenized Card Security</span>
            </div>
          </div>
          <Link to="/register">
            <Button size="lg" variant="primary">
              Join FinPay Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
