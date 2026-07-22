"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { getCurrentLoginUrl } from "@/lib/auth-client";
import { HUBS, type HubDef, type HubKey } from "@/lib/hubs";
import { PowerIcon } from "@/components/ui/icons";
import { BUSINESS_MODE_MAP, type BusinessModeKey } from "@/lib/business-modes";

const ACTIVE_HUB_STORAGE_KEY = "altora:activeHub";

function useGreeting() {
  // Dihitung setelah mount (bukan saat render server) supaya jam server &
  // klien yang beda timezone tidak bikin hydration mismatch.
  const [greeting, setGreeting] = useState("Selamat datang");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const h = new Date().getHours();
      if (h < 11) setGreeting("Selamat pagi");
      else if (h < 15) setGreeting("Selamat siang");
      else if (h < 19) setGreeting("Selamat sore");
      else setGreeting("Selamat malam");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return greeting;
}

export function HubPicker({
  hubKeys,
  userName,
  tenantName,
  businessMode,
}: {
  hubKeys: HubKey[];
  userName: string;
  tenantName: string;
  businessMode: BusinessModeKey;
}) {
  const router = useRouter();
  const greeting = useGreeting();
  const [enteringKey, setEnteringKey] = useState<HubKey | null>(null);
  // Komponen ikon (fungsi React) tidak boleh lewat batas Server->Client sebagai
  // prop — makanya cuma key (string) yang dikirim, objek HubDef lengkap
  // (termasuk ikonnya) di-resolve di sini, di dalam client component.
  const hubs: HubDef[] = HUBS.filter((hub) => hubKeys.includes(hub.key));
  const mode = BUSINESS_MODE_MAP[businessMode];

  function enterHub(hub: HubDef) {
    setEnteringKey(hub.key);
    localStorage.setItem(ACTIVE_HUB_STORAGE_KEY, hub.key);
    router.push(hub.homeHref);
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-14">
      {/* Wash gradient lembut, warna diambil dari hub pertama biar tetap "hidup" tanpa hardcode satu warna */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(60rem 40rem at 12% -10%, ${hubs[0]?.colorSoft ?? "rgba(37,99,235,0.10)"} 0%, transparent 60%),
            radial-gradient(50rem 34rem at 100% 10%, ${hubs[1]?.colorSoft ?? "rgba(22,163,74,0.08)"} 0%, transparent 55%),
            linear-gradient(180deg, var(--color-bg-secondary) 0%, var(--color-bg) 40%, var(--color-bg-secondary) 100%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div className="animate-[fadeInUp_0.5s_ease-out_forwards]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              {tenantName}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
              {greeting}, {userName.split(" ")[0]}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)] sm:text-base">
              {mode.label} · {mode.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {mode.painKillers.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: getCurrentLoginUrl() })}
            aria-label="Keluar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            <PowerIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hubs.map((hub, i) => {
            const Icon = hub.icon;
            const isEntering = enteringKey === hub.key;
            return (
              <button
                key={hub.key}
                onClick={() => enterHub(hub)}
                disabled={enteringKey !== null}
                style={{ animationDelay: `${80 + i * 70}ms` }}
                className="group relative flex animate-[fadeInUp_0.5s_ease-out_forwards] flex-col items-start gap-5 overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]/80 p-7 text-left opacity-0 shadow-[var(--shadow-soft-sm)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-soft)] disabled:pointer-events-none disabled:opacity-40"
              >
                {/* Aksen gradient tipis yang nongol pas hover, warnanya ikut hub */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundImage: `linear-gradient(135deg, ${hub.colorSoft} 0%, transparent 65%)` }}
                />

                <div className="relative flex w-full items-start justify-between">
                  <div
                    className="flex items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${hub.color} 0%, ${hub.colorDark} 100%)`,
                      width: "3.25rem",
                      height: "3.25rem",
                    }}
                  >
                    <Icon aria-hidden className="h-6 w-6" />
                  </div>
                  {isEntering && (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-text)]" />
                  )}
                </div>

                <div className="relative">
                  <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">{hub.label}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{hub.description}</p>
                </div>

                <span
                  className="relative mt-auto flex items-center gap-1 text-sm font-medium transition-all duration-300 group-hover:gap-2"
                  style={{ color: hub.color }}
                >
                  Buka
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
