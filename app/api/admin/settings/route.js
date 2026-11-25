import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler, HttpError } from "@/lib/server/guard";
import { pick } from "@/lib/server/resources";
import { audit } from "@/lib/server/audit";

export const dynamic = "force-dynamic";
const FIELDS = ["site_name", "tagline", "email", "phone", "whatsapp", "instagram", "address", "alert_emails"];

export const GET = handler(async () => {
  await requireStaff();
  const { data } = await adminDb().from("aryo_settings").select("*").eq("id", 1).single();
  return NextResponse.json({ settings: data });
});
export const PATCH = handler(async (req) => {
  const staff = await requireStaff({ admin: true });
  const row = { ...pick(await req.json(), FIELDS), updated_at: new Date().toISOString() };
  const { data, error } = await adminDb().from("aryo_settings").update(row).eq("id", 1).select().single();
  if (error) throw new HttpError(400, error.message);
  await audit(staff, "updated", "settings", "Site settings");
  return NextResponse.json({ settings: data });
});
