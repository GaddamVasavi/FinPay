import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TransferService } from '../../services/transfer.service';
import { BeneficiaryService } from '../../services/beneficiary.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import {
  ArrowLeftRight,
  Send,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  ShieldCheck,
  FileText,
  DollarSign,
  Plus,
  Trash2,
} from 'lucide-react';

export const TransfersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRecipient = searchParams.get('recipient') || '';

  const [activeTab, setActiveTab] = useState<'SEND' | 'REQUEST' | 'SCHEDULED' | 'HISTORY'>('SEND');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [requests, setRequests] = useState<{ sent: any[]; received: any[] }>({ sent: [], received: [] });
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Send Transfer State
  const [sendForm, setSendForm] = useState({
    recipientEmail: initialRecipient || 'support@finpay.local',
    amount: '150.00',
    currency: 'USD',
    note: 'Dinner split',
    saveBeneficiary: true,
  });
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<any>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Request Money State
  const [requestForm, setRequestForm] = useState({
    payerEmail: 'alex.morgan@finpay.local',
    amount: '75.00',
    currency: 'USD',
    description: 'Project reimbursement',
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Scheduled Payment Modal & State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    recipientName: 'Landlord Properties LLC',
    recipientAccount: 'FP-RENT-9921',
    amount: '1400',
    currency: 'USD',
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    description: 'Monthly apartment rent',
  });

  // Receipt Modal State
  const [receiptModal, setReceiptModal] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, tRes, reqRes, schRes] = await Promise.all([
        BeneficiaryService.getAll(),
        TransferService.getHistory(),
        TransferService.getPaymentRequests(),
        TransferService.getScheduledPayments(),
      ]);

      if (bRes.success) setBeneficiaries(bRes.data);
      if (tRes.success) setTransfers(tRes.data);
      if (reqRes.success) setRequests(reqRes.data);
      if (schRes.success) setScheduled(schRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSendLoading(true);
      setSendError(null);
      const idempotencyKey = 'TRF-' + Math.random().toString(36).substring(2) + '-' + Date.now();
      const res = await TransferService.sendTransfer({
        recipientEmail: sendForm.recipientEmail,
        amount: parseFloat(sendForm.amount),
        currency: sendForm.currency,
        note: sendForm.note,
        idempotencyKey,
        saveBeneficiary: sendForm.saveBeneficiary,
      });

      if (res.success) {
        setSendSuccess(res.data);
        fetchData();
      }
    } catch (err: any) {
      setSendError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSendLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRequestLoading(true);
      const res = await TransferService.createPaymentRequest({
        payerEmail: requestForm.payerEmail,
        amount: parseFloat(requestForm.amount),
        currency: requestForm.currency,
        description: requestForm.description,
      });
      if (res.success) {
        setRequestSuccess('Money request sent successfully!');
        fetchData();
        setTimeout(() => setRequestSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      const res = await TransferService.acceptPaymentRequest(id);
      if (res.success) {
        alert('Payment request fulfilled!');
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Fulfillment error');
    }
  };

  const handleCreateScheduled = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await TransferService.createScheduledPayment({
        ...scheduleForm,
        amount: parseFloat(scheduleForm.amount),
      });
      if (res.success) {
        setIsScheduleModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelScheduled = async (id: string) => {
    if (!window.confirm('Cancel this recurring payment schedule?')) return;
    try {
      await TransferService.cancelScheduledPayment(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Transfers & Payments Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Instant peer-to-peer transfers, money requests, and automated scheduled payments.
        </p>
      </div>

      {/* Hub Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('SEND')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'SEND'
              ? 'bg-finpay-600 text-white shadow-md shadow-finpay-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Send Money
        </button>
        <button
          onClick={() => setActiveTab('REQUEST')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'REQUEST'
              ? 'bg-finpay-600 text-white shadow-md shadow-finpay-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Request Money
        </button>
        <button
          onClick={() => setActiveTab('SCHEDULED')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'SCHEDULED'
              ? 'bg-finpay-600 text-white shadow-md shadow-finpay-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Scheduled Recurring ({scheduled.filter((s) => s.isActive).length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-finpay-600 text-white shadow-md shadow-finpay-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Transfer Receipts
        </button>
      </div>

      {/* TAB 1: SEND MONEY WIZARD */}
      {activeTab === 'SEND' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-finpay-500" />
              Transfer Money to Recipient
            </h3>

            {sendError && <Alert type="danger" message={sendError} className="mb-4" onClose={() => setSendError(null)} />}

            {sendSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Transfer Executed Successfully!
                </h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  ${parseFloat(sendForm.amount).toFixed(2)} USD transferred to {sendSuccess.transfer?.recipientName} ({sendSuccess.transfer?.recipientEmail}).
                </p>
                <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl font-mono text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                  Ref: {sendSuccess.transfer?.referenceNumber}
                </div>
                <Button
                  onClick={() => {
                    setSendSuccess(null);
                    setSendForm({ ...sendForm, amount: '50.00', note: '' });
                  }}
                  variant="outline"
                >
                  Send Another Transfer
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendTransfer} className="space-y-4">
                {/* Beneficiary Quick-Select */}
                {beneficiaries.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Quick Recipient Select:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {beneficiaries.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSendForm({ ...sendForm, recipientEmail: b.email || '' })}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 transition-colors ${
                            sendForm.recipientEmail === b.email
                              ? 'border-finpay-500 bg-finpay-500/10 text-finpay-600 dark:text-finpay-400'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Input
                  label="Recipient Email Address"
                  type="email"
                  required
                  value={sendForm.recipientEmail}
                  onChange={(e) => setSendForm({ ...sendForm, recipientEmail: e.target.value })}
                  placeholder="support@finpay.local"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Transfer Amount"
                    type="number"
                    step="0.01"
                    min="1"
                    max="50000"
                    required
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
                    <select
                      value={sendForm.currency}
                      onChange={(e) => setSendForm({ ...sendForm, currency: e.target.value })}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Transfer Note / Memo"
                  value={sendForm.note}
                  onChange={(e) => setSendForm({ ...sendForm, note: e.target.value })}
                  placeholder="e.g. Rent share, Dinner reimbursement"
                />

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="saveB"
                    checked={sendForm.saveBeneficiary}
                    onChange={(e) => setSendForm({ ...sendForm, saveBeneficiary: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-700 text-finpay-500 focus:ring-finpay-500"
                  />
                  <label htmlFor="saveB" className="text-xs text-slate-600 dark:text-slate-400">
                    Save recipient into my Beneficiaries directory
                  </label>
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Transfer Fee:</span>
                  <span className="font-bold text-emerald-500">Free ($0.00)</span>
                </div>

                <Button type="submit" className="w-full" size="lg" isLoading={sendLoading}>
                  Send ${parseFloat(sendForm.amount || '0').toFixed(2)} Instantly
                </Button>
              </form>
            )}
          </Card>

          {/* Quick Info */}
          <div className="space-y-4">
            <Card className="space-y-3 bg-slate-900 text-white border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm text-sky-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Instant P2P Ledger Settlement</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Money transfers between FinPay customers execute in real time. Idempotency guarantees prevent duplicate debiting upon retry.
              </p>
            </Card>

            <Card className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400">Transfer Limits</h4>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Single Transfer Max</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">$50,000.00</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Daily Limit</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">$50,000.00</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: REQUEST MONEY */}
      {activeTab === 'REQUEST' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Money Request</h3>
            {requestSuccess && <Alert type="success" message={requestSuccess} className="mb-4" />}
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <Input
                label="Payer Email Address"
                type="email"
                required
                value={requestForm.payerEmail}
                onChange={(e) => setRequestForm({ ...requestForm, payerEmail: e.target.value })}
                placeholder="customer@finpay.local"
              />
              <Input
                label="Requested Amount ($ USD)"
                type="number"
                min="1"
                required
                value={requestForm.amount}
                onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                leftIcon={<DollarSign className="w-4 h-4" />}
              />
              <Input
                label="Reason / Description"
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                placeholder="e.g. Project deliverable milestone"
              />
              <Button type="submit" className="w-full" isLoading={requestLoading}>
                Submit Request
              </Button>
            </form>
          </Card>

          {/* Incoming Payment Requests */}
          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Incoming Requests to You</h3>
            <div className="space-y-3">
              {requests.received.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {r.requester?.firstName} {r.requester?.lastName}
                    </h4>
                    <p className="text-slate-500">{r.description || 'Payment Request'}</p>
                    <span className="font-bold text-emerald-500">${parseFloat(r.amount).toFixed(2)} USD</span>
                  </div>
                  {r.status === 'PENDING' ? (
                    <Button size="sm" onClick={() => handleAcceptRequest(r.id)}>
                      Pay Now
                    </Button>
                  ) : (
                    <Badge variant={r.status === 'ACCEPTED' ? 'success' : 'neutral'}>{r.status}</Badge>
                  )}
                </div>
              ))}

              {requests.received.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No incoming payment requests.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: SCHEDULED PAYMENTS */}
      {activeTab === 'SCHEDULED' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Recurring Schedules</h3>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsScheduleModalOpen(true)}>
              New Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduled.map((s) => (
              <Card key={s.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{s.recipientName}</h4>
                    <span className="text-xs text-slate-400 font-mono">Acc: {s.recipientAccount}</span>
                  </div>
                  <Badge variant={s.isActive ? 'success' : 'neutral'}>
                    {s.isActive ? s.frequency : 'CANCELLED'}
                  </Badge>
                </div>

                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${parseFloat(s.amount).toFixed(2)} <span className="text-xs font-normal text-slate-400">{s.currency}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Next: {new Date(s.nextExecution).toLocaleDateString()}</span>
                  {s.isActive && (
                    <button
                      onClick={() => handleCancelScheduled(s.id)}
                      className="text-rose-500 hover:underline font-medium"
                    >
                      Cancel Schedule
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TRANSFER RECEIPTS */}
      {activeTab === 'HISTORY' && (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {transfers.map((t) => (
            <div key={t.id} className="py-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {t.sender?.firstName} → {t.receiver?.firstName}
                  </h4>
                  <span className="text-xs font-mono text-slate-400">{t.referenceNumber}</span>
                </div>
              </div>

              <div className="text-right flex items-center gap-4">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    ${parseFloat(t.amount).toFixed(2)} {t.currency}
                  </span>
                  <span className="text-[11px] text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setReceiptModal(t)}>
                  Receipt
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Schedule Payment Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Create Automated Scheduled Payment"
      >
        <form onSubmit={handleCreateScheduled} className="space-y-4">
          <Input
            label="Recipient Name"
            required
            value={scheduleForm.recipientName}
            onChange={(e) => setScheduleForm({ ...scheduleForm, recipientName: e.target.value })}
          />
          <Input
            label="Recipient Account #"
            required
            value={scheduleForm.recipientAccount}
            onChange={(e) => setScheduleForm({ ...scheduleForm, recipientAccount: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount ($ USD)"
              type="number"
              required
              value={scheduleForm.amount}
              onChange={(e) => setScheduleForm({ ...scheduleForm, amount: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Frequency</label>
              <select
                value={scheduleForm.frequency}
                onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>
          <Input
            label="Start Date"
            type="date"
            required
            value={scheduleForm.startDate}
            onChange={(e) => setScheduleForm({ ...scheduleForm, startDate: e.target.value })}
          />
          <Button type="submit" className="w-full">
            Save & Schedule Recurring Payment
          </Button>
        </form>
      </Modal>

      {/* Receipt Modal */}
      {receiptModal && (
        <Modal
          isOpen={!!receiptModal}
          onClose={() => setReceiptModal(null)}
          title="Official Transaction Receipt"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{receiptModal.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sender:</span>
                <span className="font-semibold">{receiptModal.sender?.firstName} {receiptModal.sender?.lastName} ({receiptModal.sender?.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-semibold">{receiptModal.receiver?.firstName} {receiptModal.receiver?.lastName} ({receiptModal.receiver?.email})</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Settled:</span>
                <span className="text-emerald-500">${parseFloat(receiptModal.amount).toFixed(2)} {receiptModal.currency}</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => setReceiptModal(null)}>
              Close Receipt
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
