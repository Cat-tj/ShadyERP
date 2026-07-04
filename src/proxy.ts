import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublicPath = pathname === "/" || PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!req.auth && !isPublicPath) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth && isPublicPath) {
    return NextResponse.redirect(new URL("/kpi", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|icon\\.svg|icon-192\\.png|icon-512\\.png|icon-maskable-512\\.png|apple-icon\\.png|auth/|q/|pesan/|superadmin/|superadmin$|akun-nonaktif).*)",
  ],
};
