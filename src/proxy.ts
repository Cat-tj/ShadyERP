import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { getVerticalForHostname } from "@/lib/verticals";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const isLanding = pathname === "/";
  const isAuthEntryPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isPublicPath = isLanding || isAuthEntryPath;

  const vertical = getVerticalForHostname(host);
  const isRootAltoraDomain = host === "altora.my.id" || host === "www.altora.my.id";

  // The apex is a product directory and marketing site only. Product access
  // always starts from the relevant product subdomain.
  if (isRootAltoraDomain && (isAuthEntryPath || (req.auth && !isLanding))) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (!req.auth && !isPublicPath) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Landing tetap dapat dibuka oleh user yang sudah login. Hanya halaman
  // autentikasi yang tidak boleh dibuka ulang saat sesi masih aktif.
  if (req.auth && isAuthEntryPath) {
    return NextResponse.redirect(new URL("/pilih-aplikasi", req.nextUrl.origin));
  }

  const requestHeaders = new Headers(req.headers);
  if (vertical) requestHeaders.set("x-altora-vertical", vertical.key);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    "/((?!api/auth|api/health|_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|\\.well-known/|sw\\.js|icon\\.svg|icon-192\\.png|icon-512\\.png|icon-maskable-512\\.png|apple-icon\\.png|auth/|landing-previews/|brand/|q/|pesan/|cucian|superadmin/|superadmin$|akun-nonaktif|kasir/[^/]+$).*)",
  ],
};
