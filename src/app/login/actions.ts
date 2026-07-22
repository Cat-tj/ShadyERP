"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { getBaseUrl } from "@/lib/base-url";
import { checkRateLimit, getClientIp, formatRetryMessage } from "@/lib/rate-limit";

export type LoginState = {
  error?: string;
  values?: {
    email?: string;
  };
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi.", values };
  }

  const ip = await getClientIp();
  // Dua lapis: per-IP (jaga dari serangan tersebar) dan per-email (jaga satu
  // akun target dari brute-force meski penyerang ganti-ganti IP).
  const ipLimit = checkRateLimit(`login:ip:${ip}`, 20, 60_000);
  if (!ipLimit.allowed) {
    return { error: formatRetryMessage(ipLimit.retryAfterMs), values };
  }
  const emailLimit = checkRateLimit(`login:email:${email.toLowerCase()}`, 5, 60_000);
  if (!emailLimit.allowed) {
    return { error: formatRetryMessage(emailLimit.retryAfterMs), values };
  }

  try {
    const redirectTo = `${await getBaseUrl()}/pilih-aplikasi`;
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if ((error as { code?: string }).code === "tenant_suspended") {
        return {
          error: "Akun toko ini sedang nonaktif (langganan tertunda). Hubungi admin Altora.",
          values,
        };
      }
      return { error: "Email atau kata sandi salah. Coba periksa lagi.", values };
    }
    throw error;
  }
}
