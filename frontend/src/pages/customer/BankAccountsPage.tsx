import React, { useState, useEffect } from 'react';
import { BankAccountService } from '../../services/bankAccount.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import {
  Landmark,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building,
  CreditCard,
} from 'lucide-react';

export const BankAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Link Form
  const [form, setForm] = useState({
    bankName: 'Chase Bank (JPMorgan)',
    accountHolder: 'Alex Morgan',
    accountNumber: '123456789012',
    routingNumber: '021000021',
    isDefault: true,
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await BankAccountService.getAccounts();
      if (res.success) {
        setAccounts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      const res = await BankAccountService.linkAccount(form);
      if (res.success) {
        setSuccessMessage('Bank account linked and verified successfully!');
        fetchAccounts();
        setTimeout(() => {
          setIsLinkModalOpen(false);
          setSuccessMessage(null);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to link bank account');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await BankAccountService.setDefault(id);
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Are you sure you want to unlink this bank account?')) return;
    try {
      await BankAccountService.remove(id);
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Linked Bank Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your verified external checking and savings bank accounts for ACH transfers.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsLinkModalOpen(true)}
        >
          Link Bank Account
        </Button>
      </div>

      {/* Linked Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => (
          <Card key={acc.id} className="relative overflow-hidden space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {acc.bankName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Account: {acc.accountNumberMasked}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge variant={acc.status === 'VERIFIED' ? 'success' : 'warning'}>
                  {acc.status}
                </Badge>
                {acc.isDefault && (
                  <span className="text-[10px] font-bold text-finpay-500 uppercase tracking-wider">
                    Default
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Holder: <span className="font-medium text-slate-700 dark:text-slate-300">{acc.accountHolder}</span>
              </span>

              <div className="flex items-center gap-2">
                {!acc.isDefault && (
                  <button
                    onClick={() => handleSetDefault(acc.id)}
                    className="text-finpay-500 hover:underline font-medium"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleRemove(acc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Unlink bank"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {accounts.length === 0 && !loading && (
          <div className="md:col-span-2 text-center py-12 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <Landmark className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No linked bank accounts</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Link an external checking account to enable automated deposits, direct debits, and withdrawals.
            </p>
            <Button size="sm" onClick={() => setIsLinkModalOpen(true)}>
              Link Bank Account
            </Button>
          </div>
        )}
      </div>

      {/* Link Account Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Link External Bank Account"
        description="Enter routing and checking information. Numbers are masked and tokenized for security."
      >
        {errorMessage && <Alert type="danger" message={errorMessage} className="mb-4" />}
        {successMessage && <Alert type="success" message={successMessage} className="mb-4" />}
        <form onSubmit={handleLink} className="space-y-4">
          <Input
            label="Financial Institution / Bank Name"
            required
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            placeholder="e.g. JPMorgan Chase, Bank of America"
          />

          <Input
            label="Account Holder Full Name"
            required
            value={form.accountHolder}
            onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
            placeholder="Alex Morgan"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Routing Number (9 Digits)"
              required
              maxLength={9}
              value={form.routingNumber}
              onChange={(e) => setForm({ ...form, routingNumber: e.target.value })}
              placeholder="021000021"
            />
            <Input
              label="Account Number"
              required
              maxLength={20}
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="123456789012"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDef"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-700 text-finpay-500 focus:ring-finpay-500"
            />
            <label htmlFor="isDef" className="text-xs text-slate-600 dark:text-slate-400">
              Set as primary default withdrawal bank account
            </label>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Raw credentials are never stored in database. Tokenized sandbox representation is used.</span>
          </div>

          <Button type="submit" className="w-full">
            Verify & Link Bank Account
          </Button>
        </form>
      </Modal>
    </div>
  );
};
