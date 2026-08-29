import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme, toggleSidebar } from '../../store/slices/uiSlice';
import {
  Wallet,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  Bell,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import { Button } from './Button';
import { AuthService } from '../../services/auth.service';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-finpay-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-finpay-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <span>Fin<span className="text-finpay-500">Pay</span></span>
          </Link>
        </div>

        {/* Public Navigation */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/features" className="hover:text-finpay-600 dark:hover:text-finpay-400 transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-finpay-600 dark:hover:text-finpay-400 transition-colors">Pricing</Link>
            <Link to="/about" className="hover:text-finpay-600 dark:hover:text-finpay-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-finpay-600 dark:hover:text-finpay-400 transition-colors">Contact</Link>
          </nav>
        )}

        {/* Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-finpay-500 rounded-full" />
              </button>

              {/* User Dropdown / Role indicator */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[11px] font-medium text-finpay-600 dark:text-finpay-400">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
