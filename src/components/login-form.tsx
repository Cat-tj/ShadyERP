"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="nama@usaha.id"
          defaultValue={state.values?.email ?? ""}
          className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base text-[var(--color-text)] outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[var(--color-text)]">
          Kata sandi
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Minimal 6 karakter"
            className="min-h-[48px] w-full rounded-lg border border-[var(--color-border)] bg-white/70 px-4 pr-24 text-base text-[var(--color-text)] outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <button
            type="button"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-1 right-1 min-w-20 rounded-md px-3 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          >
            {showPassword ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
        )}
        {isPending ? "Memeriksa..." : "Masuk"}
      </button>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-[var(--color-primary)]">
          Daftar usaha baru
        </Link>
      </p>
    </form>
  );
}
