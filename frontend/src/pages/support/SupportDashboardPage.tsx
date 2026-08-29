import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  LifeBuoy,
  MessageSquare,
  ShieldAlert,
  CheckCircle,
  Clock,
  Search,
} from 'lucide-react';
import { Input } from '../../components/common/Input';

export const SupportDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Customer Support & Dispute Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Resolve customer inquiries, handle payment dispute investigations, and manage support tickets.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input placeholder="Search ticket or customer..." leftIcon={<Search className="w-4 h-4" />} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-slate-800/90 border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Open Tickets</span>
            <MessageSquare className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">8 Assigned</div>
          <p className="text-xs text-sky-400 font-medium">3 High Priority</p>
        </Card>

        <Card className="bg-slate-800/90 border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Active Disputes</span>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">2 Under Review</div>
          <p className="text-xs text-slate-400">Avg resolution: 24h</p>
        </Card>

        <Card className="bg-slate-800/90 border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Resolved Today</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">19 Cases</div>
          <p className="text-xs text-emerald-400 font-medium">100% SLA compliance</p>
        </Card>
      </div>

      {/* Ticket Queue */}
      <Card className="bg-slate-800/90 border-slate-700 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Support Ticket Queue
          </h3>
          <span className="text-xs text-slate-400">Live Agent Feed</span>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 'TICK-402',
              customer: 'Robert Taylor',
              subject: 'Wallet withdrawal pending confirmation',
              priority: 'HIGH',
              status: 'OPEN',
              time: '14 mins ago',
            },
            {
              id: 'TICK-401',
              customer: 'Clara Bennett',
              subject: 'Virtual card international authorization issue',
              priority: 'MEDIUM',
              status: 'IN_PROGRESS',
              time: '1 hour ago',
            },
            {
              id: 'TICK-400',
              customer: 'Michael Chang',
              subject: 'KYC Document verification re-submission query',
              priority: 'LOW',
              status: 'OPEN',
              time: '3 hours ago',
            },
          ].map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-300">{ticket.id}</span>
                  <Badge variant={ticket.priority === 'HIGH' ? 'danger' : 'warning'} size="sm">
                    {ticket.priority}
                  </Badge>
                  <span className="text-xs text-slate-400">• {ticket.customer}</span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1">{ticket.subject}</h4>
                <span className="text-[11px] text-slate-500">Submitted {ticket.time}</span>
              </div>
              <Button size="sm" variant="primary">
                Open Ticket Desk
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
