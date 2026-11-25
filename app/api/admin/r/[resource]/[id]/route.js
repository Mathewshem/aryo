import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler, HttpError } from "@/lib/server/guard";
import { RESOURCES, pick } from "@/lib/server/resources";
import { audit } from "@/lib/server/audit";
import { sendEmail, emailShell } from "@/lib/server/email";

export const dynamic = "force-dynamic";

export const PATCH = handler(async (req, { params }) => {
  const staff = await requireStaff();
  const r = RESOURCES[params.resource];
  if (!r) throw new HttpError(404, "Unknown section.");
  const body = await req.json();
  let row = pick(body, r.fields);
  if (r.prepare) row = r.prepare(row, staff, false);
  const db = adminDb();
  // Only one sponsor drives the 3D bottle on the homepage.
  if (params.resource === "partners" && row.hero_brand === true) await db.from(r.table).update({ hero_brand: false }).neq("id", params.id);
  const { data, error } = await db.from(r.table).update(row).eq("id", params.id).select().single();
  if (error) throw new HttpError(400, error.code === "23505" ? "That name/link already exists." : error.message);
  await audit(staff, row.status ? `marked ${row.status}` : "updated", params.resource, r.label(data));
  // Let the client know when their request is confirmed or declined.
  if (params.resource === "bookings" && data.email && ["approved", "declined"].includes(body.status) && body.notify !== false) {
    const ok = body.status === "approved";
    await sendEmail({ to: data.email, subject: `Booking ${data.ref} ${ok ? "confirmed" : "update"}`,
      html: emailShell({ eyebrow: ok ? "Booking confirmed" : "Booking update", title: ok ? "You're booked!" : "We couldn't confirm this date",
        intro: data.admin_note || (ok ? "The ARYO team will reach out with the final details." : "Please reach out to pick another date or talent."),
        rows: [["Reference", data.ref], ["Event date", data.event_date], ["Venue", data.venue || "-"]] }) });
  }
  return NextResponse.json({ row: data });
});

export const DELETE = handler(async (req, { params }) => {
  const staff = await requireStaff({ admin: true });
  const r = RESOURCES[params.resource];
  if (!r) throw new HttpError(404, "Unknown section.");
  const { data, error } = await adminDb().from(r.table).delete().eq("id", params.id).select().single();
  if (error) throw new HttpError(400, error.message);
  await audit(staff, "deleted", params.resource, r.label(data));
  return NextResponse.json({ ok: true });
});
