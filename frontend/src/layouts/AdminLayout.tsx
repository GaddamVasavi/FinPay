import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-400 font-medium">
            🛡️ Administrative Governance Mode Active — All actions and overrides are recorded in the immutable audit log.
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
