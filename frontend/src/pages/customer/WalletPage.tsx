import React, { useState, useEffect } from 'react';
import { WalletService } from '../../services/wallet.service';
import { BankAccountService } from '../../services/bankAccount.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Download,
  CreditCard,
  Building,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('500');
  const [depositMethod, setDepositMethod] = useState('BANK_TRANSFER');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMsg, setDepositMsg] = useState<string | null>(null);

  // Withdraw Form
  const [withdrawAmount, setWithdrawAmount] = useState('100');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Statement Form
  const [statementRange, setStatementRange] = useState({
    startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [statementData, setStatementData] = useState<any>(null);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await WalletService.getOverview();
      if (res.success) setWallet(res.data);

      const bankRes = await BankAccountService.getAccounts();
      if (bankRes.success && bankRes.data.length > 0) {
        setBankAccounts(bankRes.data);
        const def = bankRes.data.find((b: any) => b.isDefault) || bankRes.data[0];
        setSelectedBankId(def.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDepositLoading(true);
      setDepositMsg(null);
      const idempotencyKey = 'DEP-' + Math.random().toString(36).substring(2) + '-' + Date.now();
      const res = await WalletService.addFunds({
        amount: parseFloat(depositAmount),
        currency: 'USD',
        paymentMethod: depositMethod,
        idempotencyKey,
      });

      if (res.success) {
        setDepositMsg(`Successfully added $${parseFloat(depositAmount).toFixed(2)} to your wallet.`);
        fetchWallet();
        setTimeout(() => {
          setIsDepositOpen(false);
          setDepositMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      setDepositMsg(err.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setWithdrawLoading(true);
      setWithdrawError(null);
      setWithdrawMsg(null);
      const idempotencyKey = 'WTH-' + Math.random().toString(36).substring(2) + '-' + Date.now();
      const res = await WalletService.withdrawFunds({
        amount: parseFloat(withdrawAmount),
        currency: 'USD',
        destinationBankAccountId: selectedBankId,
        idempotencyKey,
      });

      if (res.success) {
        setWithdrawMsg(`Withdrawal of $${parseFloat(withdrawAmount).toFixed(2)} dispatched successfully.`);
        fetchWallet();
        setTimeout(() => {
          setIsWithdrawOpen(false);
          setWithdrawMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      setWithdrawError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleGenerateStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await WalletService.generateStatement({
        startDate: statementRange.startDate,
        endDate: statementRange.endDate,
        format: 'JSON',
      });
      if (res.success) {
        setStatementData(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentUsd = wallet?.balances?.find((b: any) => b.currency === 'USD') || {
    currentBalance: '12500.0000',
    availableBalance: '12500.0000',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Digital Multi-Currency Wallet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Account Number:{' '}
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {wallet?.walletNumber || 'FP1002003004'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => setIsStatementOpen(true)}
          >
            Statement
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
            onClick={() => setIsWithdrawOpen(true)}
          >
            Withdraw
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsDepositOpen(true)}
          >
            Add Funds
          </Button>
        </div>
      </div>

      {/* Primary Wallet Balance Hero Card */}
      <div className="rounded-2xl bg-gradient-to-tr from-slate-900 via-navy-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Total Available Liquidity
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
              <span>${parseFloat(currentUsd.availableBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="text-base font-normal text-sky-400">USD</span>
            </div>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Ledger Balance: $
                {parseFloat(currentUsd.currentBalance).toFixed(2)}
              </span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> FDIC Insured Sandbox Ledger
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-finpay-600 hover:bg-finpay-500 font-semibold text-sm transition-all shadow-md shadow-finpay-500/20 text-center"
            >
              + Deposit Funds
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm transition-all border border-slate-700 text-center"
            >
              Transfer to Bank
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Currency Balances */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Currency Sub-Accounts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-finpay-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">United States Dollar</span>
              <Badge variant="info">USD</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              ${parseFloat(currentUsd.availableBalance).toFixed(2)}
            </div>
            <span className="text-xs text-slate-400">Primary Operating Account</span>
          </Card>

          <Card className="border-l-4 border-l-purple-500 opacity-80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Euro Sub-Wallet</span>
              <Badge variant="neutral">EUR</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              €0.00
            </div>
            <span className="text-xs text-slate-400">Ready for instant exchange</span>
          </Card>

          <Card className="border-l-4 border-l-amber-500 opacity-80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">British Pound</span>
              <Badge variant="neutral">GBP</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              £0.00
            </div>
            <span className="text-xs text-slate-400">Ready for instant exchange</span>
          </Card>
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        title="Add Funds to Wallet"
        description="Select deposit source and amount. Funds are credited instantly in test sandbox."
      >
        {depositMsg && <Alert type="success" message={depositMsg} className="mb-4" />}
        <form onSubmit={handleDeposit} className="space-y-4">
          <Input
            label="Deposit Amount ($ USD)"
            type="number"
            min="10"
            max="50000"
            required
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <select
              value={depositMethod}
              onChange={(e) => setDepositMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
            >
              <option value="BANK_TRANSFER">Linked Bank Account (ACH Direct Debit)</option>
              <option value="DEBIT_CARD">Debit Card Instant Top-up</option>
              <option value="SANDBOX_GATEWAY">Stripe Sandbox Test Gateway</option>
              <option value="WIRE_TRANSFER">Domestic Wire Transfer</option>
            </select>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>Estimated Clearing:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Instant (Sandbox)</span>
          </div>

          <Button type="submit" className="w-full" isLoading={depositLoading}>
            Confirm Deposit of ${parseFloat(depositAmount || '0').toFixed(2)}
          </Button>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Withdraw Funds to Bank"
        description="Transfer money from your FinPay wallet directly to your verified bank account."
      >
        {withdrawError && <Alert type="danger" message={withdrawError} className="mb-4" />}
        {withdrawMsg && <Alert type="success" message={withdrawMsg} className="mb-4" />}
        <form onSubmit={handleWithdraw} className="space-y-4">
          <Input
            label="Withdrawal Amount ($ USD)"
            type="number"
            min="5"
            max="50000"
            required
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Destination Bank Account
            </label>
            {bankAccounts.length > 0 ? (
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
              >
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} ({b.accountNumberMasked}) {b.isDefault ? '— [Default]' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-amber-500 p-2 bg-amber-500/10 rounded-lg">
                No linked bank account found. Please link a bank account before withdrawing.
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={withdrawLoading}
            disabled={bankAccounts.length === 0}
          >
            Authorize Withdrawal
          </Button>
        </form>
      </Modal>

      {/* Statement Modal */}
      <Modal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        title="Generate Account Statement"
        maxWidth="lg"
      >
        <form onSubmit={handleGenerateStatement} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={statementRange.startDate}
              onChange={(e) => setStatementRange({ ...statementRange, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={statementRange.endDate}
              onChange={(e) => setStatementRange({ ...statementRange, endDate: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            Generate Statement
          </Button>
        </form>

        {statementData && (
          <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-3 text-xs">
            <div className="flex justify-between font-bold border-b border-slate-200 dark:border-slate-700 pb-2">
              <span>Statement Ref: {statementData.statementId}</span>
              <span>Transactions: {statementData.summary.transactionCount}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center py-2">
              <div className="p-2 bg-white dark:bg-slate-900 rounded">
                <span className="text-slate-400">Total In</span>
                <p className="font-bold text-emerald-500">+${parseFloat(statementData.summary.totalDeposits).toFixed(2)}</p>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded">
                <span className="text-slate-400">Total Out</span>
                <p className="font-bold text-rose-500">-${parseFloat(statementData.summary.totalWithdrawals).toFixed(2)}</p>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded">
                <span className="text-slate-400">Transfers</span>
                <p className="font-bold text-sky-500">${parseFloat(statementData.summary.totalTransfers).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
