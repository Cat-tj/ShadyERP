'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const invoice = searchParams.get('invoice');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your subscription has been updated. Thank you for your payment.
        </p>

        {invoice && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Invoice Number</p>
            <p className="text-lg font-mono font-bold text-gray-900">{invoice}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/billing"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Billing
          </Link>
          <Link
            href="/pilih-aplikasi"
            className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          A confirmation email has been sent to your account.
        </p>
      </div>
    </div>
  );
}
