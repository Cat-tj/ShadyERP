import { requireRole } from "@/server/require-session";
import { listLeads } from "@/server/services/lead-service";
import { LeadManager, type LeadRow } from "@/components/crm/lead-manager";

export default async function CRMPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const rawLeads = await listLeads(user.tenantId);

  const leads: LeadRow[] = rawLeads.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    source: l.source,
    interest: l.interest,
    expectedValue: l.expectedValue,
    nextFollowUpAt: l.nextFollowUpAt ? l.nextFollowUpAt.toISOString() : null,
    status: l.status,
    notes: l.notes,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Sales CRM</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Kelola hubungan prospek, proyeksi nilai transaksi, dan jadwal follow-up pemesanan besar Anda.
        </p>
      </div>

      <LeadManager leads={leads} />
    </div>
  );
}
