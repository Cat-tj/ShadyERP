import { AwardIcon } from "@/components/ui/icons";
import { requireSession } from "@/server/require-session";
import { listKpiAssignees, listVisibleKpiGoals } from "@/server/services/kpi-goal-service";
import { KpiGoalManager } from "@/components/hr/kpi-goal-manager";

export default async function HrisKpiPage() {
  const user = await requireSession();
  const [goals, assignees] = await Promise.all([listVisibleKpiGoals(user), listKpiAssignees(user)]);
  const canManage = user.role === "OWNER" || user.role === "MANAGER";
  const departments = Array.from(
    new Set(assignees.map((worker) => worker.assignments[0]?.department).filter((department): department is string => Boolean(department)))
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft-sm)] sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <AwardIcon aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Altora HRIS</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Target & KPI</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Pantau target staf, target departemen, dan target organisasi. Akses manager dikunci oleh struktur tim di server.
            </p>
          </div>
        </div>
      </div>

      <KpiGoalManager
        canManage={canManage}
        goals={goals.map((goal) => ({
          id: goal.id,
          title: goal.title,
          scope: goal.scope,
          department: goal.department,
          targetValue: goal.targetValue,
          actualValue: goal.actualValue,
          weight: goal.weight,
          status: goal.status,
          assigneeName: goal.worker?.person.name ?? null,
        }))}
        assignees={assignees.map((worker) => ({
          id: worker.id,
          name: worker.person.name,
          department: worker.assignments[0]?.department ?? null,
        }))}
        departments={departments}
      />
    </div>
  );
}
