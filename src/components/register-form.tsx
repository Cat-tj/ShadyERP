"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { registerAction, type RegisterState } from "@/app/register/actions";

const initialState: RegisterState = {};

const BUSINESS_TYPES = [
  { value: "FNB", label: "Makanan & Minuman", desc: "Kafe, resto, depot" },
  { value: "BARBERSHOP", label: "Barbershop & Salon", desc: "Cukur, salon, kecantikan" },
  { value: "RETAIL", label: "Toko & Retail", desc: "Minimarket, butik, warung" },
  { value: "SERVICE", label: "Jasa & Layanan", desc: "Laundry, bimbel, bengkel" },
  { value: "OTHER", label: "Usaha Lainnya", desc: "Sektor industri lainnya" },
] as const;

const TOGGLEABLE_MODULES = [
  { key: "inventory", label: "Inventory", desc: "Produk, stok, supplier, pembelian, barang masuk, opname" },
  { key: "pesanan-digital", label: "Pemesanan Digital", desc: "Menu QR meja & kitchen display" },
  { key: "booking", label: "Booking & Janji Temu", desc: "Sistem reservasi & jadwal kerja" },
  { key: "laundry", label: "Laundry", desc: "Order kiloan/satuan, pickup, delivery, status cucian" },
  { key: "member", label: "Member & Loyalitas", desc: "Poin belanja, saldo deposit, kartu QR" },
  { key: "hr", label: "HR & Absensi", desc: "Jadwal shift & absensi foto + GPS" },
  { key: "keuangan", label: "Laporan Keuangan", desc: "Arus kas, laba-rugi, & pengeluaran" },
  { key: "promo", label: "Promo & Marketing", desc: "Happy hour & diskon otomatis" },
] as const;

const MODULE_RECOMMENDATIONS: Record<string, string[]> = {
  FNB: ["inventory", "pesanan-digital", "member", "hr", "keuangan", "promo"],
  BARBERSHOP: ["inventory", "booking", "member", "hr", "keuangan", "promo"],
  RETAIL: ["inventory", "member", "hr", "keuangan", "promo"],
  SERVICE: ["inventory", "booking", "laundry", "hr", "keuangan"],
  OTHER: ["inventory", "hr", "keuangan"],
};

type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);

  // Form Fields State
  const [ownerName, setOwnerName] = useState(state.values?.ownerName ?? "");
  const [email, setEmail] = useState(state.values?.email ?? "");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState(state.values?.businessName ?? "");
  const [businessType, setBusinessType] = useState<BusinessType>("FNB");
  const [outletName, setOutletName] = useState(state.values?.outletName ?? "");
  const [enabledModules, setEnabledModules] = useState<string[]>(MODULE_RECOMMENDATIONS.FNB);
  const [seedSampleData, setSeedSampleData] = useState(true);
  const displayedError = localError ?? state.error ?? null;

  const allKeys = ["inventory", "pesanan-digital", "booking", "laundry", "member", "hr", "keuangan", "promo"];
  const disabledModules = allKeys.filter((k) => !enabledModules.includes(k));

  function validateStep1() {
    if (!ownerName.trim()) {
      setLocalError("Nama pemilik wajib diisi.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setLocalError("Format email tidak valid.");
      return false;
    }
    if (password.length < 6) {
      setLocalError("Kata sandi minimal 6 karakter.");
      return false;
    }
    setLocalError(null);
    return true;
  }

  function validateStep2() {
    if (!businessName.trim()) {
      setLocalError("Nama usaha wajib diisi.");
      return false;
    }
    if (!outletName.trim()) {
      setLocalError("Nama outlet pertama wajib diisi.");
      return false;
    }
    setLocalError(null);
    return true;
  }

  function nextStep() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  function prevStep() {
    setLocalError(null);
    if (step > 1) setStep(step - 1);
  }

  function toggleModule(key: string) {
    setEnabledModules((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Hidden inputs to send survey & wizard results */}
      <input type="hidden" name="ownerName" value={ownerName} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="password" value={password} />
      <input type="hidden" name="businessName" value={businessName} />
      <input type="hidden" name="businessType" value={businessType} />
      <input type="hidden" name="outletName" value={outletName} />
      <input type="hidden" name="disabledModules" value={JSON.stringify(disabledModules)} />
      <input type="hidden" name="seedSampleData" value={String(seedSampleData)} />

      {/* Beautiful Progress Dots */}
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
        <span className={`font-semibold transition-colors ${step >= 1 ? "text-[var(--color-primary)] font-bold" : ""}`}>
          1. Akun Pemilik
        </span>
        <span className={`h-[2px] flex-1 mx-3 rounded-full transition-colors ${step >= 2 ? "bg-[var(--color-primary)]/40" : "bg-[var(--color-border)]"}`} />
        <span className={`font-semibold transition-colors ${step >= 2 ? "text-[var(--color-primary)] font-bold" : ""}`}>
          2. Profil &amp; Modul
        </span>
        <span className={`h-[2px] flex-1 mx-3 rounded-full transition-colors ${step >= 3 ? "bg-[var(--color-primary)]/40" : "bg-[var(--color-border)]"}`} />
        <span className={`font-semibold transition-colors ${step >= 3 ? "text-[var(--color-primary)] font-bold" : ""}`}>
          3. Kustomisasi
        </span>
      </div>

      {displayedError && (
        <div className="rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)] transition-all">
          {displayedError}
        </div>
      )}

      {/* STEP 1: Account Credentials */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama Pemilik</label>
            <input
              type="text"
              required
              placeholder="Nama lengkap Anda"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Email</label>
            <input
              type="email"
              required
              placeholder="nama@usaha.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Kata Sandi</label>
            <input
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <button
            type="button"
            onClick={nextStep}
            className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90"
          >
            Lanjut ke Profil Usaha →
          </button>
        </div>
      )}

      {/* STEP 2: Business Type & Profile */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama Usaha</label>
            <input
              type="text"
              required
              placeholder="Kopi Nusantara"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama Outlet Pertama</label>
            <input
              type="text"
              required
              placeholder="Cabang Kemang"
              value={outletName}
              onChange={(e) => setOutletName(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Jenis Usaha</label>
            <div className="grid grid-cols-2 gap-2 mt-1 sm:grid-cols-3">
              {BUSINESS_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setBusinessType(t.value);
                    setEnabledModules(MODULE_RECOMMENDATIONS[t.value] ?? ["hr", "keuangan"]);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                    businessType === t.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-semibold shadow-sm"
                      : "border-[var(--color-border)] bg-white/50 hover:bg-white text-[var(--color-text)]"
                  }`}
                >
                  <span className="text-xs font-semibold leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={prevStep}
              className="flex min-h-[52px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] text-base font-semibold text-[var(--color-text)] hover:bg-white/50"
            >
              ← Kembali
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="flex min-h-[52px] flex-[2] items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90"
            >
              Kustomisasi Fitur →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Module Customization & Demo Data */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[var(--color-text)]">
                Pilih Fitur yang Diaktifkan
              </label>
              <span className="text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-bold">
                Bisa diubah nanti
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] -mt-1">
              Kami merekomendasikan fitur berikut berdasarkan jenis usaha Anda.
            </p>

            <div className="mt-2 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {TOGGLEABLE_MODULES.map((m) => {
                const isChecked = enabledModules.includes(m.key);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleModule(m.key)}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                      isChecked
                        ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5"
                        : "border-[var(--color-border)] bg-white/40 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isChecked ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>
                          {m.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="h-4.5 w-4.5 rounded border-[var(--color-border)] accent-[var(--color-primary)] shrink-0 pointer-events-none"
                        />
                      </div>
                      <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                        {m.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seed Data Option */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white/50 p-3 mt-1">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={seedSampleData}
                onChange={(e) => setSeedSampleData(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-[var(--color-border)] accent-[var(--color-primary)] shrink-0"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-[var(--color-text)]">
                  Muat Data Sampel Bawaan ({businessType})
                </span>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                  Membuat beberapa produk, kategori, stok, dan pengaturan sampel otomatis agar Anda bisa langsung mencoba sistem kasir dan operasional.
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={prevStep}
              className="flex min-h-[52px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] text-base font-semibold text-[var(--color-text)] hover:bg-white/50"
            >
              ← Kembali
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex min-h-[52px] flex-[2] items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
              )}
              {isPending ? "Mendaftarkan Usaha..." : "Selesaikan & Buat Toko"}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-[var(--color-text-secondary)] mt-1">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
