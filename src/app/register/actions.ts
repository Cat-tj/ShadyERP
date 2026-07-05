"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { registerTenant } from "@/server/services/tenant-service";
import { checkRateLimit, getClientIp, formatRetryMessage } from "@/lib/rate-limit";

export type RegisterState = {
  error?: string;
  values?: {
    businessName?: string;
    businessType?: string;
    outletName?: string;
    ownerName?: string;
    email?: string;
  };
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
  const values = {
    businessName: String(formData.get("businessName") ?? ""),
    businessType: String(formData.get("businessType") ?? "FNB"),
    outletName: String(formData.get("outletName") ?? ""),
    ownerName: String(formData.get("ownerName") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const disabledModulesStr = String(formData.get("disabledModules") ?? "[]");
  let disabledModules: string[] = [];
  try {
    disabledModules = JSON.parse(disabledModulesStr);
  } catch (e) {}

  const seedSampleData = formData.get("seedSampleData") === "true";

  const ip = await getClientIp();
  const limit = checkRateLimit(`register:ip:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return { error: formatRetryMessage(limit.retryAfterMs), values };
  }

  const parsed = registerSchema.safeParse({
    businessName: values.businessName,
    businessType: values.businessType,
    outletName: values.outletName,
    ownerName: values.ownerName,
    email: values.email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data belum lengkap.", values };
  }

  try {
    await registerTenant({
      ...parsed.data,
      disabledModules,
      seedSampleData,
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, values };
    }
    return { error: "Gagal mendaftarkan usaha. Coba lagi.", values };
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
      return { error: "Akun berhasil dibuat, tapi gagal masuk otomatis. Silakan masuk manual.", values };
    }
    throw error;
  }
}
