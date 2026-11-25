"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { CalendarCheck2, CalendarDays, Wallet, Users, TrendingUp, TrendingDown, ArrowRight, Crown, MapPin, Trophy, Plus, Camera } from "lucide-react";
import { api } from "@/lib/ui/api";
import Avatar from "@/lib/ui/Avatar";
import { useMe } from "@/components/admin/MeContext";
import { CAT_ICON } from "@/components/admin/people";
import { fmtDay, PayPill } from "@/components/admin/gigs";
import { CATEGORIES, catLabel, kes } from "@/lib/constants";

const CAT_COLORS = { dj: "#C29A4A", host: "#7C5CFF", designer: "#3B82F6", artist: "#E0663A", mc: "#2F9E6E", other: "#9A958B" };

function Spark({ data, k, color }) {
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs><linearGradient id={`sp-${k}-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.35} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <Area type="monotone" dataKey={k} stroke={color} strokeWidth={1.8} fill={`url(#sp-${k}-${color.slice(1)})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Kpi({ icon: I, color, label, value, delta, sub, data, k, href }) {
  const up = delta == null || delta >= 0;
  return (
    <Link href={href} className="card p-4 hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center h-10 w-10 rounded-full" style={{ background: `${color}1f`, color }}><I size={17} /></span>
        <div className="min-w-0">
          <div className="text-[11.5px] font-medium t-2">{label}</div>
          <div className="text-[24px] font-semibold leading-tight mt-0.5">{value}</div>
          <div className="text-[10.5px] mt-0.5 flex items-center gap-1">
            {delta != null && <span className="inline-flex items-center gap-0.5 font-semibold" style={{ color: up ? "var(--ok)" : "var(--bad)" }}>{up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{Math.abs(delta)}%</span>}
            <span className="t-muted">{sub}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 -mx-1"><Spark data={data} k={k} color={color} /></div>
    </Link>
  );
}

function Ring({ pct, label }) {
  const r = 62, c = 2 * Math.PI * r;
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" className="shrink-0">
      <circle cx="75" cy="75" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="11" />
      <circle cx="75" cy="75" r={r} fill="none" stroke="url(#ringg)" strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 75 75)" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <defs><linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8D39C" /><stop offset="100%" stopColor="#A47F37" /></linearGradient></defs>
      <text x="75" y="80" textAnchor="middle" fontSize="34" fontWeight="700" fill="var(--text)">{pct}<tspan fontSize="16">%</tspan></text>
      <text x="75" y="100" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--muted)">{label}</text>
    </svg>
  );
}

export default function Overview() {
  const { me } = useMe();
  const [s, setS] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api("/api/admin/stats").then(setS).catch((e) => setErr(e.message)); }, []);
  if (err) return <div className="card p-6" style={{ color: "var(--bad)" }}>{err}</div>;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const k = s?.kpi;
  const paidPct = k && k.monthFees ? Math.round((k.monthPaid / k.monthFees) * 100) : 0;
  const monthDelta = k && k.lastMonthGigs ? Math.round(((k.monthGigs - k.lastMonthGigs) / k.lastMonthGigs) * 100) : null;
  const trend = (s?.trend || []).map((t) => ({ ...t, label: new Date(t.week + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }));
  const catData = s ? Object.entries(s.byCat).map(([c, v]) => ({ name: catLabel(c), key: c, value: v })) : [];
  const catTotal = catData.reduce((a, b) => a + b.value, 0);
  const roster = Object.values(s?.talentByCat || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-[21px] font-semibold">{greet}, {me.name.split(" ")[0]}! <span className="inline-block animate-[wave_2s_ease-in-out_1]">👋</span></h1>
          <p className="t-muted mt-0.5">Here's who's playing and what's owed at ARYO.</p></div>
        <Link href="/admin/bookings" className="btn btn-primary"><Plus size={14} /> Book a DJ</Link>
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-5">
        <div className="card relative overflow-hidden p-6 min-h-[240px]">
          <div className="absolute right-4 top-0 font-display font-extrabold text-[150px] leading-none select-none pointer-events-none" style={{ color: "var(--text)", opacity: 0.035 }}>ARYO</div>
          <div className="absolute -left-20 -bottom-24 h-72 w-72 rounded-full blur-3xl opacity-25" style={{ background: "var(--gold)" }} />
          <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s?.flagship?.photo_url || "/aryo-logo.jpg"} alt="ARYO" className="h-36 w-36 rounded-full object-cover" style={{ boxShadow: "0 0 0 3px var(--surface), 0 0 0 5px var(--gold), 0 20px 40px -12px rgba(194,154,74,.5)" }} />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 pill whitespace-nowrap" style={{ background: "var(--gold)", color: "#0b0a08" }}><Crown size={10} /> The Mother</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] font-bold tracking-[.2em] t-gold uppercase">Tonight</div>
              {s?.tonight?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">{s.tonight.map((g) => (
                  <Link key={g.id} href={`/admin/people/${g.talent?.id}`} className="inline-flex items-center gap-2 pr-3 rounded-full border b-line bg-surface hover:border-[var(--gold)]"><Avatar src={g.talent?.photo_url} name={g.talent?.name} size={30} /><span className="font-semibold">{g.talent?.name}</span><span className="t-muted text-[11px]">{g.start_time}</span></Link>))}</div>
              ) : <div className="text-[28px] font-display font-bold leading-[1.1] mt-1">ARYO Nairobi</div>}
              <div className="flex items-center gap-1.5 t-muted mt-2"><MapPin size={13} /> {s?.flagship?.location || "Astrol Square, Red Hill Rd"}{!s?.tonight?.length && s && <span className="ml-2">· nobody booked tonight</span>}</div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-3 mt-5 border-t b-line pt-4">
                {[[roster, "People"], [k?.clubs, "Clubs"], [k?.sponsors, "Sponsors"], [k?.media, "Online pages"], [k?.upcoming7, "Next 7 days"]].map(([v, l], i) => (
                  <div key={l} className={i ? "sm:border-l b-line sm:pl-4" : ""}><div className="text-[18px] font-semibold">{v ?? "–"}</div><div className="text-[11px] t-muted">{l}</div></div>))}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between"><div className="font-semibold text-[13.5px]">Payments</div><span className="pill pill-mute">This month</span></div>
          <div className="flex items-center gap-4 mt-3">
            {s ? <Ring pct={paidPct} label="FEES SETTLED" /> : <div className="skeleton h-[150px] w-[150px] rounded-full" />}
            <div className="flex-1 space-y-2.5">
              {[["Nights", k?.monthGigs, "var(--text)"], ["Fees", k && kes(k.monthFees), "var(--gold)"], ["Paid", k && kes(k.monthPaid), "var(--ok)"], ["Owed", k && kes(k.owed), "var(--bad)"]].map(([l, v, c]) => (
                <div key={l} className="flex items-center justify-between border-b b-line pb-2 last:border-0"><span className="flex items-center gap-2 t-2 whitespace-nowrap"><span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />{l}</span><span className="font-semibold whitespace-nowrap">{v ?? "–"}</span></div>))}
            </div>
          </div>
          <Link href="/admin/bookings" className="btn btn-ghost w-full justify-between mt-3 h-9">Open DJ bookings <ArrowRight size={14} /></Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Kpi icon={CalendarCheck2} color="#C29A4A" label="Booked this week" value={k?.thisWeek ?? "–"} sub="nights" data={trend} k="gigs" href="/admin/bookings" />
        <Kpi icon={CalendarDays} color="#2F9E6E" label="Nights this month" value={k?.monthGigs ?? "–"} delta={monthDelta} sub="vs last month" data={trend} k="gigs" href="/admin/bookings" />
        <Kpi icon={Wallet} color="#E0663A" label="Owed to talent" value={k ? kes(k.owed) : "–"} sub={k ? `${k.unpaidCount} unpaid night${k.unpaidCount === 1 ? "" : "s"}` : ""} data={trend} k="fees" href="/admin/bookings" />
        <Kpi icon={Users} color="#7C5CFF" label="People on roster" value={k?.talent ?? "–"} sub={k ? `${k.missingPhoto} without photos` : ""} data={trend.map((t, i) => ({ v: 10 + i }))} k="v" href="/admin/djs" />
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3"><div className="font-semibold text-[13.5px]">Nights booked per week</div><span className="pill pill-mute">Incl. next 2 weeks</span></div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs><linearGradient id="tr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C29A4A" stopOpacity={0.3} /><stop offset="100%" stopColor="#C29A4A" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10.5, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12 }} labelStyle={{ color: "var(--muted)" }} formatter={(v, n) => (n === "Fees" ? kes(v) : v)} />
                <Area name="Nights" type="monotone" dataKey="gigs" stroke="#C29A4A" strokeWidth={2.2} fill="url(#tr)" dot={{ r: 3.5, fill: "var(--surface)", stroke: "#C29A4A", strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold text-[13.5px] mb-3">Roster</div>
          <div className="space-y-1">
            {CATEGORIES.map((c) => { const I = CAT_ICON[c.id]; return (
              <Link key={c.id} href={c.href} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-[var(--surface-2)]">
                <span className="grid place-items-center h-8 w-8 rounded-md" style={{ background: `${CAT_COLORS[c.id]}1f`, color: CAT_COLORS[c.id] }}><I size={15} /></span>
                <span className="flex-1 t-2 font-medium">{c.label}</span><span className="font-semibold">{s?.talentByCat?.[c.id] ?? "–"}</span>
              </Link>); })}
          </div>
          {k?.missingPhoto > 0 && <div className="mt-3 flex items-center gap-2 rounded-md p-2.5 text-[11.5px] bg-gold-soft t-2"><Camera size={13} className="t-gold" /> {k.missingPhoto} profiles still need a photo</div>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3"><div className="font-semibold text-[13.5px]">Coming up</div><Link href="/admin/bookings" className="t-gold font-semibold text-[11.5px]">Schedule</Link></div>
          <div className="space-y-3">
            {s && !s.upcoming.length && <div className="t-muted py-6 text-center">Nothing booked yet. <Link href="/admin/bookings" className="t-gold">Book someone</Link></div>}
            {s?.upcoming.slice(0, 5).map((g) => (
              <Link key={g.id} href={`/admin/bookings?open=${g.id}`} className="flex items-center gap-3">
                <Avatar src={g.talent?.photo_url} name={g.talent?.name} size={32} />
                <div className="min-w-0 flex-1"><div className="font-medium truncate">{g.talent?.name}</div><div className="text-[11px] t-muted truncate">{fmtDay(g.gig_date)}{g.night ? ` · ${g.night}` : ""}</div></div>
              </Link>))}
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold text-[13.5px] mb-2">This month by tab</div>
          <div className="relative h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={catData.length ? catData : [{ name: "None", value: 1, key: "none" }]} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={catData.length > 1 ? 3 : 0} stroke="none">
                {(catData.length ? catData : [{ key: "none" }]).map((d) => <Cell key={d.key} fill={catData.length ? CAT_COLORS[d.key] : "var(--surface-3)"} />)}</Pie></PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none"><div className="text-center"><div className="text-[10px] t-muted">Nights</div><div className="text-[20px] font-semibold">{catTotal}</div></div></div>
          </div>
          <div className="space-y-1.5 mt-2">{catData.map((d) => <div key={d.key} className="flex items-center justify-between"><span className="flex items-center gap-2 t-2"><span className="h-2 w-2 rounded-full" style={{ background: CAT_COLORS[d.key] }} />{d.name}</span><span className="font-semibold">{d.value}</span></div>)}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3"><div className="font-semibold text-[13.5px]">Not yet paid</div><Wallet size={14} style={{ color: "var(--bad)" }} /></div>
          <div className="space-y-3">
            {s && !s.unpaid.length && <div className="t-muted py-6 text-center">Everyone's been paid.</div>}
            {s?.unpaid.map((g) => (
              <Link key={g.id} href={`/admin/bookings?open=${g.id}`} className="flex items-center gap-3">
                <Avatar src={g.talent?.photo_url} name={g.talent?.name} size={32} />
                <div className="min-w-0 flex-1"><div className="font-medium truncate">{g.talent?.name}</div><div className="text-[11px] t-muted">{fmtDay(g.gig_date)}</div></div>
                <PayPill g={g} />
              </Link>))}
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold text-[13.5px] mb-3">Most booked</div>
          <div className="space-y-3">
            {s && !s.topTalent.length && <div className="t-muted py-6 text-center">Shows up once nights are booked.</div>}
            {s?.topTalent.map((t, i) => (
              <Link key={t.id} href={`/admin/people/${t.id}`} className="flex items-center gap-3">
                <span className="grid place-items-center h-8 w-8 rounded-md bg-gold-soft t-gold">{i === 0 ? <Trophy size={15} /> : <span className="text-[12px] font-bold">{i + 1}</span>}</span>
                <div className="flex-1 min-w-0"><div className="font-medium truncate">{t.name}</div><div className="text-[11px] t-muted">{catLabel(t.category)}</div></div>
                <span className="font-semibold">{t.count}</span>
              </Link>))}
          </div>
        </div>
      </div>
    </div>
  );
}
