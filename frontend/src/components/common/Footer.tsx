import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShieldCheck, Lock, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-finpay-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-finpay-500/20">
                <Wallet className="w-4 h-4" />
              </div>
              <span>Fin<span className="text-finpay-500">Pay</span></span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              FinPay is a next-generation personal finance & digital payments platform designed for enterprise-grade security and frictionless multi-currency money transfers.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Sandbox / Test Environment Active</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/features" className="hover:text-finpay-500 transition-colors">Digital Wallets</Link></li>
              <li><Link to="/features" className="hover:text-finpay-500 transition-colors">Virtual Cards</Link></li>
              <li><Link to="/features" className="hover:text-finpay-500 transition-colors">P2P Money Transfers</Link></li>
              <li><Link to="/features" className="hover:text-finpay-500 transition-colors">Personal Budgeting</Link></li>
              <li><Link to="/pricing" className="hover:text-finpay-500 transition-colors">Plans & Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-finpay-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-finpay-500 transition-colors">Contact Support</Link></li>
              <li><a href="/api/docs" target="_blank" rel="noreferrer" className="hover:text-finpay-500 transition-colors">API Docs (Swagger)</a></li>
              <li><a href="/health" target="_blank" rel="noreferrer" className="hover:text-finpay-500 transition-colors">System Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Security & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> End-to-End Encryption</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Strict KYC/AML Workflows</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Zero Plaintext Card Storage</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FinPay Inc. All rights reserved. Fictional demo platform for development & testing.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
