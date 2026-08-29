import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { setCredentials } from '../../store/slices/authSlice';
import { AuthService } from '../../services/auth.service';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Wallet, Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex.morgan@finpay.local',
      password: 'FintechDemo#2026',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await AuthService.login(data);

      if (res.success && res.data) {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.tokens.accessToken,
            refreshToken: res.data.tokens.refreshToken,
          })
        );

        // Redirect based on role
        if (res.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else if (res.data.user.role === 'SUPPORT_AGENT') {
          navigate('/support-center');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (role: 'customer' | 'admin' | 'support') => {
    if (role === 'customer') {
      setValue('email', 'alex.morgan@finpay.local');
      setValue('password', 'FintechDemo#2026');
    } else if (role === 'admin') {
      setValue('email', 'admin@finpay.local');
      setValue('password', 'FintechDemo#2026');
    } else if (role === 'support') {
      setValue('email', 'support@finpay.local');
      setValue('password', 'FintechDemo#2026');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-finpay-600 to-sky-400 items-center justify-center text-white shadow-lg shadow-finpay-500/20 mb-2">
            <Wallet className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome Back to FinPay
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your digital wallets, transfers, and finances.
          </p>
        </div>

        {/* Demo Fast Fill Buttons */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Fictional Demo Fast Fill:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('customer')}
              className="px-2 py-1.5 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-finpay-500 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="px-2 py-1.5 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-amber-500 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('support')}
              className="px-2 py-1.5 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-sky-500 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Support Agent
            </button>
          </div>
        </div>

        <Card>
          {errorMessage && (
            <Alert
              type="danger"
              message={errorMessage}
              className="mb-5"
              onClose={() => setErrorMessage(null)}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="alex.morgan@finpay.local"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs text-finpay-600 dark:text-finpay-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="md"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-finpay-600 dark:text-finpay-400 hover:underline">
              Create free account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
