import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Konfigurasi yang aman dijalankan di Edge Runtime (middleware/proxy):
 * TIDAK BOLEH mengimpor Prisma/bcrypt di sini. Provider Credentials (yang
 * butuh akses database) hanya didaftarkan di src/lib/auth.ts.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const typedUser = user as {
          id: string;
          tenantId: string;
          role: "OWNER" | "MANAGER" | "STAFF";
          name?: string | null;
          sessionVersion: number;
        };
        token.userId = typedUser.id;
        token.tenantId = typedUser.tenantId;
        token.role = typedUser.role;
        token.name = typedUser.name;
        token.sessionVersion = typedUser.sessionVersion;
      }
      return token;
    },
    session: ({ session, token }: { session: Session; token: JWT }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId,
          tenantId: token.tenantId,
          role: token.role,
          name: token.name,
          sessionVersion: token.sessionVersion,
        },
      };
    },
  },
};
