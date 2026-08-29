import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Check } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever free',
      description: 'Ideal for individuals managing everyday personal finance and wallet transfers.',
      features: [
        'Primary USD digital wallet',
        'Unlimited P2P wallet transfers',
        '1 Virtual Visa Card',
        'Standard expense & income tracking',
        'Up to 3 savings goals',
        'Email customer support',
      ],
      buttonText: 'Get Started',
      popular: false,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      description: 'For power users needing multi-currency wallets, automated budgets, and cards.',
      features: [
        'Multi-currency digital wallets (USD, EUR, GBP)',
        'Zero fee instant bank deposits & withdrawals',
        'Up to 5 Virtual Cards with custom limits',
        'Automated scheduled recurring payments',
        'Unlimited category budgets & savings goals',
        'Advanced cash flow analytics & export reports',
        'Priority 24/7 support agent response',
      ],
      buttonText: 'Start 30-Day Trial',
      popular: true,
    },
    {
      name: 'Enterprise / Merchant',
      price: '$29.99',
      period: 'per month',
      description: 'Designed for businesses requiring high volume transactions and dedicated tooling.',
      features: [
        'High daily transaction limits ($100,000+)',
        'Unlimited virtual cards with department tags',
        'Automated dispute resolution assistance',
        'Dedicated account manager',
        'API Sandbox & Webhook event streaming',
        'Team access roles & custom audit trails',
      ],
      buttonText: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Transparent, Simple Pricing
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Choose the plan that fits your personal or business financial workflow. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((p, idx) => (
          <Card
            key={idx}
            className={`flex flex-col justify-between relative ${
              p.popular ? 'border-2 border-finpay-500 shadow-xl shadow-finpay-500/10' : ''
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-finpay-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                Most Popular
              </span>
            )}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{p.price}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/{p.period}</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                {p.features.map((f, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link to="/register" className="w-full block">
                <Button
                  variant={p.popular ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {p.buttonText}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
