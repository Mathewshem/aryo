import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler, HttpError } from "@/lib/server/guard";
import { hash, tempPassword } from "@/lib/server/passwords";
import { audit } from "@/lib/server/audit";
import { sendEmail, emailShell, SITE } from "@/lib/server/email";

export const dynamic = "force-dynamic";
const COLS = "id,name,email,phone,role,title,avatar_url,active,last_login,must_change_password,created_at";

export const GET = handler(async () => {
  await requireStaff();
  const { data } = await adminDb().from("aryo_staff").select(COLS).order("created_at");
  return NextResponse.json({ rows: data || [] });
});

export const POST = handler(async (req) => {
  const me = await requireStaff({ admin: true });
  const b = await req.json();
  const email = String(b.email || "").trim().toLowerCase();
  if (!b.name?.trim() || !/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Name and a valid email are required.");
  const temp = tempPassword();
  const { data, error } = await adminDb().from("aryo_staff").insert({
    name: b.name.trim(), email, phone: b.phone || null, title: b.title || null, avatar_url: b.avatar_url || null,
    role: b.role === "admin" ? "admin" : "staff", password_hash: await hash(temp), must_change_password: true,
  }).select(COLS).single();
  if (error) throw new HttpError(400, error.code === "23505" ? "That email already has an account." : error.message);
  const mail = await sendEmail({
    to: email, subject: "Your ARYO dashboard account",
    html: emailShell({ eyebrow: "Welcome aboard", title: `Hi ${data.name}`, intro: "An account has been created for you on the ARYO Nairobi dashboard.",
      rows: [["Email", email], ["Temporary password", temp], ["Role", data.role]], cta: { href: `${SITE}/admin/login`, label: "Sign in" },
      note: "You will be asked to choose your own password the first time you sign in." }),
  });
  await audit(me, "created", "staff", `${data.name} (${data.role})`);
  // If email could not be sent, the admin sees the temporary password once to share it by hand.
  return NextResponse.json({ row: data, tempPassword: mail.ok ? null : temp });
});
