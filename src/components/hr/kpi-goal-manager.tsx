"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createKpiGoalAction, updateKpiProgressAction } from "@/app/(app)/hris/kpi/actions";

type Goal = {
  id: string;
  title: string;
  scope: string;
  department: string | null;
  targetValue: number;
  actualValue: number;
  weight: number;
  status: string;
  assigneeName: string | null;
};

type Assignee = { id: string; name: string; department: string | null };

const scopeLabels: Record<string, string> = {
  INDIVIDUAL: "Individu",
  DEPARTMENT: "Departemen",
  ORGANIZATION: "Organisasi",
};

function progress(goal: Goal) {
  if (goal.targetValue <= 0) return 0;
  return Math.min(100, Math.round((goal.actualValue / goal.targetValue) * 100));
}

export function KpiGoalManager({
  goals,
  assignees,
  departments,
  canManage,
}: {
  goals: Goal[];
  assignees: Assignee[];
  departments: string[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [scope, setScope] = useState("INDIVIDUAL");
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [weight, setWeight] = useState("100");
  const [workerId, setWorkerId] = useState(assignees[0]?.id ?? "");
  const [department, setDepartment] = useState(departments[0] ?? "");
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const scopeOptions = useMemo(() => ["INDIVIDUAL", "DEPARTMENT", "ORGANIZATION"], []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createKpiGoalAction({
        title,
        targetValue: Number(targetValue),
        weight: Number(weight),
        scope,
        workerId: scope === "INDIVIDUAL" ? workerId : undefined,
        department: scope === "DEPARTMENT" ? department : undefined,
      });

      if (!result.succeeded) {
        setError(result.message ?? "Gagal membuat KPI.");
        return;
      }

      setTitle("");
      setTargetValue("");
      setWeight("100");
      setError(null);
      router.refresh();
    });
  }

  function saveProgress(goal: Goal) {
    const actualValue = Number(progressInputs[goal.id] ?? goal.actualValue);
    startTransition(async () => {
      const result = await updateKpiProgressAction(goal.id, actualValue);
      if (!result.succeeded) {
        setError(result.message ?? "Gagal memperbarui progres KPI.");
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      {canManage && (
        <form onSubmit={submit} className="h-fit rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft-sm)]">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Buat target KPI</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Gunakan target yang bisa diukur agar review kinerja tidak sekadar opini.</p>

          <label className="mt-5 block text-xs font-bold text-[var(--color-text-secondary)]">
            Jenis target
            <select value={scope} onChange={(event) => setScope(event.target.value)} className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]">
              {scopeOptions.map((option) => <option key={option} value={option}>{scopeLabels[option]}</option>)}
            </select>
          </label>

          <label className="mt-3 block text-xs font-bold text-[var(--color-text-secondary)]">
            Nama KPI
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Ketepatan pengiriman" className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]" />
          </label>

          {scope === "INDIVIDUAL" && (
            <label className="mt-3 block text-xs font-bold text-[var(--color-text-secondary)]">
              Karyawan
              <select value={workerId} onChange={(event) => setWorkerId(event.target.value)} className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]">
                <option value="">Pilih karyawan</option>
                {assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}{assignee.department ? ` - ${assignee.department}` : ""}</option>)}
              </select>
            </label>
          )}

          {scope === "DEPARTMENT" && (
            <label className="mt-3 block text-xs font-bold text-[var(--color-text-secondary)]">
              Departemen
              <select value={department} onChange={(event) => setDepartment(event.target.value)} className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]">
                <option value="">Pilih departemen</option>
                {departments.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block text-xs font-bold text-[var(--color-text-secondary)]">
              Target angka
              <input inputMode="decimal" value={targetValue} onChange={(event) => setTargetValue(event.target.value)} placeholder="100" className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]" />
            </label>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)]">
              Bobot (%)
              <input inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="100" className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]" />
            </label>
          </div>

          {scope === "ORGANIZATION" && <p className="mt-3 rounded-lg bg-[var(--color-bg)] p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">Target organisasi ditampilkan kepada Owner dan manager CD IMM. Manager lain tetap hanya melihat target timnya.</p>}
          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
          <button disabled={isPending} className="mt-5 min-h-[46px] w-full rounded-lg bg-[var(--color-primary)] px-4 text-sm font-bold text-[var(--color-on-primary)] disabled:opacity-50">{isPending ? "Menyimpan..." : "Simpan KPI"}</button>
        </form>
      )}

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft-sm)]">
        <div className="border-b border-[var(--color-border)] p-5">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">KPI yang dapat Anda lihat</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{goals.length} target tersedia sesuai peran dan struktur tim Anda.</p>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {goals.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-[var(--color-text)]">Belum ada KPI yang bisa ditampilkan.</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Tambahkan target pertama atau hubungkan profil User dengan data Worker.</p>
            </div>
          ) : goals.map((goal) => {
            const value = progress(goal);
            const editableValue = progressInputs[goal.id] ?? String(goal.actualValue);
            return (
              <article key={goal.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[var(--color-text)]">{goal.title}</h3>
                      <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-secondary)]">{scopeLabels[goal.scope] ?? goal.scope}</span>
                      {goal.status === "ACHIEVED" && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Tercapai</span>}
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{goal.assigneeName ?? goal.department ?? "Target perusahaan"} · Bobot {Math.round(goal.weight * 100)}%</p>
                  </div>
                  <p className="tabular-nums text-lg font-bold text-[var(--color-text)]">{value}%</p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]"><div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${Math.max(2, value)}%` }} /></div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]"><span>Realisasi {goal.actualValue}</span><span>Target {goal.targetValue}</span></div>
                {canManage && (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <label className="block flex-1 text-xs font-bold text-[var(--color-text-secondary)]">Update realisasi
                      <input inputMode="decimal" value={editableValue} onChange={(event) => setProgressInputs((current) => ({ ...current, [goal.id]: event.target.value }))} className="mt-1 min-h-[42px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm font-medium text-[var(--color-text)]" />
                    </label>
                    <button type="button" disabled={isPending} onClick={() => saveProgress(goal)} className="min-h-[42px] rounded-lg border border-[var(--color-border)] px-4 text-sm font-bold text-[var(--color-text)] disabled:opacity-50">Simpan progres</button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
