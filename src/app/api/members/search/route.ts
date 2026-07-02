import { NextResponse } from "next/server";
import { requireSession } from "@/server/require-session";
import { searchMembers } from "@/server/services/member-service";

export async function GET(request: Request) {
  const user = await requireSession();
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const members = await searchMembers(user.tenantId, query);
  return NextResponse.json({ members });
}
