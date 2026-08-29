import React, { useState, useEffect } from 'react';
import { CardService } from '../../services/card.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import {
  CreditCard,
  Plus,
  Lock,
  Unlock,
  Sliders,
  ShoppingBag,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const CardsPage: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Issue Form
  const [issueForm, setIssueForm] = useState({
    cardBrand: 'VISA',
    nickname: 'Online Shopping Card',
    dailyLimit: 2500,
    monthlyLimit: 10000,
  });

  // Limits Form
  const [limitsForm, setLimitsForm] = useState({
    dailyLimit: 5000,
    monthlyLimit: 20000,
    nickname: '',
  });

  // Simulate Form
  const [simForm, setSimForm] = useState({
    merchantName: 'Amazon Web Services (AWS)',
    amount: '49.99',
  });
  const [simResult, setSimResult] = useState<any>(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await CardService.getCards();
      if (res.success && res.data.length > 0) {
        setCards(res.data);
        if (!selectedCard) setSelectedCard(res.data[0]);
        else {
          const updated = res.data.find((c: any) => c.id === selectedCard.id);
          if (updated) setSelectedCard(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await CardService.createCard(issueForm);
      if (res.success) {
        setFeedbackMsg('New Virtual Visa Card issued successfully!');
        setIsIssueModalOpen(false);
        fetchCards();
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFreeze = async () => {
    if (!selectedCard) return;
    try {
      const res = await CardService.toggleFreeze(selectedCard.id);
      if (res.success) {
        setFeedbackMsg(res.message);
        fetchCards();
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    try {
      const res = await CardService.updateLimits(selectedCard.id, limitsForm);
      if (res.success) {
        setFeedbackMsg('Card spending limits updated.');
        setIsLimitsModalOpen(false);
        fetchCards();
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    try {
      const res = await CardService.simulateAuthorization(selectedCard.id, {
        merchantName: simForm.merchantName,
        amount: parseFloat(simForm.amount),
      });
      if (res.success) {
        setSimResult(res.data);
        fetchCards();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transaction Declined');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Virtual & Physical Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Instant digital cards with programmable spending limits and real-time security controls.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsIssueModalOpen(true)}
        >
          Issue New Card
        </Button>
      </div>

      {feedbackMsg && <Alert type="info" message={feedbackMsg} className="mb-4" />}

      {/* Main Cards Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Selected Card View and Controls */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCard ? (
            <div className="space-y-6">
              {/* Virtual Card Graphic */}
              <div
                className={`relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                  selectedCard.isFrozen
                    ? 'bg-slate-800 opacity-70 grayscale'
                    : selectedCard.cardBrand === 'MASTERCARD'
                    ? 'bg-gradient-to-tr from-amber-900 via-rose-900 to-slate-950 border border-amber-700/40'
                    : 'bg-gradient-to-tr from-slate-950 via-navy-900 to-sky-950 border border-sky-700/40'
                }`}
              >
                {/* Frozen Overlay Badge */}
                {selectedCard.isFrozen && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="px-4 py-1.5 rounded-full bg-rose-600/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
                      <Lock className="w-4 h-4" /> CARD FROZEN
                    </span>
                  </div>
                )}

                {/* Top Row: Brand & Chip */}
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                    {selectedCard.nickname || 'FinPay Virtual'}
                  </span>
                  <span className="font-extrabold text-lg tracking-wider text-white">
                    {selectedCard.cardBrand}
                  </span>
                </div>

                {/* Card Number */}
                <div className="space-y-1 my-auto">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-widest">Card Number</span>
                  <div className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-slate-100">
                    {selectedCard.maskedPan}
                  </div>
                </div>

                {/* Bottom Row: Holder & Expiry */}
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block font-semibold">Cardholder</span>
                    <span className="font-bold tracking-wide">{selectedCard.cardholderName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase text-slate-400 block font-semibold">Expires</span>
                    <span className="font-mono font-bold">{selectedCard.expiryMonth}/{selectedCard.expiryYear.toString().slice(-2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Controls Bar */}
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={selectedCard.isFrozen ? 'primary' : 'outline'}
                  leftIcon={selectedCard.isFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  onClick={handleToggleFreeze}
                >
                  {selectedCard.isFrozen ? 'Unfreeze Card' : 'Freeze Card'}
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Sliders className="w-4 h-4" />}
                  onClick={() => {
                    setLimitsForm({
                      dailyLimit: parseFloat(selectedCard.dailyLimit),
                      monthlyLimit: parseFloat(selectedCard.monthlyLimit),
                      nickname: selectedCard.nickname || '',
                    });
                    setIsLimitsModalOpen(true);
                  }}
                >
                  Edit Limits
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<Zap className="w-4 h-4" />}
                  onClick={() => setIsSimulateModalOpen(true)}
                  disabled={selectedCard.isFrozen}
                >
                  Simulate POS
                </Button>
              </div>

              {/* Limits and Security Overview */}
              <Card className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Security & Limit Boundaries</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                    <span className="text-xs text-slate-500">Daily Spending Limit</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      ${parseFloat(selectedCard.dailyLimit).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                    <span className="text-xs text-slate-500">Monthly Spending Limit</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      ${parseFloat(selectedCard.monthlyLimit).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CreditCard className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No cards issued yet.</p>
              <Button size="sm" className="mt-3" onClick={() => setIsIssueModalOpen(true)}>
                Issue First Card
              </Button>
            </Card>
          )}
        </div>

        {/* Right Col: Card List Selector & Recent Authorizations */}
        <div className="space-y-6">
          <Card className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-slate-500">Your Cards ({cards.length})</h3>
            <div className="space-y-2">
              {cards.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCard(c)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedCard?.id === c.id
                      ? 'border-finpay-500 bg-finpay-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-finpay-500" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">{c.nickname || 'Virtual Card'}</h5>
                      <span className="font-mono text-[11px] text-slate-400">{c.maskedPan}</span>
                    </div>
                  </div>
                  <Badge variant={c.isFrozen ? 'danger' : 'success'} size="sm">
                    {c.isFrozen ? 'FROZEN' : 'ACTIVE'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Issue Card Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue New Virtual Card">
        <form onSubmit={handleIssueCard} className="space-y-4">
          <Input
            label="Card Nickname"
            required
            value={issueForm.nickname}
            onChange={(e) => setIssueForm({ ...issueForm, nickname: e.target.value })}
            placeholder="e.g. Travel Card, SaaS Subscriptions"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Network</label>
            <select
              value={issueForm.cardBrand}
              onChange={(e) => setIssueForm({ ...issueForm, cardBrand: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
            >
              <option value="VISA">Visa Virtual Debit</option>
              <option value="MASTERCARD">Mastercard Virtual Debit</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Daily Limit ($ USD)"
              type="number"
              value={issueForm.dailyLimit}
              onChange={(e) => setIssueForm({ ...issueForm, dailyLimit: parseFloat(e.target.value) })}
            />
            <Input
              label="Monthly Limit ($ USD)"
              type="number"
              value={issueForm.monthlyLimit}
              onChange={(e) => setIssueForm({ ...issueForm, monthlyLimit: parseFloat(e.target.value) })}
            />
          </div>
          <Button type="submit" className="w-full">
            Issue Virtual Card Instantly
          </Button>
        </form>
      </Modal>

      {/* Edit Limits Modal */}
      <Modal isOpen={isLimitsModalOpen} onClose={() => setIsLimitsModalOpen(false)} title="Update Card Limits">
        <form onSubmit={handleUpdateLimits} className="space-y-4">
          <Input
            label="Nickname"
            value={limitsForm.nickname}
            onChange={(e) => setLimitsForm({ ...limitsForm, nickname: e.target.value })}
          />
          <Input
            label="Daily Limit ($ USD)"
            type="number"
            value={limitsForm.dailyLimit}
            onChange={(e) => setLimitsForm({ ...limitsForm, dailyLimit: parseFloat(e.target.value) })}
          />
          <Input
            label="Monthly Limit ($ USD)"
            type="number"
            value={limitsForm.monthlyLimit}
            onChange={(e) => setLimitsForm({ ...limitsForm, monthlyLimit: parseFloat(e.target.value) })}
          />
          <Button type="submit" className="w-full">
            Save Card Limits
          </Button>
        </form>
      </Modal>

      {/* Simulate POS Modal */}
      <Modal isOpen={isSimulateModalOpen} onClose={() => { setIsSimulateModalOpen(false); setSimResult(null); }} title="Simulate Merchant Card Authorization">
        {simResult ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Authorization Approved!</h4>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono">
              Auth Code: {simResult.authCode}
            </div>
            <Button className="w-full" onClick={() => { setIsSimulateModalOpen(false); setSimResult(null); }}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSimulatePurchase} className="space-y-4">
            <Input
              label="Merchant / POS Terminal"
              required
              value={simForm.merchantName}
              onChange={(e) => setSimForm({ ...simForm, merchantName: e.target.value })}
            />
            <Input
              label="Purchase Amount ($ USD)"
              type="number"
              step="0.01"
              required
              value={simForm.amount}
              onChange={(e) => setSimForm({ ...simForm, amount: e.target.value })}
            />
            <Button type="submit" className="w-full">
              Authorize Test Purchase
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};
