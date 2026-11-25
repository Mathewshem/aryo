import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler, HttpError } from "@/lib/server/guard";
import { hash, tempPassword } from "@/lib/server/passwords";
import { pick } from "@/lib/server/resources";
import { audit } from "@/lib/server/audit";
import { sendEmail, emailShell, SITE } from "@/lib/server/email";

export const dynamic = "force-dynamic";
const COLS = "id,name,email,phone,role,title,avatar_url,active,last_login,must_change_password,created_at";

export const PATCH = handler(async (req, { params }) => {
  const me = await requireStaff({ admin: true });
  const b = await req.json();
  const db = adminDb();
  if (b.resetPassword) {
    const temp = tempPassword();
    const { data, error } = await db.from("aryo_staff").update({ password_hash: await hash(temp), must_change_password: true }).eq("id", params.id).select(COLS).single();
    if (error) throw new HttpError(400, error.message);
    const mail = await sendEmail({ to: data.email, subject: "Your ARYO password was reset",
      html: emailShell({ title: "Password reset", intro: "An admin reset your ARYO dashboard password.", rows: [["Temporary password", temp]], cta: { href: `${SITE}/admin/login`, label: "Sign in" } }) });
    await audit(me, "reset password", "staff", data.name);
    return NextResponse.json({ row: data, tempPassword: mail.ok ? null : temp });
  }
  const row = pick(b, ["name", "phone", "title", "role", "active", "avatar_url"]);
  if (params.id === me.id && (row.role === "staff" || row.active === false)) throw new HttpError(400, "You can't demote or deactivate your own account.");
  const { data, error } = await db.from("aryo_staff").update(row).eq("id", params.id).select(COLS).single();
  if (error) throw new HttpError(400, error.message);
  await audit(me, "updated", "staff", data.name);
  return NextResponse.json({ row: data });
});

export const DELETE = handler(async (req, { params }) => {
  const me = await requireStaff({ admin: true });
  if (params.id === me.id) throw new HttpError(400, "You can't delete your own account.");
  const { data, error } = await adminDb().from("aryo_staff").delete().eq("id", params.id).select("name").single();
  if (error) throw new HttpError(400, error.message);
  await audit(me, "deleted", "staff", data.name);
  return NextResponse.json({ ok: true });
});
