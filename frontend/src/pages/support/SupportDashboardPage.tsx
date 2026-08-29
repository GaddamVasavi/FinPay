import React, { useState, useEffect } from 'react';
import { SupportService } from '../../services/support.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const SupportDashboardPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [form, setForm] = useState({
    subject: 'Assistance with Card Authorization Failure',
    message: 'My virtual card was declined during checkout on AWS despite sufficient balance.',
    category: 'CARD_ISSUE',
    priority: 'MEDIUM',
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await SupportService.getAllTickets();
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await SupportService.createTicket(form);
      if (res.success) {
        setFeedback('New support ticket submitted successfully.');
        setIsCreateModalOpen(false);
        fetchTickets();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const res = await SupportService.updateTicket(ticketId, { status });
      if (res.success) {
        setFeedback(`Ticket #${ticketId.slice(-6)} marked as ${status}`);
        setSelectedTicket(null);
        fetchTickets();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Support Center & Ticketing Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Resolve customer queries, escalate payment issues, and manage SLAs.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
          New Support Ticket
        </Button>
      </div>

      {feedback && <Alert type="success" message={feedback} className="mb-4" />}

      {/* Tickets List */}
      <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Active Helpdesk Queue ({tickets.length})
          </h3>
        </div>

        {tickets.map((t) => (
          <div key={t.id} className="p-4 flex items-start justify-between text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-400">#{t.ticketNumber}</span>
                <h4 className="font-bold text-slate-900 dark:text-white">{t.subject}</h4>
                <Badge variant={t.priority === 'HIGH' ? 'danger' : 'neutral'} size="sm">
                  {t.priority}
                </Badge>
                <Badge
                  variant={
                    t.status === 'RESOLVED'
                      ? 'success'
                      : t.status === 'IN_PROGRESS'
                      ? 'info'
                      : 'warning'
                  }
                  size="sm"
                >
                  {t.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 max-w-xl">{t.message}</p>
              <div className="text-[11px] text-slate-400 flex gap-4 pt-1">
                <span>Customer: {t.user?.email || 'Registered User'}</span>
                <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {t.status === 'OPEN' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs py-1"
                  onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                >
                  Start Progress
                </Button>
              )}
              {t.status !== 'RESOLVED' && (
                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs py-1"
                  onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
                >
                  Resolve Ticket
                </Button>
              )}
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8">No support tickets found.</p>
        )}
      </Card>

      {/* New Ticket Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Open Support Ticket">
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Input
            label="Subject"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
              >
                <option value="ACCOUNT">Account Access</option>
                <option value="CARD_ISSUE">Virtual Card Issue</option>
                <option value="PAYMENT">Payment Failure</option>
                <option value="SECURITY">Security / Fraud</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Detailed Message</label>
            <textarea
              rows={4}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2 text-sm"
            />
          </div>
          <Button type="submit" className="w-full">
            Submit Support Request
          </Button>
        </form>
      </Modal>
    </div>
  );
};
