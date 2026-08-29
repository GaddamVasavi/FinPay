import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Contact FinPay Support
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Have a question or need assistance with your digital account? Our team is available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-finpay-500/10 text-finpay-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Email Us</h4>
                <p className="text-xs text-slate-500">support@finpay.local</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Phone Support</h4>
                <p className="text-xs text-slate-500">+1 (800) 555-0100 (Demo)</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Headquarters</h4>
                <p className="text-xs text-slate-500">FinPay Tower, Suite 400</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="md:col-span-2">
          {submitted ? (
            <Alert
              type="success"
              title="Message Sent Successfully"
              message="Thank you for reaching out. A support specialist has received your inquiry and will follow up shortly."
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send Us a Direct Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Your Name" required placeholder="Alex Morgan" />
                <Input label="Email Address" type="email" required placeholder="alex@example.com" />
              </div>
              <Input label="Subject" required placeholder="Question about wallet transfer limits" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finpay-500/30"
                  placeholder="Describe how our support team can assist you..."
                />
              </div>
              <Button type="submit" isLoading={loading} rightIcon={<Send className="w-4 h-4" />}>
                Submit Inquiry
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
