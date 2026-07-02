import type { DefaultSession } from "next-auth";

// next-auth re-exports Session/User/JWT from @auth/core, jadi augmentasi
// harus menargetkan modul aslinya di sana agar benar-benar ter-merge.
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      role: "OWNER" | "MANAGER" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    tenantId: string;
    role: "OWNER" | "MANAGER" | "STAFF";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    tenantId: string;
    role: "OWNER" | "MANAGER" | "STAFF";
  }
}
