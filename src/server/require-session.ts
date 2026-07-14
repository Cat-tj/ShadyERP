import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveEnabledModules, type ModuleKey } from "@/lib/modules";

export type SessionUser = {
  id: string;
  tenantId: string;
  role: "OWNER" | "MANAGER" | "STAFF";
  sessionVersion: number;
  name: string;
  email: string;
};

type TenantAuthState = {
  user: SessionUser;
  tenant: { isActive: boolean; name: string; businessType: string; disabledModules: string[] } | null;
  userAuth: { isActive: boolean; sessionVersion: number } | null;
};

/**
 * (app)/layout.tsx SELALU manggil salah satu fungsi di file ini, lalu tiap
 * page di dalamnya biasanya manggil lagi (requireSession/requireRole/
 * requireModule) — tanpa cache ini jadi 2x auth()+query tenant per request
 * (sekali dari layout, sekali dari page), padahal hasilnya identik.
 *
 * React cache() memoize per render-request: dipanggil berkali-kali dengan
 * argumen sama dalam satu request cuma benar-benar jalan sekali.
 */
const getAuthState = cache(async (): Promise<TenantAuthState> => {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const [tenant, userAuth] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { isActive: true, name: true, businessType: true, disabledModules: true },
    }),
    prisma.user.findFirst({
      where: { id: session.user.id, tenantId: session.user.tenantId },
      select: { isActive: true, sessionVersion: true },
    }),
  ]);

  return { user: session.user as SessionUser, tenant, userAuth };
});

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
  const { user, tenant, userAuth } = await getAuthState();
  if (!userAuth?.isActive || userAuth.sessionVersion !== user.sessionVersion) {
    redirect("/login");
  }
  if (!tenant?.isActive) {
    // /akun-nonaktif sengaja dikecualikan dari proxy.ts (middleware) supaya
    // tidak terjadi redirect loop dengan aturan "sudah login tapi buka
    // /login -> lempar ke /pilih-aplikasi" di proxy.ts.
    redirect("/akun-nonaktif");
  }
  return user;
}

export async function requireRole(roles: SessionUser["role"][]): Promise<SessionUser> {
  const user = await requireSession();
  if (!roles.includes(user.role)) {
    redirect("/pilih-aplikasi");
  }
  return user;
}

/**
 * Sama seperti requireSession(), tapi sekalian kembalikan name+disabledModules
 * tenant yang sudah ke-fetch (lihat getAuthState di atas) — tanpa query
 * tambahan. Dipakai di (app)/layout.tsx.
 */
export async function requireSessionWithTenant(): Promise<{
  user: SessionUser;
  tenant: { name: string; businessType: string; disabledModules: string[] } | null;
}> {
  const { user, tenant, userAuth } = await getAuthState();
  if (!userAuth?.isActive || userAuth.sessionVersion !== user.sessionVersion) {
    redirect("/login");
  }
  if (!tenant?.isActive) {
    redirect("/akun-nonaktif");
  }
  return { user, tenant };
}

/**
 * Panggil di layout.tsx tiap route yang termasuk modul non-core (mis. /booking,
 * /absensi) supaya akses URL langsung tetap diblokir walau link-nya sudah
 * disembunyikan dari sidebar. Owner yang barusan mematikan modulnya sendiri
 * ikut ke-lempar balik — dia yang harus nyalain lagi dari Pengaturan.
 */
export async function requireModule(moduleKey: ModuleKey): Promise<SessionUser> {
  const { user, tenant, userAuth } = await getAuthState();
  if (!userAuth?.isActive || userAuth.sessionVersion !== user.sessionVersion) {
    redirect("/login");
  }
  if (!tenant?.isActive) {
    redirect("/akun-nonaktif");
  }

  const enabled = resolveEnabledModules(tenant.disabledModules ?? []);
  if (!enabled.has(moduleKey)) {
    redirect("/pilih-aplikasi");
  }
  return user;
}
