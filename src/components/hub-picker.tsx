"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { HUBS, type HubDef, type HubKey } from "@/lib/hubs";
import { PowerIcon } from "@/components/ui/icons";

const ACTIVE_HUB_STORAGE_KEY = "altora:activeHub";

export function HubPicker({
  hubKeys,
  userName,
  tenantName,
}: {
  hubKeys: HubKey[];
  userName: string;
  tenantName: string;
}) {
  const router = useRouter();
  // Komponen ikon (fungsi React) tidak boleh lewat batas Server->Client sebagai
  // prop — makanya cuma key (string) yang dikirim, objek HubDef lengkap
  // (termasuk ikonnya) di-resolve di sini, di dalam client component.
  const hubs: HubDef[] = HUBS.filter((hub) => hubKeys.includes(hub.key));

  function enterHub(hub: HubDef) {
    localStorage.setItem(ACTIVE_HUB_STORAGE_KEY, hub.key);
    router.push(hub.homeHref);
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">{tenantName}</p>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
              Halo, {userName.split(" ")[0]} — mau buka aplikasi apa?
            </h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Keluar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
          >
            <PowerIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <button
                key={hub.key}
                onClick={() => enterHub(hub)}
                className="group flex flex-col items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105"
                  style={{ backgroundColor: hub.color }}
                >
                  <Icon aria-hidden className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">{hub.label}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{hub.description}</p>
                </div>
                <span
                  className="mt-auto text-sm font-medium transition-opacity group-hover:opacity-70"
                  style={{ color: hub.color }}
                >
                  Buka →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
