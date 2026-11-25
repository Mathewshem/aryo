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
  const [t, b, e] = await Promise.all([
    db.from("aryo_talent").select("id,name,category,photo_url").ilike("name", like).limit(6),
    db.from("aryo_bookings").select("id,ref,client_name,status").or(`ref.ilike.${like},client_name.ilike.${like},phone.ilike.${like}`).limit(6),
    db.from("aryo_events").select("id,title,event_date").ilike("title", like).limit(4),
  ]);
  return NextResponse.json({
    results: [
      ...(t.data || []).map((x) => ({ type: "Talent", id: x.id, title: x.name, sub: x.category, href: `/admin/talent?open=${x.id}`, photo: x.photo_url })),
      ...(b.data || []).map((x) => ({ type: "Booking", id: x.id, title: `${x.ref} · ${x.client_name}`, sub: x.status, href: `/admin/bookings?open=${x.id}` })),
      ...(e.data || []).map((x) => ({ type: "Event", id: x.id, title: x.title, sub: x.event_date, href: `/admin/events?open=${x.id}` })),
    ],
  });
});
