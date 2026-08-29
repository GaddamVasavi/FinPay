import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MailCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSimulateVerification = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-finpay-600 to-sky-400 items-center justify-center text-white shadow-lg shadow-finpay-500/20 mb-2">
            <MailCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Email Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Confirming your email address ensures uninterrupted account security.
          </p>
        </div>

        <Card className="text-center space-y-4">
          {verified ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Email Address Verified</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your email has been authenticated successfully.
              </p>
              <Link to="/dashboard" className="block">
                <Button className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Click below to complete verification token validation for this sandbox account session.
              </p>
              <Button onClick={handleSimulateVerification} isLoading={loading} className="w-full">
                Verify Email Token
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
