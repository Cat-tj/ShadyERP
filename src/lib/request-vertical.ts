import { headers } from "next/headers";
import { VERTICAL_MAP, type VerticalDef, type VerticalKey } from "@/lib/verticals";

/** Vertical sudah ditentukan oleh proxy dari hostname request saat ini. */
export async function getRequestVertical(): Promise<VerticalDef | undefined> {
  const headerList = await headers();
  const key = headerList.get("x-altora-vertical") as VerticalKey | null;
  return key ? VERTICAL_MAP[key] : undefined;
}
