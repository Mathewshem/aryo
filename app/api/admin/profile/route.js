import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler, HttpError } from "@/lib/server/guard";
import { hash, check, validatePassword } from "@/lib/server/passwords";
import { pick } from "@/lib/server/resources";
import { audit } from "@/lib/server/audit";

export const dynamic = "force-dynamic";

export const GET = handler(async () => NextResponse.json({ me: await requireStaff() }));

export const PATCH = handler(async (req) => {
  const me = await requireStaff();
  const b = await req.json();
  const db = adminDb();
  if (b.newPassword) {
    const { data: row } = await db.from("aryo_staff").select("password_hash").eq("id", me.id).single();
    if (!(await check(b.currentPassword || "", row.password_hash))) throw new HttpError(400, "Current password is wrong.");
    const bad = validatePassword(b.newPassword);
    if (bad) throw new HttpError(400, bad);
    await db.from("aryo_staff").update({ password_hash: await hash(b.newPassword), must_change_password: false }).eq("id", me.id);
    await audit(me, "changed password", "profile", me.name);
    return NextResponse.json({ ok: true });
  }
  const row = pick(b, ["name", "phone", "title", "avatar_url"]);
  if (row.name === null) throw new HttpError(400, "Name can't be empty.");
  const { data, error } = await db.from("aryo_staff").update(row).eq("id", me.id).select("id,name,email,phone,role,title,avatar_url").single();
  if (error) throw new HttpError(400, error.message);
  return NextResponse.json({ me: data });
});
