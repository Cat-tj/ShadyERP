"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type RegisterState } from "@/app/register/actions";

const initialState: RegisterState = {};

const BUSINESS_TYPES = [
  { value: "FNB", label: "Makanan & Minuman" },
  { value: "BARBERSHOP", label: "Barbershop / Salon" },
  { value: "RETAIL", label: "Toko / Retail" },
  { value: "SERVICE", label: "Jasa" },
  { value: "OTHER", label: "Lainnya" },
];

function Field({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base text-[var(--color-text)] outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
    </div>
  );
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {state.error}
        </div>
      )}

      <Field id="businessName" name="businessName" label="Nama usaha" placeholder="Kopi Nusantara" />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="businessType" className="text-sm font-medium text-[var(--color-text)]">
          Jenis usaha
        </label>
        <select
          id="businessType"
          name="businessType"
          required
          defaultValue="FNB"
          className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base text-[var(--color-text)] outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
        >
          {BUSINESS_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <Field id="outletName" name="outletName" label="Nama outlet pertama" placeholder="Cabang Kemang" />
      <Field id="ownerName" name="ownerName" label="Nama pemilik" placeholder="Nama lengkapmu" autoComplete="name" />
      <Field id="email" name="email" label="Email" type="email" placeholder="nama@usaha.id" autoComplete="email" />
      <Field
        id="password"
        name="password"
        label="Kata sandi"
        type="password"
        placeholder="Minimal 6 karakter"
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
        )}
        {isPending ? "Membuat akun..." : "Daftar & buat toko"}
      </button>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-primary)]">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
