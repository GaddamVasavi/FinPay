import React, { useState, useEffect } from 'react';
import { LoanService } from '../../services/loan.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import {
  Landmark,
  Calculator,
  Plus,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingDown,
  Clock,
} from 'lucide-react';

export const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    principalAmount: '5000',
    termMonths: 12,
    purpose: 'Home Improvement & Workspace Setup',
    annualIncome: '75000',
    employmentStatus: 'EMPLOYED',
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Repay Modal
  const [repayInstallmentTarget, setRepayInstallmentTarget] = useState<any>(null);
  const [repayLoading, setRepayLoading] = useState(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await LoanService.getLoans();
      if (res.success && res.data.length > 0) {
        setLoans(res.data);
        if (!selectedLoan) setSelectedLoan(res.data[0]);
        else {
          const updated = res.data.find((l: any) => l.id === selectedLoan.id);
          if (updated) setSelectedLoan(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const calculateEstimate = () => {
    const p = parseFloat(applyForm.principalAmount) || 0;
    const n = applyForm.termMonths;
    const r = 8.99 / 100 / 12;
    if (p <= 0 || n <= 0) return { emi: 0, total: 0 };
    const emiFactor = Math.pow(1 + r, n);
    const emi = (p * r * emiFactor) / (emiFactor - 1);
    return { emi: emi.toFixed(2), total: (emi * n).toFixed(2) };
  };

  const estimate = calculateEstimate();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setApplyLoading(true);
      const res = await LoanService.applyLoan({
        principalAmount: parseFloat(applyForm.principalAmount),
        termMonths: Number(applyForm.termMonths),
        purpose: applyForm.purpose,
        annualIncome: parseFloat(applyForm.annualIncome),
        employmentStatus: applyForm.employmentStatus,
      });

      if (res.success) {
        setFeedbackMsg('Loan application submitted for underwriter review!');
        setIsApplyModalOpen(false);
        fetchLoans();
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Loan application failed');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!repayInstallmentTarget) return;
    try {
      setRepayLoading(true);
      const res = await LoanService.repayInstallment({
        installmentId: repayInstallmentTarget.id,
        amount: parseFloat(repayInstallmentTarget.amount),
      });

      if (res.success) {
        setFeedbackMsg(res.message);
        setRepayInstallmentTarget(null);
        fetchLoans();
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Repayment failed');
    } finally {
      setRepayLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Personal Loans & Credit Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Transparent fixed-rate personal loans with clear monthly amortization and zero prepayment penalties.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsApplyModalOpen(true)}
        >
          Apply for Loan
        </Button>
      </div>

      {feedbackMsg && <Alert type="success" message={feedbackMsg} className="mb-4" />}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Selected Loan Details & Amortization Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {selectedLoan ? (
            <div className="space-y-6">
              {/* Hero Overview */}
              <Card className="border-l-4 border-l-finpay-500 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Loan #{selectedLoan.loanNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedLoan.purpose}
                    </h3>
                  </div>
                  <Badge
                    variant={
                      selectedLoan.status === 'ACTIVE'
                        ? 'success'
                        : selectedLoan.status === 'COMPLETED'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {selectedLoan.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400">Principal</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      ${parseFloat(selectedLoan.principalAmount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Monthly EMI</span>
                    <p className="text-base font-bold text-finpay-600 dark:text-finpay-400">
                      ${parseFloat(selectedLoan.monthlyInstallment).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Outstanding</span>
                    <p className="text-base font-bold text-rose-500">
                      ${parseFloat(selectedLoan.outstandingAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Installments Table */}
              <Card className="p-0 overflow-hidden space-y-0">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Amortization Repayment Schedule ({selectedLoan.installments?.length || 0} Months)
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">8.99% Fixed APR</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Principal</th>
                        <th className="px-4 py-3">Interest</th>
                        <th className="px-4 py-3">Total Due</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedLoan.installments?.map((inst: any) => (
                        <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-bold">{inst.installmentNumber}</td>
                          <td className="px-4 py-3 text-slate-500">{new Date(inst.dueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">${parseFloat(inst.principal).toFixed(2)}</td>
                          <td className="px-4 py-3 text-slate-400">${parseFloat(inst.interest).toFixed(2)}</td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            ${parseFloat(inst.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={inst.status === 'PAID' ? 'success' : 'warning'} size="sm">
                              {inst.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {inst.status === 'PENDING' && selectedLoan.status === 'ACTIVE' && (
                              <Button
                                size="sm"
                                variant="primary"
                                className="text-xs py-1"
                                onClick={() => setRepayInstallmentTarget(inst)}
                              >
                                Repay
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="text-center py-12 space-y-3">
              <Landmark className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No active loans</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Apply for a flexible fixed-rate personal loan to fund major projects or consolidations.
              </p>
              <Button size="sm" onClick={() => setIsApplyModalOpen(true)}>
                Apply for Loan
              </Button>
            </Card>
          )}
        </div>

        {/* Right Col: Loan Portfolio List & Rate Info */}
        <div className="space-y-6">
          <Card className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400">Your Loan Accounts ({loans.length})</h4>
            <div className="space-y-2">
              {loans.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setSelectedLoan(l)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedLoan?.id === l.id
                      ? 'border-finpay-500 bg-finpay-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">#{l.loanNumber}</span>
                    <Badge variant={l.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {l.status}
                    </Badge>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    ${parseFloat(l.principalAmount).toFixed(2)} USD
                  </div>
                  <span className="text-[11px] text-slate-400">{l.purpose}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Apply Loan Modal with Live Calculator */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Personal Loan Application & EMI Calculator"
        maxWidth="lg"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Loan Amount ($ USD)"
              type="number"
              min="500"
              max="50000"
              required
              value={applyForm.principalAmount}
              onChange={(e) => setApplyForm({ ...applyForm, principalAmount: e.target.value })}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Term Duration</label>
              <select
                value={applyForm.termMonths}
                onChange={(e) => setApplyForm({ ...applyForm, termMonths: Number(e.target.value) })}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
              >
                <option value={6}>6 Months</option>
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
                <option value={60}>60 Months (5 Years)</option>
              </select>
            </div>
          </div>

          <Input
            label="Loan Purpose"
            required
            value={applyForm.purpose}
            onChange={(e) => setApplyForm({ ...applyForm, purpose: e.target.value })}
            placeholder="e.g. Home Improvement, Debt Consolidation"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Annual Income ($ USD)"
              type="number"
              required
              value={applyForm.annualIncome}
              onChange={(e) => setApplyForm({ ...applyForm, annualIncome: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employment Status</label>
              <select
                value={applyForm.employmentStatus}
                onChange={(e) => setApplyForm({ ...applyForm, employmentStatus: e.target.value })}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
              >
                <option value="EMPLOYED">Full-time Employed</option>
                <option value="SELF_EMPLOYED">Self-Employed</option>
                <option value="BUSINESS">Business Owner</option>
              </select>
            </div>
          </div>

          {/* Live Quote Box */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Monthly EMI:</span>
              <span className="font-bold text-finpay-500 text-sm">${estimate.emi} / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Repayment (Principal + Interest):</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">${estimate.total}</span>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={applyLoading}>
            Submit Loan Application
          </Button>
        </form>
      </Modal>

      {/* Repay Installment Modal */}
      {repayInstallmentTarget && (
        <Modal
          isOpen={!!repayInstallmentTarget}
          onClose={() => setRepayInstallmentTarget(null)}
          title={`Repay Installment #${repayInstallmentTarget.installmentNumber}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              You are about to authorize payment of <span className="font-bold text-slate-900 dark:text-white">${parseFloat(repayInstallmentTarget.amount).toFixed(2)} USD</span> directly from your primary wallet balance.
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between font-bold">
              <span>Installment Amount:</span>
              <span>${parseFloat(repayInstallmentTarget.amount).toFixed(2)} USD</span>
            </div>
            <Button className="w-full" isLoading={repayLoading} onClick={handleRepay}>
              Confirm & Pay from Wallet
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
