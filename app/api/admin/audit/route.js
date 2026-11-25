import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler } from "@/lib/server/guard";

export const dynamic = "force-dynamic";
export const GET = handler(async () => {
  await requireStaff({ admin: true });
  const { data } = await adminDb().from("aryo_audit_log").select("*").order("created_at", { ascending: false }).limit(500);
  return NextResponse.json({ rows: data || [] });
});
