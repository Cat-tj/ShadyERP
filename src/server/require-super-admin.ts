import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SUPER_ADMIN_COOKIE_NAME, verifySuperAdminSessionCookie } from "@/lib/super-admin-session";

export type SuperAdminSession = { id: string; email: string; name: string };

/** Panggil ini di tiap halaman/Server Action di bawah /superadmin. */
export async function requireSuperAdmin(): Promise<SuperAdminSession> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)?.value;
  const superAdminId = verifySuperAdminSessionCookie(cookieValue);
  if (!superAdminId) {
    redirect("/superadmin/login");
  }

  const admin = await prisma.superAdmin.findUnique({ where: { id: superAdminId } });
  if (!admin) {
    redirect("/superadmin/login");
  }

  return { id: admin.id, email: admin.email, name: admin.name };
}
