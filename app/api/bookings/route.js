import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { handler, HttpError } from "@/lib/server/guard";
import { makeRef, pick } from "@/lib/server/resources";
import { audit } from "@/lib/server/audit";
import { sendEmail, emailShell, SITE } from "@/lib/server/email";

export const dynamic = "force-dynamic";

// Public booking request from the website.
export const POST = handler(async (req) => {
  const body = await req.json();
  if (body.website) return NextResponse.json({ ok: true }); // honeypot
  const row = pick(body, ["talent_id", "client_name", "phone", "email", "event_date", "event_type", "venue", "guests", "budget", "message"]);
  if (!row.client_name || !row.phone || !row.event_date) throw new HttpError(400, "Name, phone and event date are required.");
  if (!/^[+0-9 ()-]{9,16}$/.test(row.phone)) throw new HttpError(400, "Enter a valid phone number.");
  if (row.event_date < new Date().toISOString().slice(0, 10)) throw new HttpError(400, "Event date can't be in the past.");
  if (row.guests != null) row.guests = Math.max(0, parseInt(row.guests, 10) || 0);
  for (const k of ["client_name", "venue", "event_type", "budget"]) if (row[k]) row[k] = String(row[k]).slice(0, 120);
  if (row.message) row.message = String(row.message).slice(0, 1500);
  const db = adminDb();
  let talent = null;
  if (row.talent_id) {
    const { data } = await db.from("aryo_talent").select("id,name").eq("id", row.talent_id).eq("active", true).maybeSingle();
    talent = data; if (!talent) row.talent_id = null;
  }
  row.ref = makeRef();
  const { data, error } = await db.from("aryo_bookings").insert(row).select().single();
  if (error) throw new HttpError(400, "Could not save your request. Please try again.");
  await audit(null, "new request", "bookings", `${data.ref} · ${data.client_name}`);

  const { data: s } = await db.from("aryo_settings").select("booking_alert_emails").eq("id", 1).single();
  const rows = [["Reference", data.ref], ["Talent", talent?.name || "Not specified"], ["Client", data.client_name], ["Phone", data.phone],
    ["Event date", data.event_date], ["Event", data.event_type || "-"], ["Venue", data.venue || "-"], ["Guests", data.guests ?? "-"]];
  await sendEmail({ to: s?.booking_alert_emails, subject: `New booking request ${data.ref}${talent ? ` · ${talent.name}` : ""}`,
    html: emailShell({ eyebrow: "New booking request", title: talent ? talent.name : "Booking request", intro: data.message || "", rows, cta: { href: `${SITE}/admin/bookings?open=${data.id}`, label: "Open in dashboard" } }) });
  if (data.email) await sendEmail({ to: data.email, subject: `We received your booking request (${data.ref})`,
    html: emailShell({ eyebrow: "Request received", title: `Thank you, ${data.client_name}`, intro: "The ARYO team will confirm availability and get back to you shortly.", rows: rows.slice(0, 1).concat(rows.slice(4, 6)) }) });
  return NextResponse.json({ ok: true, ref: data.ref });
});
