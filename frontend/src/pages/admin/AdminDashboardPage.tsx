import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Users,
  Wallet,
  Receipt,
  ShieldAlert,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Administrative Control Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          System-wide financial volume, user governance, risk anomalies, and KYC queues.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/90 border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Total Customers</span>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">1,420</div>
          <p className="text-xs text-emerald-400 font-medium">+48 new this week</p>
        </Card>

        <Card className="bg-slate-800/90 border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Total Payment Volume</span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">$4.82M</div>
          <p className="text-xs text-emerald-400 font-medium">99.8% Success Rate</p>
        </Card>

        <Card className="bg-slate-800/90 border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Pending KYC Reviews</span>
            <FileCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">14</div>
          <p className="text-xs text-slate-400">Avg review time: 18 mins</p>
        </Card>

        <Card className="bg-slate-800/90 border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Risk & Fraud Alerts</span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400">3 Open</div>
          <p className="text-xs text-rose-400 font-medium">1 High Severity</p>
        </Card>
      </div>

      {/* Admin Quick Action Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Alerts Queue */}
        <Card className="bg-slate-800/90 border-slate-700 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Active Risk & Monitoring Alerts
            </h3>
            <span className="text-xs text-slate-400">Rule-based detection</span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'RISK-104',
                rule: 'High Velocity Transfer Volume (> $10k in 1 hour)',
                user: 'demo.trader@finpay.local',
                severity: 'HIGH',
                time: '25 mins ago',
              },
              {
                id: 'RISK-103',
                rule: 'Repeated Failed Card Authorizations (5x in 2 mins)',
                user: 'john.smith@finpay.local',
                severity: 'MEDIUM',
                time: '2 hours ago',
              },
            ].map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-300">{alert.id}</span>
                    <Badge variant={alert.severity === 'HIGH' ? 'danger' : 'warning'} size="sm">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-200 mt-1">{alert.rule}</p>
                  <span className="text-[10px] text-slate-400">{alert.user} • {alert.time}</span>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* KYC Verification Queue */}
        <Card className="bg-slate-800/90 border-slate-700 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              Pending KYC Submissions
            </h3>
            <span className="text-xs text-slate-400">Verification workflow</span>
          </div>

          <div className="space-y-3">
            {[
              { id: 'KYC-881', name: 'Marcus Vance', doc: 'Passport', submitted: '10 mins ago' },
              { id: 'KYC-880', name: 'Elena Rostova', doc: 'National ID', submitted: '45 mins ago' },
              { id: 'KYC-879', name: 'David Chen', doc: 'Driving License', submitted: '1 hour ago' },
            ].map((k) => (
              <div
                key={k.id}
                className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{k.name}</h4>
                  <p className="text-xs text-slate-400">{k.doc} • Submitted {k.submitted}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary">Inspect</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
