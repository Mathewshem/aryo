import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler } from "@/lib/server/guard";
import { payState } from "@/lib/constants";

export const dynamic = "force-dynamic";

const iso = (d) => d.toISOString().slice(0, 10);
function weekStart(dateStr) {
  const x = new Date(dateStr + "T00:00:00Z");
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return iso(x);
}

export const GET = handler(async () => {
  await requireStaff();
  const db = adminDb();
  const [g, t, c, p] = await Promise.all([
    db.from("aryo_gigs").select("id,gig_date,start_time,end_time,night,status,fee,amount_paid,talent:aryo_talent(id,name,category,photo_url),club:aryo_clubs(id,name)").order("gig_date").limit(5000),
    db.from("aryo_talent").select("id,name,category,photo_url,active,phone,rate"),
    db.from("aryo_clubs").select("id,name,is_flagship,photo_url,tagline,location").order("sort_order"),
    db.from("aryo_partners").select("id,kind,active"),
  ]);
  const gigs = (g.data || []).filter((x) => x.status !== "cancelled");
  const talent = t.data || [];
  const now = new Date();
  const today = iso(now);
  const thisWeek = weekStart(today);
  const in7 = iso(new Date(now.getTime() + 7 * 864e5));
  const month = today.slice(0, 7);
  const lastMonth = iso(new Date(now.getFullYear(), now.getMonth() - 1, 15)).slice(0, 7);

  // 12 weeks: 9 back, this week, 2 ahead
  const weeks = [];
  for (let i = -9; i <= 2; i++) weeks.push(weekStart(iso(new Date(now.getTime() + i * 7 * 864e5))));
  const trend = weeks.map((w) => ({ week: w, gigs: 0, fees: 0 }));
  const wi = Object.fromEntries(weeks.map((w, i) => [w, i]));
  for (const x of gigs) { const i = wi[weekStart(x.gig_date)]; if (i != null) { trend[i].gigs++; trend[i].fees += Number(x.fee || 0); } }

  const done = gigs.filter((x) => x.gig_date <= today && x.status !== "no_show");
  const owed = done.reduce((a, x) => a + Math.max(0, Number(x.fee || 0) - Number(x.amount_paid || 0)), 0);
  const unpaidCount = done.filter((x) => ["unpaid", "partial"].includes(payState(x))).length;
  const monthGigs = gigs.filter((x) => x.gig_date.startsWith(month));
  const lastMonthGigs = gigs.filter((x) => x.gig_date.startsWith(lastMonth));
  const byTalent = {};
  for (const x of gigs) if (x.talent && x.gig_date <= today) { byTalent[x.talent.id] ||= { ...x.talent, count: 0 }; byTalent[x.talent.id].count++; }
  const byCat = {};
  for (const x of monthGigs) { const k = x.talent?.category || "other"; byCat[k] = (byCat[k] || 0) + 1; }

  return NextResponse.json({
    kpi: {
      upcoming7: gigs.filter((x) => x.gig_date >= today && x.gig_date <= in7).length,
      thisWeek: gigs.filter((x) => weekStart(x.gig_date) === thisWeek).length,
      monthGigs: monthGigs.length, lastMonthGigs: lastMonthGigs.length,
      monthFees: monthGigs.reduce((a, x) => a + Number(x.fee || 0), 0),
      monthPaid: monthGigs.reduce((a, x) => a + Math.min(Number(x.amount_paid || 0), Number(x.fee || 0)), 0),
      owed, unpaidCount,
      talent: talent.filter((x) => x.active).length,
      missingPhoto: talent.filter((x) => !x.photo_url).length,
      missingPhone: talent.filter((x) => !x.phone).length,
      sponsors: (p.data || []).filter((x) => x.kind === "sponsor" && x.active).length,
      media: (p.data || []).filter((x) => x.kind === "media" && x.active).length,
      clubs: (c.data || []).length,
    },
    talentByCat: talent.reduce((a, x) => ((a[x.category] = (a[x.category] || 0) + 1), a), {}),
    trend, byCat,
    topTalent: Object.values(byTalent).sort((a, b) => b.count - a.count).slice(0, 5),
    tonight: gigs.filter((x) => x.gig_date === today),
    upcoming: gigs.filter((x) => x.gig_date >= today).slice(0, 8),
    unpaid: done.filter((x) => ["unpaid", "partial"].includes(payState(x))).slice(-6).reverse(),
    flagship: (c.data || []).find((x) => x.is_flagship) || null,
  });
});
