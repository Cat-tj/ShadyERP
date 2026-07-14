import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMissingRuntimeConfig } from "@/lib/runtime-config";

/**
 * Endpoint publik buat di-ping berkala (cron eksternal seperti cron-job.org
 * atau UptimeRobot) supaya function Vercel & koneksi database tidak "tidur"
 * (cold start) pas idle lama. Sengaja dikecualikan dari auth di proxy.ts.
 */
export async function GET() {
  const missingConfig = getMissingRuntimeConfig();
  if (missingConfig.length > 0) {
    return NextResponse.json(
      { ok: false, reason: "configuration", missing: missingConfig, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { ok: false, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
