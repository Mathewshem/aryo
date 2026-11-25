import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { handler } from "@/lib/server/guard";
import { sendEmail, emailShell } from "@/lib/server/email";

export const dynamic = "force-dynamic";

// Always answers the same way so the form can't be used to discover accounts.
export const POST = handler(async (req) => {
  const email = String((await req.json()).email || "").trim().toLowerCase();
  const db = adminDb();
  const { data: staff } = await db.from("aryo_staff").select("id,name,active").eq("email", email).maybeSingle();
  if (staff?.active) {
    const since = new Date(Date.now() - 10 * 60e3).toISOString();
    const { count } = await db.from("aryo_otp").select("id", { count: "exact", head: true }).eq("email", email).gt("created_at", since);
    if ((count || 0) < 3) {
      const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
      await db.from("aryo_otp").insert({ email, code, expires_at: new Date(Date.now() + 10 * 60e3).toISOString() });
      await sendEmail({ to: email, subject: `ARYO reset code: ${code}`,
        html: emailShell({ eyebrow: "Password reset", title: code, intro: `Hi ${staff.name}, use this code to set a new password. It expires in 10 minutes.`, note: "If you didn't ask for this, you can ignore this email." }) });
    }
  }
  return NextResponse.json({ ok: true });
});
