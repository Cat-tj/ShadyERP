import { headers } from "next/headers";

/** Ambil base URL dari request saat ini, dipakai untuk bikin link QR yang absolut. */
export async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = (headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "").split(",")[0]?.trim();
  const forwardedProtocol = headersList.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (!host) {
    return process.env.NODE_ENV === "production" ? "https://altora.my.id" : "http://localhost:3000";
  }

  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https";
  return `${protocol}://${host}`;
}
