import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

export const GET = handler(async (req) => {
  await requireStaff();
  const q = (new URL(req.url).searchParams.get("q") || "").trim().replace(/[%,()]/g, "");
  if (q.length < 2) return NextResponse.json({ results: [] });
  const db = adminDb();
  const like = `%${q}%`;
  const [t, c, p] = await Promise.all([
    db.from("aryo_talent").select("id,name,category,photo_url").or(`name.ilike.${like},real_name.ilike.${like},phone.ilike.${like}`).limit(8),
    db.from("aryo_clubs").select("id,name").ilike("name", like).limit(4),
    db.from("aryo_partners").select("id,name,kind").ilike("name", like).limit(4),
  ]);
  return NextResponse.json({
    results: [
      ...(t.data || []).map((x) => ({ type: "Person", id: x.id, title: x.name, sub: x.category, href: `/admin/people/${x.id}`, photo: x.photo_url, avatar: true })),
      ...(c.data || []).map((x) => ({ type: "Club", id: x.id, title: x.name, sub: "club", href: `/admin/clubs?open=${x.id}` })),
      ...(p.data || []).map((x) => ({ type: x.kind === "media" ? "Online presence" : "Sponsor", id: x.id, title: x.name, sub: x.kind, href: `/admin/${x.kind === "media" ? "online" : "sponsors"}?open=${x.id}` })),
    ],
  });
});
