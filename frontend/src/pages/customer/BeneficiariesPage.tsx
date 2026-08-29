import React, { useState, useEffect } from 'react';
import { BeneficiaryService } from '../../services/beneficiary.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import {
  Users,
  Plus,
  Trash2,
  Send,
  ShieldCheck,
  Search,
  Mail,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BeneficiariesPage: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: 'Sarah Support',
    email: 'support@finpay.local',
    bankName: 'FinPay Wallet User',
    isDefault: false,
  });

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const res = await BeneficiaryService.getAll();
      if (res.success) {
        setBeneficiaries(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMsg(null);
      const res = await BeneficiaryService.create(form);
      if (res.success) {
        setMsg('Beneficiary recipient saved successfully!');
        fetchBeneficiaries();
        setTimeout(() => {
          setIsAddModalOpen(false);
          setMsg(null);
        }, 1200);
      }
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Failed to add beneficiary');
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this beneficiary from your directory?')) return;
    try {
      await BeneficiaryService.remove(id);
      fetchBeneficiaries();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = beneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.email && b.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Saved Beneficiaries & Contacts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store frequently used P2P transfer recipients and verified external payees.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Beneficiary
        </Button>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Search beneficiaries by name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Beneficiaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((b) => (
          <Card key={b.id} hoverEffect className="space-y-4 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-finpay-500/10 text-finpay-600 dark:text-finpay-400 font-bold flex items-center justify-center text-base">
                  {b.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{b.name}</h3>
                  <p className="text-xs text-slate-400">{b.email || 'External Beneficiary'}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(b.id)}
                className="text-slate-400 hover:text-rose-500 p-1"
                title="Remove beneficiary"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{b.isVerified ? 'Verified Customer' : 'Standard'}</span>
              </div>
              <Link to={`/transfers?recipient=${encodeURIComponent(b.email || '')}`}>
                <Button size="sm" variant="outline" className="text-xs py-1" rightIcon={<Send className="w-3 h-3" />}>
                  Send
                </Button>
              </Link>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="md:col-span-3 text-center py-12 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No beneficiaries saved</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Save your frequent contacts to transfer funds in seconds with zero manual typing errors.
            </p>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              Add First Beneficiary
            </Button>
          </div>
        )}
      </div>

      {/* Add Beneficiary Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Beneficiary"
        description="Enter recipient details. If their email matches a registered FinPay user, they will be verified automatically."
      >
        {msg && <Alert type="info" message={msg} className="mb-4" />}
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name / Display Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Sarah Support"
          />
          <Input
            label="FinPay Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="support@finpay.local"
            leftIcon={<Mail className="w-4 h-4" />}
          />
          <Button type="submit" className="w-full">
            Save Beneficiary
          </Button>
        </form>
      </Modal>
    </div>
  );
};
