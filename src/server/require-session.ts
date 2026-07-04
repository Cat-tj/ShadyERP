import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveEnabledModules, type ModuleKey } from "@/lib/modules";

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

/**
 * Panggil di layout.tsx tiap route yang termasuk modul non-core (mis. /booking,
 * /absensi) supaya akses URL langsung tetap diblokir walau link-nya sudah
 * disembunyikan dari sidebar. Owner yang barusan mematikan modulnya sendiri
 * ikut ke-lempar balik — dia yang harus nyalain lagi dari Pengaturan.
 */
export async function requireModule(moduleKey: ModuleKey): Promise<SessionUser> {
  const user = await requireSession();
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { disabledModules: true },
  });
  const enabled = resolveEnabledModules(tenant?.disabledModules ?? []);
  if (!enabled.has(moduleKey)) {
    redirect("/dashboard");
  }
  return user;
}
