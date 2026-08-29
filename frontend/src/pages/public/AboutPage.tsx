import React from 'react';
import { Card } from '../../components/common/Card';
import { ShieldCheck, Target, Heart, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          About FinPay
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Empowering individuals and teams with high-integrity financial tools, transparent accounting, and secure digital payments.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <Card className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p>
            FinPay was conceived to bridge the gap between traditional banking infrastructure and modern, intelligent personal finance. Our goal is to make managing multi-currency funds, tracking budgets, and executing digital transactions secure, clear, and effortless.
          </p>
          <p>
            We adhere strictly to financial security best practices: zero exposure of raw card numbers, deterministic decimal math without floating-point errors, automated rate limiting, and immutable double-entry ledger audits.
          </p>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <Card className="space-y-2">
            <div className="p-2.5 w-fit rounded-lg bg-sky-500/10 text-sky-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Security-First</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous session auditing, JWT rotation, and rule-based anomaly monitoring.
            </p>
          </Card>

          <Card className="space-y-2">
            <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-500">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Precision & Integrity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Strict numeric precision, database-level transactional locks, and idempotency guarantees.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
