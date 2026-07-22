"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { getBaseUrl } from "@/lib/base-url";
import { registerTenant } from "@/server/services/tenant-service";
import { checkRateLimit, getClientIp, formatRetryMessage } from "@/lib/rate-limit";
import { BUSINESS_MODES, BUSINESS_MODE_MAP, businessModeForVerticalKey } from "@/lib/business-modes";
import { getRequestVertical } from "@/lib/request-vertical";
import { MODULES } from "@/lib/modules";

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

const businessModeKeys = BUSINESS_MODES.map((mode) => mode.key) as [
  (typeof BUSINESS_MODES)[number]["key"],
  ...(typeof BUSINESS_MODES)[number]["key"][],
];

const registerSchema = z.object({
  businessName: z.string().min(2, "Nama usaha minimal 2 karakter."),
  businessType: z.enum(businessModeKeys),
  outletName: z.string().min(2, "Nama outlet minimal 2 karakter."),
  ownerName: z.string().min(2, "Nama pemilik minimal 2 karakter."),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
});

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const vertical = await getRequestVertical();
  const forcedBusinessType = vertical
    ? businessModeForVerticalKey(vertical.key)
    : String(formData.get("businessType") ?? "CAFE");

  const values = {
    businessName: String(formData.get("businessName") ?? ""),
    businessType: forcedBusinessType,
    outletName: String(formData.get("outletName") ?? ""),
    ownerName: String(formData.get("ownerName") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

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

  const allToggleableModuleKeys = MODULES.filter((module) => !module.core).map((module) => module.key);
  const authoritativeEnabledModules = vertical
    ? vertical.modules
    : BUSINESS_MODE_MAP[parsed.data.businessType].recommendedModules;
  const enabledSet = new Set(authoritativeEnabledModules);
  const disabledModules = allToggleableModuleKeys.filter((key) => !enabledSet.has(key));
  const seedSampleData = false;

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
    const redirectTo = `${await getBaseUrl()}/pilih-aplikasi`;
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Akun berhasil dibuat, tapi gagal masuk otomatis. Silakan masuk manual.", values };
    }
    throw error;
  }
}
