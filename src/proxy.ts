import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { getVerticalForHostname } from "@/lib/verticals";

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
    return NextResponse.redirect(new URL("/pilih-aplikasi", req.nextUrl.origin));
  }

  const response = NextResponse.next();
  // Subdomain -> vertikal (mis. cafe.altora.my.id) cuma buat nge-tag landing
  // page dengan copy yang relevan — TIDAK memblokir modul lain (gating soft).
  const vertical = getVerticalForHostname(req.headers.get("host") ?? "");
  if (vertical) response.headers.set("x-altora-vertical", vertical.key);
  return response;
});

export const config = {
  matcher: [
    "/((?!api/auth|api/health|_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|\\.well-known/|sw\\.js|icon\\.svg|icon-192\\.png|icon-512\\.png|icon-maskable-512\\.png|apple-icon\\.png|auth/|landing-previews/|brand/|q/|pesan/|cucian|superadmin/|superadmin$|akun-nonaktif|kasir/[^/]+$).*)",
  ],
};
