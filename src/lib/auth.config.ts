import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

function isAltoraOrigin(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return url.protocol === "https:" && (host === "altora.my.id" || host.endsWith(".altora.my.id"));
}

function isLocalDevelopmentOrigin(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return process.env.NODE_ENV !== "production" && (host === "localhost" || host === "127.0.0.1" || host === "::1");
}

function getSafeBaseUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl);
    if (isAltoraOrigin(parsed) || isLocalDevelopmentOrigin(parsed)) return parsed.origin;
  } catch {
    // Auth.js still receives a safe public fallback below.
  }

  return "https://altora.my.id";
}

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
    redirect: ({ url, baseUrl }) => {
      const safeBaseUrl = getSafeBaseUrl(baseUrl);

      if (url.startsWith("/")) return new URL(url, safeBaseUrl).toString();

      try {
        const target = new URL(url);
        if (isAltoraOrigin(target) || isLocalDevelopmentOrigin(target)) {
          return target.toString();
        }
      } catch {
        // Invalid callback URLs must never become redirects.
      }

      return safeBaseUrl;
    },
    jwt: ({ token, user }) => {
      if (user) {
        const typedUser = user as {
          id: string;
          tenantId: string;
          role: "OWNER" | "MANAGER" | "STAFF";
          name?: string | null;
        };
        token.userId = typedUser.id;
        token.tenantId = typedUser.tenantId;
        token.role = typedUser.role;
        token.name = typedUser.name;
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
        },
      };
    },
  },
};
