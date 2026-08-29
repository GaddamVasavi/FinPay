import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { SupportLayout } from './layouts/SupportLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { PricingPage } from './pages/public/PricingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Dashboard Pages
import { DashboardPage } from './pages/customer/DashboardPage';
import { WalletPage } from './pages/customer/WalletPage';
import { BankAccountsPage } from './pages/customer/BankAccountsPage';
import { TransactionsPage } from './pages/customer/TransactionsPage';
import { KYCPage } from './pages/customer/KYCPage';
import { BeneficiariesPage } from './pages/customer/BeneficiariesPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { SupportDashboardPage } from './pages/support/SupportDashboardPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public & Marketing Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Customer Protected Portal Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/bank-accounts" element={<BankAccountsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/kyc" element={<KYCPage />} />
        <Route path="/beneficiaries" element={<BeneficiariesPage />} />
        <Route path="/transfers" element={<DashboardPage />} />
        <Route path="/cards" element={<DashboardPage />} />
        <Route path="/budgeting" element={<DashboardPage />} />
        <Route path="/savings" element={<DashboardPage />} />
        <Route path="/support" element={<DashboardPage />} />
        <Route path="/settings" element={<DashboardPage />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/*" element={<AdminDashboardPage />} />
      </Route>

      {/* Support Agent Portal Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['SUPPORT_AGENT', 'ADMIN']}>
            <SupportLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/support-center" element={<SupportDashboardPage />} />
        <Route path="/support-center/*" element={<SupportDashboardPage />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
