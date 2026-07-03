import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  tenantId: string;
  role: "OWNER" | "MANAGER" | "STAFF";
  name: string;
  email: string;
};

/**
 * Panggil ini di setiap Server Component / Server Action yang butuh data tenant.
 * Mengembalikan tenantId dari sesi login — JANGAN PERNAH menerima tenantId dari
 * client (form/query param), selalu ambil dari sini agar tidak bisa dipalsukan.
 *
 * Ikut mengecek tenant.isActive tiap request (bukan cuma saat login) supaya
 * kalau super-admin men-suspend tenant, akses langsung terputus walau sesi
 * JWT-nya masih berlaku — bukan cuma memblokir login baru.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { isActive: true },
  });
  if (!tenant?.isActive) {
    // /akun-nonaktif sengaja dikecualikan dari proxy.ts (middleware) supaya
    // tidak terjadi redirect loop dengan aturan "sudah login tapi buka
    // /login -> lempar ke /dashboard" di proxy.ts.
    redirect("/akun-nonaktif");
  }

  return session.user as SessionUser;
}

export async function requireRole(roles: SessionUser["role"][]): Promise<SessionUser> {
  const user = await requireSession();
  if (!roles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}
