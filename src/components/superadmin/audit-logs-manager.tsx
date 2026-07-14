"use client";

import { useMemo, useState } from "react";
import { formatTanggalPendek } from "@/lib/format";

export type AuditLogDef = {
  id: string;
  actorEmail: string;
  actorName: string;
  action: string;
  targetTenantId: string | null;
  description: string;
  beforeJson: unknown;
  afterJson: unknown;
  createdAt: string;
};

export function AuditLogsManager({ logs }: { logs: AuditLogDef[] }) {
  const [search, setSearch] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (log) =>
        log.actorEmail.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        (log.targetTenantId && log.targetTenantId.toLowerCase().includes(q))
    );
  }, [logs, search]);

  const actionLabels: Record<string, string> = {
    TENANT_ACTIVATE: "Tenant Aktif",
    TENANT_SUSPEND: "Tenant Suspend",
    SUBSCRIPTION_APPROVE: "Approve Paket",
    SUBSCRIPTION_REJECT: "Reject Paket",
    TENANT_MODULES_UPDATE: "Modul Tenant",
    TENANT_PLAN_CHANGE: "Paket Tenant",
    TENANT_ACCOUNTING_MODE_CHANGE: "Mode Akuntansi",
    SUPERADMIN_ACCOUNT_UPSERT: "Upsert Admin",
    SUPERADMIN_PASSWORD_RESET: "Reset Password Admin",
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("SUSPEND") || action.includes("REJECT")) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (action.includes("ACTIVATE") || action.includes("APPROVE")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (action.includes("PASSWORD") || action.includes("UPSERT")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Superadmin Audit Log</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Daftar seluruh aktivitas administratif platform Altora.
        </p>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari berdasarkan nama, email, aksi, atau deskripsi..."
        className="min-h-[48px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
      />

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">Tidak ada log aktivitas ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--color-text)]">
              <thead className="bg-[var(--color-bg-secondary)] text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Aktor</th>
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const label = actionLabels[log.action] || log.action;
                  const badgeColor = getActionBadgeColor(log.action);

                  return (
                    <tr key={log.id} className="hover:bg-[var(--color-bg)] transition-colors">
                      <td className="px-4 py-3 align-top whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary)]">
                        {formatTanggalPendek(log.createdAt)}
                        <span className="block text-[10px] mt-0.5 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-xs text-[var(--color-text)]">{log.actorName}</p>
                        <p className="text-[10px] text-[var(--color-text-secondary)]">{log.actorEmail}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-xs leading-relaxed max-w-xs sm:max-w-md break-words">
                        {log.description}
                        {log.targetTenantId && (
                          <span className="block mt-1 text-[10px] font-mono text-[var(--color-text-secondary)] bg-[var(--color-bg)] px-1.5 py-0.5 rounded w-max">
                            Tenant: {log.targetTenantId}
                          </span>
                        )}
                        {isExpanded && (
                          <div className="mt-3 grid gap-2 md:grid-cols-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-3 overflow-x-auto max-w-full font-mono text-[10px]">
                            <div>
                              <p className="font-bold text-[9px] uppercase tracking-wide text-[var(--color-text-secondary)] mb-1">
                                Data Sebelum:
                              </p>
                              <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {log.beforeJson ? JSON.stringify(log.beforeJson, null, 2) : "-"}
                              </pre>
                            </div>
                            <div>
                              <p className="font-bold text-[9px] uppercase tracking-wide text-[var(--color-text-secondary)] mb-1">
                                Data Sesudah:
                              </p>
                              <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {log.afterJson ? JSON.stringify(log.afterJson, null, 2) : "-"}
                              </pre>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                        >
                          {isExpanded ? "Tutup" : "Lihat"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
