import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler, HttpError } from "@/lib/server/guard";
import { RESOURCES, pick } from "@/lib/server/resources";
import { audit } from "@/lib/server/audit";

export const dynamic = "force-dynamic";

export const PATCH = handler(async (req, { params }) => {
  const staff = await requireStaff();
  const r = RESOURCES[params.resource];
  if (!r) throw new HttpError(404, "Unknown section.");
  const body = await req.json();
  let row = pick(body, r.fields);
  if (r.prepare) row = r.prepare(row, staff, false);
  const db = adminDb();
  const { data, error } = await db.from(r.table).update(row).eq("id", params.id).select(r.select || "*").single();
  if (error) throw new HttpError(400, error.code === "23505" ? "That name/link already exists." : error.message);
  await audit(staff, row.status ? `marked ${row.status}` : "updated", params.resource, r.label(data));
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
