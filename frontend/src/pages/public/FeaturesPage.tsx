import React from 'react';
import { Card } from '../../components/common/Card';
import {
  Wallet,
  ArrowLeftRight,
  CreditCard,
  PieChart,
  Target,
  ShieldCheck,
  Building,
  History,
  FileSpreadsheet,
  Cpu,
  Lock,
  Headphones,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const modules = [
    {
      icon: <Wallet className="w-6 h-6 text-finpay-500" />,
      title: 'Digital Wallets & Bank Integration',
      description:
        'Manage balances with multi-currency support, add and withdraw funds seamlessly, and securely link verified external bank accounts.',
    },
    {
      icon: <ArrowLeftRight className="w-6 h-6 text-sky-500" />,
      title: 'P2P Money Transfers & Payments',
      description:
        'Instant peer-to-peer transfers, recipient beneficiary directory, money payment requests, and recurring scheduled automated payments.',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-purple-500" />,
      title: 'Virtual Cards & Credit Lines',
      description:
        'Instant virtual card generation, customizable daily/monthly spending limits, card freeze/unfreeze toggles, and flexible credit facilities.',
    },
    {
      icon: <PieChart className="w-6 h-6 text-emerald-500" />,
      title: 'Personal Budgeting & Cash Flow',
      description:
        'Track categorized income and expenses, establish strict monthly budget thresholds, and inspect visual spending breakdowns.',
    },
    {
      icon: <Target className="w-6 h-6 text-amber-500" />,
      title: 'Goal-Oriented Savings',
      description:
        'Create target-based savings funds, automate recurring contributions, and visualize real-time progress toward milestones.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-500" />,
      title: 'Automated Risk & Fraud Guard',
      description:
        'Rule-based suspicious transaction detection, velocity checks, dispute resolution workflow, and immutable administrative audit logs.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          FinPay Platform Features
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          A comprehensive suite of financial management capabilities engineered for reliability, safety, and speed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((m, idx) => (
          <Card key={idx} hoverEffect className="space-y-3">
            <div className="p-3 w-fit rounded-xl bg-slate-100 dark:bg-slate-800/80">
              {m.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{m.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {m.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
