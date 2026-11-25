import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

function weekStart(d) {
  const x = new Date(d); x.setUTCHours(0, 0, 0, 0);
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x.toISOString().slice(0, 10);
}

export const GET = handler(async () => {
  await requireStaff();
  const db = adminDb();
  const today = new Date().toISOString().slice(0, 10);
  const [bk, tl, ev, cl] = await Promise.all([
    db.from("aryo_bookings").select("id,ref,client_name,status,event_date,event_type,created_at,talent:aryo_talent(id,name,category,photo_url)").order("created_at", { ascending: false }).limit(2000),
    db.from("aryo_talent").select("id,name,category,photo_url,active,featured"),
    db.from("aryo_events").select("id,title,event_date,start_time,music_policy,poster_url,club:aryo_clubs(name)").gte("event_date", today).order("event_date").limit(6),
    db.from("aryo_clubs").select("id,name,is_flagship,photo_url,tagline,location").order("sort_order"),
  ]);
  const bookings = bk.data || [];
  const talent = tl.data || [];

  // 12 weekly buckets ending this week
  const weeks = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) weeks.push(weekStart(new Date(now.getTime() - i * 7 * 864e5)));
  const trend = weeks.map((w) => ({ week: w, total: 0, approved: 0 }));
  const idx = Object.fromEntries(weeks.map((w, i) => [w, i]));
  for (const b of bookings) {
    const i = idx[weekStart(b.created_at)];
    if (i != null) { trend[i].total++; if (["approved", "completed"].includes(b.status)) trend[i].approved++; }
  }

  const count = (s) => bookings.filter((b) => b.status === s).length;
  const byCat = {};
  const byTalent = {};
  for (const b of bookings) {
    const c = b.talent?.category || "other";
    byCat[c] = (byCat[c] || 0) + 1;
    if (b.talent) { byTalent[b.talent.id] ||= { ...b.talent, count: 0 }; byTalent[b.talent.id].count++; }
  }
  const thisMonth = today.slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString().slice(0, 7);
  const inMonth = (m) => bookings.filter((b) => b.created_at.slice(0, 7) === m).length;

  return NextResponse.json({
    kpi: {
      total: bookings.length, pending: count("pending"), approved: count("approved") + count("completed"),
      declined: count("declined"), thisMonth: inMonth(thisMonth), lastMonth: inMonth(lastMonthDate),
      talent: talent.filter((t) => t.active).length, withPhoto: talent.filter((t) => t.photo_url).length,
    },
    talentByCat: talent.reduce((a, t) => ((a[t.category] = (a[t.category] || 0) + 1), a), {}),
    trend, byCat,
    topTalent: Object.values(byTalent).sort((a, b) => b.count - a.count).slice(0, 5),
    recent: bookings.slice(0, 6),
    upcoming: ev.data || [],
    flagship: (cl.data || []).find((c) => c.is_flagship) || null,
    clubs: (cl.data || []).length,
  });
});
