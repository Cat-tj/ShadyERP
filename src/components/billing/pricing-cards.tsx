'use client';

import { useState } from 'react';
import { upgradeSubscription } from '@/app/(app)/billing/actions';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    name: 'Basic',
    slug: 'BASIC',
    monthlyPrice: 99000,
    yearlyPrice: 990000,
    features: [
      '5 outlets',
      '50 employees',
      '1,000 products',
      'Basic POS',
      'Inventory management',
      'Member loyalty',
    ],
  },
  {
    name: 'Pro',
    slug: 'PRO',
    monthlyPrice: 299000,
    yearlyPrice: 2990000,
    features: [
      'Unlimited outlets',
      'Unlimited employees',
      'Unlimited products',
      'Advanced POS',
      'Full ERP features',
      'Marketplace integration',
      'Advanced accounting',
      'Payroll system',
    ],
  },
];

export function PricingCards({ currentPlan }: { currentPlan?: string }) {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpgrade(plan: string) {
    setLoading(true);
    try {
      const result = await upgradeSubscription(plan, billingCycle);
      window.location.href = result.paymentUrl;
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setBillingCycle('MONTHLY')}
          className={`px-6 py-2 rounded font-semibold ${
            billingCycle === 'MONTHLY'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('YEARLY')}
          className={`px-6 py-2 rounded font-semibold ${
            billingCycle === 'YEARLY'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Yearly (Save 10%)
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.slug}
            className="border rounded-lg p-8 shadow-lg hover:shadow-xl transition"
          >
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>

            <div className="mb-6">
              <div className="text-4xl font-bold text-blue-600">
                Rp{' '}
                {(
                  billingCycle === 'MONTHLY'
                    ? plan.monthlyPrice
                    : plan.yearlyPrice
                )
                  .toLocaleString('id-ID')
                  .split(',')[0]}
              </div>
              <p className="text-gray-600 mt-2">
                per {billingCycle === 'MONTHLY' ? 'month' : 'year'}
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.slug)}
              disabled={loading || currentPlan === plan.slug}
              className={`w-full py-3 rounded font-semibold transition ${
                currentPlan === plan.slug
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
              }`}
            >
              {currentPlan === plan.slug ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
