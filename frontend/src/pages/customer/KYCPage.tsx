import React, { useState, useEffect } from 'react';
import { KYCService } from '../../services/kyc.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import {
  FileCheck,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const KYCPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    documentType: 'PASSPORT',
    documentNumber: 'P987654321',
    documentExpiry: '2030-01-01',
    documentFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await KYCService.getProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMsg(null);
      const res = await KYCService.submitKYC(form);
      if (res.success) {
        setMsg('Identity verification documents submitted. Our automated compliance engine will review shortly.');
        fetchProfile();
      }
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const status = profile?.status || 'PENDING';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Identity & KYC Compliance Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete identity verification to unlock full transfer allowances and high-limit virtual cards.
        </p>
      </div>

      {/* Current Status Card */}
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-finpay-500">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-finpay-500/10 text-finpay-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white">Verification Status:</h3>
              <Badge
                variant={
                  status === 'VERIFIED'
                    ? 'success'
                    : status === 'UNDER_REVIEW'
                    ? 'warning'
                    : 'danger'
                }
              >
                {status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {status === 'VERIFIED'
                ? 'Your identity is fully verified. Standard limits: $50,000/day.'
                : 'Identity documents are being validated against compliance standards.'}
            </p>
          </div>
        </div>

        {status === 'VERIFIED' && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Full Account Unlocked
          </div>
        )}
      </Card>

      {/* Submission Form */}
      {status !== 'VERIFIED' && (
        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Upload Identification Document
          </h3>

          {msg && <Alert type="info" message={msg} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Document Type
                </label>
                <select
                  value={form.documentType}
                  onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm"
                >
                  <option value="PASSPORT">International Passport</option>
                  <option value="DRIVING_LICENSE">Driver's License</option>
                  <option value="NATIONAL_ID">National Identity Card</option>
                  <option value="UTILITY_BILL">Proof of Address / Utility Bill</option>
                </select>
              </div>

              <Input
                label="Document Identification Number"
                required
                value={form.documentNumber}
                onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                placeholder="e.g. P987654321"
              />
            </div>

            <Input
              label="Document Expiry Date"
              type="date"
              value={form.documentExpiry}
              onChange={(e) => setForm({ ...form, documentExpiry: e.target.value })}
            />

            {/* Document Upload Simulator */}
            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center space-y-2 bg-slate-50 dark:bg-slate-900/40">
              <UploadCloud className="w-8 h-8 text-finpay-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Front Side of Identity Document
              </p>
              <p className="text-[11px] text-slate-400">
                Mock sandbox document preview attached: {form.documentFrontUrl}
              </p>
            </div>

            <Button type="submit" className="w-full" isLoading={submitting}>
              Submit Documents for Review
            </Button>
          </form>
        </Card>
      )}

      {/* Verification History Logs */}
      {profile?.verifications && profile.verifications.length > 0 && (
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Audit History & Review Log
          </h3>
          <div className="space-y-3">
            {profile.verifications.map((v: any) => (
              <div
                key={v.id}
                className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={v.status === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                      {v.status}
                    </Badge>
                    <span className="text-slate-400">
                      Reviewed on {new Date(v.reviewedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {v.notes && <p className="text-slate-600 dark:text-slate-300 mt-1">{v.notes}</p>}
                </div>
                <span className="text-slate-500 font-medium">Compliance Reviewer</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
