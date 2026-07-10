"use client";

import { useState, useTransition } from "react";
import { updateDisabledModulesAction } from "@/app/(app)/pengaturan/modul/actions";
import { useToast, Toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import type { ModuleDef, ModuleKey } from "@/lib/modules";
import { BUSINESS_MODE_MAP, type BusinessModeKey } from "@/lib/business-modes";

export function ModulManager({
  modules,
  enabledKeys,
  businessMode,
}: {
  modules: ModuleDef[];
  enabledKeys: ModuleKey[];
  businessMode: BusinessModeKey;
}) {
  const { toastMessage, showToast } = useToast();
  const [enabled, setEnabled] = useState<Set<ModuleKey>>(new Set(enabledKeys));
  const [isPending, startTransition] = useTransition();

  function toggle(key: ModuleKey) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const disabled = modules.map((m) => m.key).filter((key) => !enabled.has(key));
      const result = await updateDisabledModulesAction(disabled);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Modul disimpan.");
    });
  }

  function applyPreset() {
    const recommended = new Set(BUSINESS_MODE_MAP[businessMode].recommendedModules);
    setEnabled(new Set(modules.filter((m) => recommended.has(m.key)).map((m) => m.key)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-base font-semibold text-[var(--color-text)]">Modul aktif</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Matikan modul yang tidak dipakai tokomu — menu dan aksesnya ikut hilang buat semua karyawan.
          Kasir &amp; Produk selalu aktif karena fitur lain bergantung ke situ.
        </p>
        <button
          type="button"
          onClick={applyPreset}
          className="mt-4 min-h-[40px] rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          Pakai preset {BUSINESS_MODE_MAP[businessMode].label}
        </button>
        <div className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
          {modules.map((m) => {
            const isOn = enabled.has(m.key);
            return (
              <div key={m.key} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{m.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{m.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  aria-label={`Modul ${m.label}`}
                  onClick={() => toggle(m.key)}
                  className="relative h-8 w-14 shrink-0 rounded-full p-1 shadow-inner transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25"
                  style={{ backgroundColor: isOn ? m.color : "var(--color-border)" }}
                >
                  <span
                    aria-hidden
                    className="block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ease-out"
                    style={{ transform: isOn ? "translateX(24px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            );
          })}
        </div>
        <Button className="mt-4" onClick={handleSave} disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
      <Toast message={toastMessage} />
    </div>
  );
}
