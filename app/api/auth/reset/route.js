import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { handler, HttpError } from "@/lib/server/guard";
import { hash, validatePassword } from "@/lib/server/passwords";
import { audit } from "@/lib/server/audit";

export const dynamic = "force-dynamic";

export const POST = handler(async (req) => {
  const b = await req.json();
  const email = String(b.email || "").trim().toLowerCase();
  const db = adminDb();
  const { data: otp } = await db.from("aryo_otp").select("id").eq("email", email).eq("code", String(b.code || "").trim())
    .eq("used", false).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!otp) throw new HttpError(400, "That code is wrong or has expired.");
  const bad = validatePassword(b.password);
  if (bad) throw new HttpError(400, bad);
  await db.from("aryo_otp").update({ used: true }).eq("email", email);
  const { data: staff } = await db.from("aryo_staff").update({ password_hash: await hash(b.password), must_change_password: false }).eq("email", email).select("id,name").single();
  await audit(staff, "reset password", "auth", email);
  return NextResponse.json({ ok: true });
});
