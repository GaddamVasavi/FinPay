import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/admin.service';
import { KYCService } from '../../services/kyc.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import {
  ShieldAlert,
  Users,
  FileCheck,
  Activity,
  DollarSign,
  Lock,
  Unlock,
  AlertTriangle,
  Search,
  CheckCircle,
  XCircle,
  ScrollText,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [pendingKYC, setPendingKYC] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'USERS' | 'RISK' | 'KYC' | 'AUDIT'>('USERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Review Modal State
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [selectedKYC, setSelectedKYC] = useState<any>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [sRes, uRes, rRes, kRes, aRes] = await Promise.all([
        AdminService.getStats(),
        AdminService.getUsers({ search: searchQuery }),
        AdminService.getRiskAlerts(),
        KYCService.getPending(),
        AdminService.getAuditLogs(),
      ]);

      if (sRes.success) setStats(sRes.data);
      if (uRes.success) setUsers(uRes.data);
      if (rRes.success) setRiskAlerts(rRes.data);
      if (kRes.success) setPendingKYC(kRes.data);
      if (aRes.success) setAuditLogs(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchQuery]);

  const handleToggleUserStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await AdminService.updateUserStatus(user.id, {
        status: nextStatus,
        reason: 'Administrative override from Control Center',
      });
      if (res.success) {
        setFeedback(`User ${user.email} is now ${nextStatus}`);
        fetchAdminData();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveRiskAlert = async (alertId: string, decision: 'RESOLVED' | 'DISMISSED') => {
    try {
      const res = await AdminService.reviewRiskAlert(alertId, {
        status: decision,
        notes: 'Reviewed by compliance security team',
      });
      if (res.success) {
        setSelectedAlert(null);
        setFeedback(`Risk alert marked as ${decision}`);
        fetchAdminData();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewKYC = async (kycId: string, decision: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await KYCService.reviewKYC(kycId, {
        status: decision,
        notes: decision === 'VERIFIED' ? 'Identity verified against government database' : 'Document unreadable',
      });
      if (res.success) {
        setSelectedKYC(null);
        setFeedback(`KYC application ${decision.toLowerCase()} successfully`);
        fetchAdminData();
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
            Executive Governance & Risk Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global customer management, real-time risk alert triggers, KYC identity reviews, and immutable audit logs.
          </p>
        </div>
        <Badge variant="danger" size="md">
          ADMIN CONTROL CENTER
        </Badge>
      </div>

      {feedback && <Alert type="success" message={feedback} className="mb-4" />}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-finpay-500 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-slate-400">Total Users</span>
            <Users className="w-4 h-4 text-finpay-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats?.totalUsers || 0}
          </div>
          <p className="text-xs text-slate-500">Registered platform customers</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-slate-400">Platform Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ${stats?.totalVolumeUSD?.toLocaleString() || '0.00'}
          </div>
          <p className="text-xs text-slate-500">{stats?.totalTransactions || 0} Total Transactions</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-slate-400">Pending KYC</span>
            <FileCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats?.pendingKYC || 0}
          </div>
          <p className="text-xs text-slate-500">Awaiting identity verification</p>
        </Card>

        <Card className="border-l-4 border-l-rose-500 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-slate-400">Risk Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {stats?.openRiskAlerts || 0}
          </div>
          <p className="text-xs text-rose-500 font-medium">Compliance triggers open</p>
        </Card>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'USERS'
              ? 'bg-finpay-600 text-white shadow-md shadow-finpay-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Customer Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('RISK')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'RISK'
              ? 'bg-finpay-600 text-white shadow-md shadow-finpay-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Risk & Fraud Alerts ({riskAlerts.filter((r) => r.status === 'OPEN').length})
        </button>
        <button
          onClick={() => setActiveTab('KYC')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'KYC'
              ? 'bg-finpay-600 text-white shadow-md shadow-finpay-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          KYC Approvals Queue ({pendingKYC.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'AUDIT'
              ? 'bg-finpay-600 text-white shadow-md shadow-finpay-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Immutable Audit Logs
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'USERS' && (
        <Card className="p-0 overflow-hidden space-y-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400">Showing {users.length} accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Wallet Balances</th>
                  <th className="px-4 py-3">KYC Status</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {u.firstName} {u.lastName}
                      </div>
                      <span className="text-slate-400 font-mono">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {u.roles?.map((r: any) => (
                          <Badge key={r.role.name} variant="neutral" size="sm">
                            {r.role.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {u.wallets?.[0]?.balances?.map((b: any) => (
                        <div key={b.currency} className="text-[11px]">
                          ${parseFloat(b.availableBalance).toFixed(2)} {b.currency}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          u.kycProfile?.status === 'VERIFIED'
                            ? 'success'
                            : u.kycProfile?.status === 'PENDING'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {u.kycProfile?.status || 'UNVERIFIED'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={u.status === 'ACTIVE' ? 'outline' : 'primary'}
                        className="text-xs py-1"
                        onClick={() => handleToggleUserStatus(u)}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: RISK ALERTS */}
      {activeTab === 'RISK' && (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {riskAlerts.map((r) => (
            <div key={r.id} className="py-4 flex items-start justify-between text-sm">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    r.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{r.ruleTriggered}</h4>
                    <Badge variant={r.severity === 'HIGH' ? 'danger' : 'warning'} size="sm">
                      {r.severity}
                    </Badge>
                    <Badge variant={r.status === 'OPEN' ? 'warning' : 'neutral'} size="sm">
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Triggered by transaction <span className="font-mono">{r.transaction?.referenceNumber}</span> (${parseFloat(r.transaction?.amount || '0').toFixed(2)} USD)
                  </p>
                  <span className="text-[11px] text-slate-400 block">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {r.status === 'OPEN' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs py-1"
                    onClick={() => handleResolveRiskAlert(r.id, 'DISMISSED')}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs py-1"
                    onClick={() => handleResolveRiskAlert(r.id, 'RESOLVED')}
                  >
                    Resolve & Clear
                  </Button>
                </div>
              )}
            </div>
          ))}

          {riskAlerts.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">No risk alerts found in system.</p>
          )}
        </Card>
      )}

      {/* TAB 3: KYC APPROVALS */}
      {activeTab === 'KYC' && (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {pendingKYC.map((k) => (
            <div key={k.id} className="py-4 flex items-center justify-between text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {k.profile?.user?.firstName} {k.profile?.user?.lastName} ({k.profile?.user?.email})
                  </h4>
                  <Badge variant="warning" size="sm">{k.documentType}</Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono">Doc #: {k.documentNumber}</p>
                <span className="text-[11px] text-slate-400">Submitted: {new Date(k.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                  onClick={() => handleReviewKYC(k.id, 'REJECTED')}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs py-1"
                  onClick={() => handleReviewKYC(k.id, 'VERIFIED')}
                >
                  Approve KYC
                </Button>
              </div>
            </div>
          ))}

          {pendingKYC.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">No pending KYC verifications in queue.</p>
          )}
        </Card>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <Card className="p-0 overflow-hidden space-y-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              System Audit Trails ({auditLogs.length})
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-sans font-semibold">{log.user?.email || 'SYSTEM'}</td>
                    <td className="px-4 py-3 text-finpay-500 font-bold">{log.action}</td>
                    <td className="px-4 py-3">{log.entityType} ({log.entityId?.slice(0, 8)})</td>
                    <td className="px-4 py-3 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
