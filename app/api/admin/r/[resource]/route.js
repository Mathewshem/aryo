import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler, HttpError } from "@/lib/server/guard";
import { RESOURCES, pick } from "@/lib/server/resources";
import { audit } from "@/lib/server/audit";

export const dynamic = "force-dynamic";

function resource(name) {
  const r = RESOURCES[name];
  if (!r) throw new HttpError(404, "Unknown section.");
  return r;
}

export const GET = handler(async (req, { params }) => {
  await requireStaff();
  const r = resource(params.resource);
  let q = adminDb().from(r.table).select(r.select || "*");
  for (const [col, asc] of r.order) q = q.order(col, { ascending: asc });
  const { data, error } = await q.limit(2000);
  if (error) throw new HttpError(400, error.message);
  return NextResponse.json({ rows: data });
});

export const POST = handler(async (req, { params }) => {
  const staff = await requireStaff();
  const r = resource(params.resource);
  const body = await req.json();
  let row = pick(body, r.fields);
  for (const f of r.required) if (row[f] == null) throw new HttpError(400, `${f.replace(/_/g, " ")} is required.`);
  if (r.prepare) row = r.prepare(row, staff, true);
  const { data, error } = await adminDb().from(r.table).insert(row).select(r.select || "*").single();
  if (error) throw new HttpError(400, error.code === "23505" ? "That name/link already exists." : error.message);
  await audit(staff, "created", params.resource, r.label(data));
  return NextResponse.json({ row: data });
});
