"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySuperAdminCredentials } from "@/server/services/super-admin-service";
import { createSuperAdminSessionCookie, SUPER_ADMIN_COOKIE_NAME } from "@/lib/super-admin-session";

export type SuperAdminLoginState = { error?: string };

export async function superAdminLoginAction(
  _prevState: SuperAdminLoginState,
  formData: FormData
): Promise<SuperAdminLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const admin = await verifySuperAdminCredentials(email, password);
  if (!admin) {
    return { error: "Email atau kata sandi salah." };
  }

  const cookie = createSuperAdminSessionCookie(admin.id);
  const cookieStore = await cookies();
  cookieStore.set(cookie.name, cookie.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: cookie.maxAgeSeconds,
  });

  redirect("/superadmin");
}

export async function superAdminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPER_ADMIN_COOKIE_NAME);
  redirect("/superadmin/login");
}
