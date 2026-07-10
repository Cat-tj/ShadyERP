import { NextResponse } from "next/server";
import { requireSession } from "@/server/require-session";
import { createQuickMember } from "@/server/services/member-service";

export async function POST(request: Request) {
  const user = await requireSession();
  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name : "";
  const phone = typeof body?.phone === "string" ? body.phone : "";

  try {
    const member = await createQuickMember(user.tenantId, { name, phone });
    return NextResponse.json({ member });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat member.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
