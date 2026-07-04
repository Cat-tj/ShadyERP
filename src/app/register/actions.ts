"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { registerTenant } from "@/server/services/tenant-service";
import { checkRateLimit, getClientIp, formatRetryMessage } from "@/lib/rate-limit";

export type RegisterState = {
  error?: string;
};

const registerSchema = z.object({
  businessName: z.string().min(2, "Nama usaha minimal 2 karakter."),
  businessType: z.enum(["FNB", "BARBERSHOP", "RETAIL", "SERVICE", "OTHER"]),
  outletName: z.string().min(2, "Nama outlet minimal 2 karakter."),
  ownerName: z.string().min(2, "Nama pemilik minimal 2 karakter."),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
});

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`register:ip:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return { error: formatRetryMessage(limit.retryAfterMs) };
  }

  const parsed = registerSchema.safeParse({
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType"),
    outletName: formData.get("outletName"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data belum lengkap." };
  }

  try {
    await registerTenant(parsed.data);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Gagal mendaftarkan usaha. Coba lagi." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/pilih-aplikasi",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Akun berhasil dibuat, tapi gagal masuk otomatis. Silakan masuk manual." };
    }
    throw error;
  }
}
