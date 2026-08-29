import React, { useState, useEffect } from 'react';
import { SavingsService } from '../../services/savings.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import {
  Target,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const SavingsPage: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeGoalForContribute, setActiveGoalForContribute] = useState<any>(null);
  const [activeGoalForWithdraw, setActiveGoalForWithdraw] = useState<any>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form State
  const [createForm, setCreateForm] = useState({
    name: 'Emergency Buffer Fund',
    targetAmount: '10000',
    targetDate: '2026-12-31',
    color: '#0ea5e9',
  });

  const [contributeAmount, setContributeAmount] = useState('250');
  const [withdrawAmount, setWithdrawAmount] = useState('100');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await SavingsService.getGoals();
      if (res.success) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await SavingsService.createGoal({
        ...createForm,
        targetAmount: parseFloat(createForm.targetAmount),
      });
      if (res.success) {
        setFeedbackMsg('New savings goal created!');
        setIsCreateModalOpen(false);
        fetchGoals();
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalForContribute) return;
    try {
      const res = await SavingsService.contribute(activeGoalForContribute.id, {
        amount: parseFloat(contributeAmount),
      });
      if (res.success) {
        setFeedbackMsg(res.message);
        setActiveGoalForContribute(null);
        fetchGoals();
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Contribution failed');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalForWithdraw) return;
    try {
      const res = await SavingsService.withdraw(activeGoalForWithdraw.id, {
        amount: parseFloat(withdrawAmount),
      });
      if (res.success) {
        setFeedbackMsg(res.message);
        setActiveGoalForWithdraw(null);
        fetchGoals();
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  const totalSavedAcrossGoals = goals.reduce((acc, g) => acc + parseFloat(g.currentAmount), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Savings Goals & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automate disciplined savings, track financial milestones, and grow your wealth.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Savings Goal
        </Button>
      </div>

      {feedbackMsg && <Alert type="success" message={feedbackMsg} className="mb-4" />}

      {/* Hero Savings Total */}
      <Card className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 text-white border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
              Total Accumulated Savings
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">
              ${totalSavedAcrossGoals.toFixed(2)} <span className="text-sm font-normal text-sky-400">USD</span>
            </div>
            <p className="text-xs text-slate-300">
              Allocated across {goals.length} dedicated personal financial targets.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            + Add New Milestone
          </Button>
        </div>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => (
          <Card key={g.id} className="space-y-4 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: g.color || '#0ea5e9' }}
                  />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{g.name}</h3>
                </div>
                {g.isCompleted ? (
                  <Badge variant="success" size="sm">COMPLETED 🎉</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">{g.progressPercentage}%</Badge>
                )}
              </div>

              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${parseFloat(g.currentAmount).toFixed(2)}
                </div>
                <span className="text-xs text-slate-400">
                  Target: ${parseFloat(g.targetAmount).toFixed(2)} {g.currency}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${g.progressPercentage}%`,
                    backgroundColor: g.color || '#0ea5e9',
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 pt-1">
                <span>Remaining: ${g.remainingAmount}</span>
                <span>Due: {new Date(g.targetDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Contribution Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs py-1"
                onClick={() => setActiveGoalForWithdraw(g)}
                disabled={parseFloat(g.currentAmount) <= 0}
              >
                Withdraw
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="text-xs py-1"
                onClick={() => setActiveGoalForContribute(g)}
              >
                + Deposit
              </Button>
            </div>
          </Card>
        ))}

        {goals.length === 0 && !loading && (
          <div className="lg:col-span-3 text-center py-12 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <Target className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No savings goals yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Set target goals for an emergency fund, travel vacation, or car purchase.
            </p>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              Create First Goal
            </Button>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Savings Goal">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Name"
            required
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="e.g. Vacation Fund, House Down Payment"
          />
          <Input
            label="Target Amount ($ USD)"
            type="number"
            min="10"
            required
            value={createForm.targetAmount}
            onChange={(e) => setCreateForm({ ...createForm, targetAmount: e.target.value })}
            leftIcon={<DollarSign className="w-4 h-4" />}
          />
          <Input
            label="Target Completion Date"
            type="date"
            required
            value={createForm.targetDate}
            onChange={(e) => setCreateForm({ ...createForm, targetDate: e.target.value })}
          />
          <Button type="submit" className="w-full">
            Save Savings Goal
          </Button>
        </form>
      </Modal>

      {/* Deposit to Goal Modal */}
      {activeGoalForContribute && (
        <Modal
          isOpen={!!activeGoalForContribute}
          onClose={() => setActiveGoalForContribute(null)}
          title={`Deposit into ${activeGoalForContribute.name}`}
        >
          <form onSubmit={handleContribute} className="space-y-4">
            <Input
              label="Deposit Amount ($ USD)"
              type="number"
              min="1"
              required
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
            <p className="text-xs text-slate-400">
              Funds will be moved from your primary wallet balance into this dedicated goal fund.
            </p>
            <Button type="submit" className="w-full">
              Confirm Deposit
            </Button>
          </form>
        </Modal>
      )}

      {/* Withdraw from Goal Modal */}
      {activeGoalForWithdraw && (
        <Modal
          isOpen={!!activeGoalForWithdraw}
          onClose={() => setActiveGoalForWithdraw(null)}
          title={`Withdraw from ${activeGoalForWithdraw.name}`}
        >
          <form onSubmit={handleWithdraw} className="space-y-4">
            <Input
              label="Withdrawal Amount ($ USD)"
              type="number"
              min="1"
              max={parseFloat(activeGoalForWithdraw.currentAmount)}
              required
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
            <Button type="submit" className="w-full">
              Return Funds to Wallet
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
