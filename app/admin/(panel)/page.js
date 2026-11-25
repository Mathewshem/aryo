"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { CalendarCheck2, Clock3, Disc3, TrendingUp, TrendingDown, ArrowRight, Crown, MapPin, Trophy, PartyPopper, Mic2, Shirt, Music4, Users } from "lucide-react";
import { api } from "@/lib/ui/api";
import Avatar from "@/lib/ui/Avatar";
import { useMe } from "@/components/admin/MeContext";
import { fmtDate, ago, STATUS_PILL } from "@/components/admin/fmt";
import { CATEGORIES, catLabel } from "@/lib/constants";

const CAT_COLORS = { dj: "#C29A4A", host: "#7C5CFF", mc: "#2F9E6E", artist: "#E0663A", designer: "#3B82F6", other: "#9A958B" };
const CAT_ICON = { dj: Disc3, host: Mic2, mc: Mic2, artist: Music4, designer: Shirt };

function Spark({ data, k, color }) {
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs><linearGradient id={`sp-${k}-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.35} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <Area type="monotone" dataKey={k} stroke={color} strokeWidth={1.8} fill={`url(#sp-${k}-${color.slice(1)})`} dot={false} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Kpi({ icon: I, color, label, value, delta, sub, data, k }) {
  const up = delta == null || delta >= 0;
  return (
    <div className="card p-4">
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
    </div>
  );
}

function Ring({ pct }) {
  const r = 62, c = 2 * Math.PI * r;
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" className="shrink-0">
      <circle cx="75" cy="75" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="11" />
      <circle cx="75" cy="75" r={r} fill="none" stroke="url(#ringg)" strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 75 75)" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <defs><linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8D39C" /><stop offset="100%" stopColor="#A47F37" /></linearGradient></defs>
      <text x="75" y="78" textAnchor="middle" fontSize="34" fontWeight="700" fill="var(--text)">{pct}</text>
      <text x="75" y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--muted)">% APPROVED</text>
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
  const handled = k ? k.approved + k.declined : 0;
  const pct = handled ? Math.round((k.approved / handled) * 100) : 0;
  const monthDelta = k && k.lastMonth ? Math.round(((k.thisMonth - k.lastMonth) / k.lastMonth) * 100) : null;
  const trend = (s?.trend || []).map((t) => ({ ...t, label: new Date(t.week).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }));
  const catData = s ? Object.entries(s.byCat).map(([c, v]) => ({ name: catLabel(c), key: c, value: v })) : [];
  const catTotal = catData.reduce((a, b) => a + b.value, 0);
  const next = s?.upcoming?.[0];

  return (
    <div className="space-y-5">
      <div><h1 className="text-[21px] font-semibold">{greet}, {me.name.split(" ")[0]}! <span className="inline-block animate-[wave_2s_ease-in-out_1]">👋</span></h1>
        <p className="t-muted mt-0.5">Here's what's happening at ARYO today.</p></div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-5">
        {/* Flagship hero card */}
        <div className="card relative overflow-hidden p-6 min-h-[240px]">
          <div className="absolute right-4 top-0 font-display font-extrabold text-[150px] leading-none select-none pointer-events-none" style={{ color: "var(--text)", opacity: 0.035 }}>ARYO</div>
          <div className="absolute -left-20 -bottom-24 h-72 w-72 rounded-full blur-3xl opacity-25" style={{ background: "var(--gold)" }} />
          <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s?.flagship?.photo_url || "/aryo-logo.jpg"} alt="ARYO" className="h-36 w-36 rounded-full object-cover" style={{ boxShadow: "0 0 0 3px var(--surface), 0 0 0 5px var(--gold), 0 20px 40px -12px rgba(194,154,74,.5)" }} />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 pill pill-gold" style={{ background: "var(--gold)", color: "#0b0a08" }}><Crown size={10} /> Flagship</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] font-bold tracking-[.2em] t-gold uppercase">{s?.flagship?.tagline || "The Mother"}</div>
              <div className="text-[34px] font-display font-bold leading-[1.05] mt-1">ARYO Nairobi</div>
              <div className="flex items-center gap-1.5 t-muted mt-1.5"><MapPin size={13} /> {s?.flagship?.location || "Astrol Square, Red Hill Rd"}</div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-3 mt-5 border-t b-line pt-4">
                {[[k?.talent, "Talent"], [s?.clubs, "Clubs"], [s?.upcoming?.length, "Upcoming"], [k?.pending, "Pending"], [k?.thisMonth, "This month"]].map(([v, l], i) => (
                  <div key={l} className={i ? "sm:border-l b-line sm:pl-4" : ""}><div className="text-[18px] font-semibold">{v ?? "–"}</div><div className="text-[11px] t-muted">{l}</div></div>))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking summary */}
        <div className="card p-5">
          <div className="flex items-center justify-between"><div className="font-semibold text-[13.5px]">Booking summary</div><span className="pill pill-mute">All time</span></div>
          <div className="flex items-center gap-4 mt-3">
            {s ? <Ring pct={pct} /> : <div className="skeleton h-[150px] w-[150px] rounded-full" />}
            <div className="flex-1 space-y-2.5">
              {[["Total", k?.total, "var(--text)"], ["Pending", k?.pending, "var(--warn)"], ["Approved", k?.approved, "var(--ok)"], ["Declined", k?.declined, "var(--bad)"], ["This month", k?.thisMonth, "var(--gold)"]].map(([l, v, c]) => (
                <div key={l} className="flex items-center justify-between border-b b-line pb-2 last:border-0"><span className="flex items-center gap-2 t-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />{l}</span><span className="font-semibold">{v ?? "–"}</span></div>))}
            </div>
          </div>
          <Link href="/admin/bookings" className="btn btn-ghost w-full justify-between mt-3 h-9">View all bookings <ArrowRight size={14} /></Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Kpi icon={CalendarCheck2} color="#C29A4A" label="Total bookings" value={k?.total ?? "–"} sub="last 12 weeks" data={trend} k="total" />
        <Kpi icon={TrendingUp} color="#2F9E6E" label="This month" value={k?.thisMonth ?? "–"} delta={monthDelta} sub="vs last month" data={trend} k="approved" />
        <Kpi icon={Clock3} color="#E0663A" label="Awaiting reply" value={k?.pending ?? "–"} sub="pending requests" data={trend} k="total" />
        <Kpi icon={Disc3} color="#7C5CFF" label="Talent on roster" value={k?.talent ?? "–"} sub={k ? `${k.withPhoto} with photos` : ""} data={trend.map((t, i) => ({ v: (k?.talent || 0) * (0.85 + (i / 12) * 0.15) }))} k="v" />
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3"><div className="font-semibold text-[13.5px]">Booking trend</div><span className="pill pill-mute">Last 12 weeks</span></div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs><linearGradient id="tr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C29A4A" stopOpacity={0.3} /><stop offset="100%" stopColor="#C29A4A" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10.5, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12 }} labelStyle={{ color: "var(--muted)" }} />
                <Area name="Requests" type="monotone" dataKey="total" stroke="#C29A4A" strokeWidth={2.2} fill="url(#tr)" dot={{ r: 3.5, fill: "var(--surface)", stroke: "#C29A4A", strokeWidth: 2 }} activeDot={{ r: 5 }} />
                <Area name="Approved" type="monotone" dataKey="approved" stroke="#2F9E6E" strokeWidth={1.6} fill="none" strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold text-[13.5px] mb-3">Talent roster</div>
          <div className="space-y-1">
            {CATEGORIES.map((c) => { const I = CAT_ICON[c.id]; return (
              <Link key={c.id} href="/admin/talent" className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-[var(--surface-2)]">
                <span className="grid place-items-center h-8 w-8 rounded-md" style={{ background: `${CAT_COLORS[c.id]}1f`, color: CAT_COLORS[c.id] }}><I size={15} /></span>
                <span className="flex-1 t-2 font-medium">{c.label}</span><span className="font-semibold">{s?.talentByCat?.[c.id] ?? "–"}</span>
              </Link>); })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="card p-5 xl:col-span-1">
          <div className="flex items-center justify-between mb-3"><div className="font-semibold text-[13.5px]">Recent requests</div><Link href="/admin/bookings" className="t-gold font-semibold text-[11.5px]">View all</Link></div>
          <div className="space-y-3">
            {s && !s.recent.length && <div className="t-muted py-6 text-center">No bookings yet.</div>}
            {s?.recent.slice(0, 4).map((b) => (
              <Link key={b.id} href={`/admin/bookings?open=${b.id}`} className="flex items-center gap-3">
                <Avatar src={b.talent?.photo_url} name={b.talent?.name || b.client_name} size={32} />
                <div className="min-w-0 flex-1"><div className="font-medium truncate">{b.client_name}</div><div className="text-[11px] t-muted truncate">{b.talent?.name || "Any"} · {fmtDate(b.event_date)}</div></div>
                <span className={`pill ${STATUS_PILL[b.status]}`}>{b.status}</span>
              </Link>))}
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold text-[13.5px] mb-2">Requests by category</div>
          <div className="relative h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={catData.length ? catData : [{ name: "None", value: 1, key: "other" }]} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={catData.length > 1 ? 3 : 0} stroke="none">
                {(catData.length ? catData : [{ key: "none" }]).map((d) => <Cell key={d.key} fill={catData.length ? CAT_COLORS[d.key] : "var(--surface-3)"} />)}</Pie></PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none"><div className="text-center"><div className="text-[10px] t-muted">Total</div><div className="text-[20px] font-semibold">{catTotal}</div></div></div>
          </div>
          <div className="space-y-1.5 mt-2">{catData.map((d) => <div key={d.key} className="flex items-center justify-between"><span className="flex items-center gap-2 t-2"><span className="h-2 w-2 rounded-full" style={{ background: CAT_COLORS[d.key] }} />{d.name}</span><span className="font-semibold">{Math.round((d.value / catTotal) * 100)}%</span></div>)}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3"><div className="font-semibold text-[13.5px]">Next event</div><Link href="/admin/events" className="t-gold font-semibold text-[11.5px]">Schedule</Link></div>
          {next ? (<div>
            <div className="rounded-md overflow-hidden aspect-[16/9] bg-surface-3 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {next.poster_url ? <img src={next.poster_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center" style={{ background: "linear-gradient(135deg,#1b160d,#3a2d16)" }}><PartyPopper size={26} color="#CFAA5C" /></div>}
            </div>
            <div className="font-semibold mt-3">{next.title}</div>
            <div className="text-[11.5px] t-muted mt-0.5">{fmtDate(next.event_date)} · {next.start_time} · {next.club?.name}</div>
            {next.music_policy && <div className="mt-2 pill pill-gold">Music: {next.music_policy}</div>}
          </div>) : <div className="t-muted py-6 text-center">No upcoming events. <Link href="/admin/events" className="t-gold">Add one</Link></div>}
        </div>
        <div className="card p-5">
          <div className="font-semibold text-[13.5px] mb-3">Most requested</div>
          <div className="space-y-3">
            {s && !s.topTalent.length && <div className="t-muted py-6 text-center">Will appear once bookings come in.</div>}
            {s?.topTalent.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="grid place-items-center h-8 w-8 rounded-md bg-gold-soft t-gold">{i === 0 ? <Trophy size={15} /> : <Users size={14} />}</span>
                <div className="flex-1 min-w-0"><div className="font-medium truncate">{t.name}</div><div className="text-[11px] t-muted">{catLabel(t.category)}</div></div>
                <span className="font-semibold">{t.count}</span>
              </div>))}
          </div>
        </div>
      </div>
    </div>
  );
}
