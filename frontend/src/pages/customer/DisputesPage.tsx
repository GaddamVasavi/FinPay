import React, { useState, useEffect } from 'react';
import { DisputeService } from '../../services/dispute.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { ShieldAlert, Plus, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const DisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [form, setForm] = useState({
    transactionId: '',
    reason: 'UNAUTHORIZED_CHARGE',
    description: 'I did not recognize this transaction on my card statement.',
    evidenceUrl: 'https://finpay.local/evidence/receipt1.pdf',
  });

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await DisputeService.getUserDisputes();
      if (res.success) {
        setDisputes(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await DisputeService.createDispute(form);
      if (res.success) {
        setFeedback('Dispute submitted to Compliance Resolution Desk.');
        setIsModalOpen(false);
        fetchDisputes();
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit dispute');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Disputes & Transaction Claims
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Formally contest unauthorized charges, duplicate billings, or unfulfilled merchant orders.
          </p>
        </div>
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          File New Dispute
        </Button>
      </div>

      {feedback && <Alert type="success" message={feedback} className="mb-4" />}

      <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Your Filed Disputes ({disputes.length})
          </h3>
        </div>

        {disputes.map((d) => (
          <div key={d.id} className="p-4 flex items-start justify-between text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{d.reason}</h4>
                <Badge
                  variant={
                    d.status === 'RESOLVED'
                      ? 'success'
                      : d.status === 'OPEN'
                      ? 'warning'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {d.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">{d.description}</p>
              <div className="text-[11px] text-slate-400 pt-1">
                <span>Transaction Ref: <span className="font-mono">{d.transaction?.referenceNumber}</span></span>
                <span className="mx-2">•</span>
                <span>Filed: {new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}

        {disputes.length === 0 && !loading && (
          <p className="text-xs text-slate-400 text-center py-8">No disputes filed.</p>
        )}
      </Card>

      {/* File Dispute Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="File Transaction Dispute">
        <form onSubmit={handleCreateDispute} className="space-y-4">
          <Input
            label="Transaction ID (UUID)"
            required
            value={form.transactionId}
            onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dispute Reason</label>
            <select
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
            >
              <option value="UNAUTHORIZED_CHARGE">Unauthorized Charge</option>
              <option value="DUPLICATE_BILLING">Duplicate Billing</option>
              <option value="GOODS_NOT_RECEIVED">Goods / Services Not Received</option>
              <option value="INCORRECT_AMOUNT">Incorrect Charge Amount</option>
            </select>
          </div>
          <Input
            label="Detailed Explanation"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Supporting Evidence URL (Optional)"
            value={form.evidenceUrl}
            onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })}
          />
          <Button type="submit" className="w-full">
            Submit Dispute Claim
          </Button>
        </form>
      </Modal>
    </div>
  );
};
