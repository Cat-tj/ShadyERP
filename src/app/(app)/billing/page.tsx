import { requireSession } from '@/server/require-session';
import { getSubscription } from './actions';
import { PricingCards } from '@/components/billing/pricing-cards';

export default async function BillingPage() {
  const session = await requireSession();
  const subscription = await getSubscription();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your ShadyERP subscription</p>
      </div>

      {subscription && (
        <div className="mb-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="text-2xl font-bold">{subscription.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-bold capitalize">{subscription.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Period Ends</p>
              <p className="text-2xl font-bold">
                {subscription.currentPeriodEnd.toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>

          {subscription.isOnTrial && (
            <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded text-yellow-800">
              <p className="font-semibold">Trial Period Active</p>
              <p>Your free trial ends on {subscription.trialEndDate?.toLocaleDateString('id-ID')}</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8">Choose Your Plan</h2>
        <PricingCards currentPlan={subscription?.plan} />
      </div>

      {subscription && subscription.invoices.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">Invoice No</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {subscription.invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-2">
                      Rp {invoice.total.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        invoice.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'OVERDUE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {invoice.createdAt.toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
