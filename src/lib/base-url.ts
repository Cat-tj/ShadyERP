import { headers } from "next/headers";

/** Ambil base URL dari request saat ini, dipakai untuk bikin link QR yang absolut. */
export async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}
