import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler, HttpError } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

// One person's full profile plus every night they've been booked at ARYO.
export const GET = handler(async (req, { params }) => {
  await requireStaff();
  const db = adminDb();
  const [{ data: person }, { data: gigs }] = await Promise.all([
    db.from("aryo_talent").select("*").eq("id", params.id).maybeSingle(),
    db.from("aryo_gigs").select("*, club:aryo_clubs(id,name), creator:aryo_staff(id,name)").eq("talent_id", params.id).order("gig_date", { ascending: false }),
  ]);
  if (!person) throw new HttpError(404, "Profile not found.");
  return NextResponse.json({ person, gigs: gigs || [] });
});
