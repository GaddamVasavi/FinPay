import React, { useState, useEffect } from 'react';
import { WalletService } from '../../services/wallet.service';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Receipt,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (search) params.search = search;
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;

      const res = await WalletService.getTransactions(params);
      if (res.success) {
        setTransactions(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, filterType, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) return;
    const headers = 'Reference,Type,Amount,Currency,Status,Description,Date\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.referenceNumber}","${t.type}","${t.amount}","${t.currency}","${t.status}","${t.description}","${t.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finpay-transactions-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transactions & Ledger Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail of all deposits, withdrawals, transfers, and card authorizations.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCsv}
        >
          Export CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search reference # or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="TRANSFER">Transfers</option>
            <option value="PAYMENT">Payments</option>
            <option value="REFUND">Refunds</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REVERSED">Reversed</option>
          </select>
        </form>
      </Card>

      {/* Transactions Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((tx) => {
                const isPositive = tx.type === 'DEPOSIT' || tx.type === 'REFUND';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
                            {tx.description}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {tx.bankAccount ? `Bank: ${tx.bankAccount.bankName}` : 'Wallet Ledger'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {tx.referenceNumber}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="neutral" size="sm">
                        {tx.type}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(tx.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          tx.status === 'COMPLETED'
                            ? 'success'
                            : tx.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {tx.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-bold text-sm ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isPositive ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)} {tx.currency}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {transactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No transactions match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page {meta.page} of {meta.totalPages} ({meta.total} total transactions)
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
