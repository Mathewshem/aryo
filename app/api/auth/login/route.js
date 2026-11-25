import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { handler, HttpError } from "@/lib/server/guard";
import { check } from "@/lib/server/passwords";
import { createSession } from "@/lib/server/session";
import { audit } from "@/lib/server/audit";

export const dynamic = "force-dynamic";

export const POST = handler(async (req) => {
  const { email, password } = await req.json();
  const { data: staff } = await adminDb().from("aryo_staff").select("*").eq("email", String(email || "").trim().toLowerCase()).maybeSingle();
  if (!staff || !(await check(password || "", staff.password_hash))) {
    await new Promise((r) => setTimeout(r, 600));
    throw new HttpError(401, "Email or password is incorrect.");
  }
  if (!staff.active) throw new HttpError(403, "This account has been deactivated.");
  await createSession(staff);
  await adminDb().from("aryo_staff").update({ last_login: new Date().toISOString() }).eq("id", staff.id);
  await audit(staff, "signed in", "auth", staff.email);
  return NextResponse.json({ ok: true, mustChange: staff.must_change_password });
});
