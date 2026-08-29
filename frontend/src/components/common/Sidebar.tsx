import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  PieChart,
  Target,
  FileText,
  ShieldAlert,
  Users,
  Settings,
  HelpCircle,
  Landmark,
  PiggyBank,
  Receipt,
  FileCheck,
  LifeBuoy,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  const customerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/wallet', label: 'My Wallet', icon: <Wallet className="w-5 h-5" /> },
    { to: '/transfers', label: 'Transfers & Pay', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { to: '/bank-accounts', label: 'Bank Accounts', icon: <Landmark className="w-5 h-5" /> },
    { to: '/cards', label: 'Cards & Credit', icon: <CreditCard className="w-5 h-5" /> },
    { to: '/budgeting', label: 'Budgets & Expense', icon: <PieChart className="w-5 h-5" /> },
    { to: '/savings', label: 'Savings Goals', icon: <PiggyBank className="w-5 h-5" /> },
    { to: '/transactions', label: 'Transactions', icon: <Receipt className="w-5 h-5" /> },
    { to: '/kyc', label: 'KYC Verification', icon: <FileCheck className="w-5 h-5" /> },
    { to: '/support', label: 'Support & Disputes', icon: <LifeBuoy className="w-5 h-5" /> },
    { to: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/admin/customers', label: 'Customer Management', icon: <Users className="w-5 h-5" /> },
    { to: '/admin/kyc', label: 'KYC Reviews', icon: <FileCheck className="w-5 h-5" /> },
    { to: '/admin/transactions', label: 'Transactions Monitor', icon: <Receipt className="w-5 h-5" /> },
    { to: '/admin/risk', label: 'Risk & Fraud Alerts', icon: <ShieldAlert className="w-5 h-5" /> },
    { to: '/admin/reports', label: 'Financial Reports', icon: <FileText className="w-5 h-5" /> },
    { to: '/admin/settings', label: 'System Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const supportLinks = [
    { to: '/support-center', label: 'Support Desk', icon: <LifeBuoy className="w-5 h-5" /> },
    { to: '/support-center/tickets', label: 'Support Tickets', icon: <HelpCircle className="w-5 h-5" /> },
    { to: '/support-center/disputes', label: 'Disputes Queue', icon: <ShieldAlert className="w-5 h-5" /> },
    { to: '/support-center/customers', label: 'Customer Search', icon: <Users className="w-5 h-5" /> },
  ];

  let links = customerLinks;
  if (user?.role === 'ADMIN') links = adminLinks;
  if (user?.role === 'SUPPORT_AGENT') links = supportLinks;

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-30 w-64 pt-16 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 lg:translate-x-0 flex flex-col justify-between',
        !sidebarOpen && '-translate-x-full'
      )}
    >
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {user?.role === 'ADMIN'
            ? 'Admin Portal'
            : user?.role === 'SUPPORT_AGENT'
            ? 'Support Center'
            : 'Personal Finance'}
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard' || link.to === '/admin' || link.to === '/support-center'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-finpay-500/10 text-finpay-600 dark:text-finpay-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      {/* KYC Reminder footer in sidebar if unverified */}
      {user?.role === 'CUSTOMER' && user?.kycStatus !== 'VERIFIED' && (
        <div className="p-4 m-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
          <div className="font-semibold mb-1 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            <span>Complete KYC</span>
          </div>
          <p className="opacity-90">Verify your identity to unlock higher daily transfer limits.</p>
        </div>
      )}
    </aside>
  );
};
