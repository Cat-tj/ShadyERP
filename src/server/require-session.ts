import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/login");
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
