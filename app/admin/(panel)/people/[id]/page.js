"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowLeft, Pencil, CalendarPlus, Phone, MessageCircle, Mail, Instagram, Music2, Wallet, Copy, CheckCircle2, Trash2, Loader2, StickyNote, Inbox, CalendarClock } from "lucide-react";
import { api } from "@/lib/ui/api";
import { toast, confirmBox } from "@/lib/ui/dialogs";
import Modal from "@/lib/ui/Modal";
import RowMenu from "@/lib/ui/RowMenu";
import Avatar from "@/lib/ui/Avatar";
import PhotoPicker from "@/lib/ui/PhotoPicker";
import { FormGrid } from "@/components/admin/ResourcePage";
import { personFields, CAT_ICON, waLink, igLink, igHandle } from "@/components/admin/people";
import { gigFields, gigSave, PayPill, STATUS_PILL, statusLabel, fmtDay } from "@/components/admin/gigs";
import { useOptions } from "@/components/admin/useOptions";
import { useMe } from "@/components/admin/MeContext";
import { catOf, kes, payState, PAYMENT_METHODS } from "@/lib/constants";

const tiktokLink = (v) => v ? (String(v).startsWith("http") ? v : `https://www.tiktok.com/@${String(v).replace(/^@/, "")}`) : null;

export default function PersonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { me } = useMe();
  const clubs = useOptions("clubs");
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState(null);
  const [gig, setGig] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api(`/api/admin/people/${id}`).then(setData).catch((e) => { toast(e.message, "bad"); setData({ error: e.message }); }), [id]);
  useEffect(() => { load(); }, [load]);

  const p = data?.person;
  const gigs = data?.gigs || [];
  const today = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => {
    const live = gigs.filter((g) => !["cancelled", "no_show"].includes(g.status));
    const past = live.filter((g) => g.gig_date <= today);
    return {
      nights: past.length, upcoming: live.filter((g) => g.gig_date > today).length,
      earned: past.reduce((a, g) => a + Number(g.amount_paid || 0), 0),
      owed: past.reduce((a, g) => a + Math.max(0, Number(g.fee || 0) - Number(g.amount_paid || 0)), 0),
      last: past[0]?.gig_date, next: [...live].reverse().find((g) => g.gig_date >= today),
      noShows: gigs.filter((g) => g.status === "no_show").length,
    };
  }, [gigs, today]);
  const chart = useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7);
      const list = gigs.filter((g) => g.gig_date.startsWith(m) && !["cancelled", "no_show"].includes(g.status));
      out.push({ m: d.toLocaleDateString("en-GB", { month: "short" }), nights: list.length, fees: list.reduce((a, g) => a + Number(g.fee || 0), 0) });
    }
    return out;
  }, [gigs]);

  if (!data) return <div className="space-y-5"><div className="skeleton h-[230px]" /><div className="skeleton h-[300px]" /></div>;
  if (!p) return <div className="card p-8 text-center t-muted">{data.error || "Profile not found."} <Link href="/admin/djs" className="t-gold">Back</Link></div>;

  const cat = catOf(p.category);
  const I = CAT_ICON[p.category];
  const saveProfile = async (patch, msg = "Profile updated") => {
    setBusy(true);
    try { const { row } = await api(`/api/admin/r/talent/${p.id}`, { method: "PATCH", body: patch }); setData((d) => ({ ...d, person: row })); toast(msg); setEdit(null); }
    catch (e) { toast(e.message, "bad"); } finally { setBusy(false); }
  };
  const saveGig = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const body = { ...gigSave(gig.form), talent_id: p.id };
      if (gig.id) await api(`/api/admin/r/gigs/${gig.id}`, { method: "PATCH", body }); else await api("/api/admin/r/gigs", { method: "POST", body });
      toast(gig.id ? "Booking updated" : "Booked"); setGig(null); load(); window.dispatchEvent(new Event("aryo-bookings"));
    } catch (err) { toast(err.message, "bad"); } finally { setBusy(false); }
  };
  const patchGig = async (g, body, msg) => { try { await api(`/api/admin/r/gigs/${g.id}`, { method: "PATCH", body }); toast(msg); load(); } catch (e) { toast(e.message, "bad"); } };
  const delGig = async (g) => {
    if (!(await confirmBox(`Delete the booking on ${fmtDay(g.gig_date)}?`))) return;
    try { await api(`/api/admin/r/gigs/${g.id}`, { method: "DELETE" }); toast("Deleted"); load(); } catch (e) { toast(e.message, "bad"); }
  };
  const delPerson = async () => {
    if (!(await confirmBox(`Delete ${p.name}'s profile and all ${gigs.length} bookings? This can't be undone.`))) return;
    try { await api(`/api/admin/r/talent/${p.id}`, { method: "DELETE" }); toast("Profile deleted"); router.replace(cat.href); } catch (e) { toast(e.message, "bad"); }
  };
  const copy = (v) => { navigator.clipboard?.writeText(v); toast("Copied"); };
  const payLine = p.payment_method === "mpesa" ? p.mpesa_number : p.payment_method === "bank" ? p.bank_account : null;
  const newGig = () => setGig({ form: { gig_date: today, status: "confirmed", club_id: clubs.find((c) => c.is_flagship)?.id || "", fee: p.rate ? Number(p.rate) : null, amount_paid: 0 } });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={cat.href} className="inline-flex items-center gap-1.5 t-muted hover:text-[var(--text)]"><ArrowLeft size={14} /> {cat.label}</Link>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => setEdit({ ...p })}><Pencil size={14} /> Edit profile</button>
          <button className="btn btn-gold" onClick={newGig}><CalendarPlus size={14} /> Book for a night</button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-5">
        {/* profile hero */}
        <div className="card relative overflow-hidden p-6 flex flex-col justify-between">
          <div className="absolute right-6 -top-4 font-display font-extrabold text-[150px] leading-none select-none pointer-events-none" style={{ color: "var(--text)", opacity: 0.035 }}>{p.name.replace(/^(dj|mc)\s+/i, "").split(" ")[0].toUpperCase()}</div>
          <div className="absolute -left-24 -bottom-28 h-72 w-72 rounded-full blur-3xl opacity-20" style={{ background: "var(--gold)" }} />
          <div className="relative flex flex-col sm:flex-row gap-6 sm:items-center">
            <div className="shrink-0"><PhotoPicker value={p.photo_url} name={p.name} folder="talent" size={150} compact onChange={(url) => saveProfile({ photo_url: url }, url ? "Photo saved" : "Photo removed")} /></div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[.18em] t-gold uppercase"><I size={12} /> {cat.one}</div>
              <h1 className="text-[32px] font-display font-bold leading-[1.05] mt-1">{p.name}</h1>
              <div className="t-muted mt-1">{[p.real_name, p.headline].filter(Boolean).join(" · ") || "Add a real name and short description"}</div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {p.genres && <span className="pill pill-gold"><Music2 size={10} />{p.genres}</span>}
                <span className={`pill ${p.active ? "pill-ok" : "pill-mute"}`}>{p.active ? "Active" : "Inactive"}</span>
                {stats.noShows > 0 && <span className="pill pill-bad">{stats.noShows} no-show{stats.noShows > 1 ? "s" : ""}</span>}
              </div>
            </div>
          </div>
          <div className="relative grid grid-cols-2 sm:grid-cols-5 gap-y-4 mt-6 pt-5 border-t b-line">
            {[[stats.nights, "Nights at ARYO"], [stats.upcoming, "Upcoming"], [kes(stats.earned), "Paid so far"], [stats.owed ? kes(stats.owed) : "—", "Owed", stats.owed ? "var(--bad)" : null], [p.rate ? kes(p.rate) : "—", p.rate_unit ? `Fee ${p.rate_unit}` : "Usual fee"]].map(([v, l, c], i) => (
              <div key={l} className={i ? "sm:border-l b-line sm:pl-4" : ""}><div className="text-[18px] font-semibold" style={c ? { color: c } : undefined}>{v}</div><div className="text-[11px] t-muted">{l}</div></div>))}
          </div>
        </div>

        {/* payment + contacts */}
        <div className="card p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between"><div className="font-semibold text-[13.5px]">Payment details</div><Wallet size={15} className="t-gold" /></div>
            {p.payment_method ? (
              <div className="mt-3 rounded-md p-3.5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1b160d,#3a2d16)", color: "#EFEAE0" }}>
                <div className="text-[10px] uppercase tracking-[.2em] text-[#CFAA5C]">{PAYMENT_METHODS.find((m) => m.value === p.payment_method)?.label}</div>
                <div className="mt-1 text-[18px] font-semibold tracking-wide flex items-center gap-2">{payLine || (p.payment_method === "cash" ? "Pays in cash" : "—")}
                  {payLine && <button onClick={() => copy(payLine)} className="text-[#CFAA5C] hover:text-white" title="Copy"><Copy size={13} /></button>}</div>
                <div className="text-[11.5px] text-[#a7a092]">{p.payment_method === "mpesa" ? p.mpesa_name : p.payment_method === "bank" ? p.bank_name : ""}</div>
              </div>
            ) : <button onClick={() => setEdit({ ...p })} className="mt-3 w-full rounded-md border border-dashed b-line p-3 t-muted hover:text-[var(--text)] text-left">+ Add how to pay them</button>}
          </div>
          <div>
            <div className="font-semibold text-[13.5px] mb-2">Contacts</div>
            <div className="divide-y" style={{ borderColor: "var(--line)" }}>
              {[[Phone, p.phone, p.phone && `tel:${p.phone}`], [MessageCircle, p.whatsapp || p.phone ? `WhatsApp ${p.whatsapp || p.phone}` : null, waLink(p.whatsapp || p.phone)],
                [Mail, p.email, p.email && `mailto:${p.email}`], [Instagram, p.instagram && igHandle(p.instagram), igLink(p.instagram)], [Music2, p.tiktok && `TikTok ${igHandle(p.tiktok)}`, tiktokLink(p.tiktok)]]
                .filter(([, v]) => v).map(([Ic, v, href]) => (
                  <a key={v} href={href} target={href?.startsWith("http") ? "_blank" : undefined} className="flex items-center gap-3 py-2.5 hover:text-[var(--gold)]" style={{ borderColor: "var(--line)" }}>
                    <span className="grid place-items-center h-8 w-8 rounded-md bg-gold-soft t-gold"><Ic size={14} /></span><span className="font-medium truncate">{v}</span></a>))}
              {!p.phone && !p.email && !p.instagram && <div className="t-muted py-2">No contacts yet.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3"><div className="font-semibold text-[13.5px]">Nights at ARYO</div><span className="pill pill-mute">Last 6 months</span></div>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                <defs><linearGradient id="pn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C29A4A" stopOpacity={0.35} /><stop offset="100%" stopColor="#C29A4A" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10.5, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10.5, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12 }} formatter={(v, n) => (n === "fees" ? kes(v) : v)} />
                <Area name="nights" type="monotone" dataKey="nights" stroke="#C29A4A" strokeWidth={2.2} fill="url(#pn)" dot={{ r: 3.5, fill: "var(--surface)", stroke: "#C29A4A", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold text-[13.5px] mb-3">About</div>
          <div className="space-y-3">
            {stats.next && <div className="flex items-center gap-3 rounded-md p-3 bg-gold-soft"><CalendarClock size={16} className="t-gold" /><div><div className="text-[11px] t-muted">Next at ARYO</div><div className="font-semibold">{fmtDay(stats.next.gig_date)}{stats.next.night ? ` · ${stats.next.night}` : ""}</div></div></div>}
            <p className="t-2 whitespace-pre-line leading-relaxed">{p.bio || <span className="t-faint">No bio yet.</span>}</p>
            {p.notes && <div className="well p-3"><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider t-muted mb-1"><StickyNote size={11} /> Staff notes</div><p className="t-2 whitespace-pre-line">{p.notes}</p></div>}
            <div className="text-[11px] t-faint">Last played: {stats.last ? fmtDay(stats.last) : "never"}</div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b b-line"><div className="font-semibold text-[13.5px]">Booking history</div><span className="t-muted">{gigs.length} booking{gigs.length === 1 ? "" : "s"}</span></div>
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Date</th><th>Night</th><th>Time</th><th style={{ textAlign: "right" }}>Fee</th><th style={{ textAlign: "right" }}>Paid</th><th>Payment</th><th>Status</th><th style={{ width: 48 }} /></tr></thead>
          <tbody>{gigs.map((g) => (
            <tr key={g.id} className="cursor-pointer" onClick={() => setGig({ id: g.id, form: { ...g } })}>
              <td className="font-medium whitespace-nowrap">{fmtDay(g.gig_date)}</td><td>{g.night || "—"}<div className="text-[11px] t-muted">{g.club?.name}</div></td>
              <td className="t-2">{g.start_time ? `${g.start_time}${g.end_time ? `–${g.end_time}` : ""}` : "—"}</td>
              <td style={{ textAlign: "right" }}>{Number(g.fee) ? kes(g.fee) : "—"}</td><td style={{ textAlign: "right" }}>{Number(g.amount_paid) ? kes(g.amount_paid) : "—"}</td>
              <td><PayPill g={g} /></td><td><span className={`pill ${STATUS_PILL[g.status]}`}>{statusLabel(g.status)}</span></td>
              <td onClick={(e) => e.stopPropagation()}><RowMenu items={[
                { label: "Edit", icon: Pencil, onClick: () => setGig({ id: g.id, form: { ...g } }) },
                ["scheduled", "confirmed"].includes(g.status) && { label: "Mark completed", icon: CheckCircle2, onClick: () => patchGig(g, { status: "completed" }, "Marked completed") },
                ["unpaid", "partial"].includes(payState(g)) && { label: "Mark fully paid", icon: Wallet, onClick: () => patchGig(g, { amount_paid: Number(g.fee), paid_on: today }, "Marked paid") },
                "sep",
                { label: "Delete", icon: Trash2, danger: true, disabled: me.role !== "admin", onClick: () => delGig(g) },
              ].filter(Boolean)} /></td>
            </tr>))}</tbody>
        </table>
        {!gigs.length && <div className="py-12 text-center t-muted"><Inbox size={26} className="mx-auto mb-2 t-faint" />Not booked yet. <button className="t-gold font-semibold" onClick={newGig}>Book for a night</button></div>}</div>
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit profile" subtitle={p.name} icon={<I size={15} />} width={620}
        footer={<>{me.role === "admin" && <button className="btn btn-ghost mr-auto" style={{ color: "var(--bad)" }} onClick={delPerson}><Trash2 size={14} /> Delete profile</button>}
          <button className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
          <button className="btn btn-gold" form="person-form" disabled={busy}>{busy && <Loader2 size={14} className="animate-spin" />} Save changes</button></>}>
        {edit && <form id="person-form" onSubmit={(e) => { e.preventDefault(); const { id: _i, created_at: _c, updated_at: _u, ...rest } = edit; saveProfile(rest); }}>
          <FormGrid fields={personFields(edit.category)} form={edit} setForm={(fn) => setEdit((s) => fn(s))} /></form>}
      </Modal>

      <Modal open={!!gig} onClose={() => setGig(null)} title={gig?.id ? "Edit booking" : `Book ${p.name}`} subtitle={gig?.id ? fmtDay(gig.form.gig_date) : "Add a night to ARYO's schedule"} icon={<CalendarPlus size={15} />} width={600}
        footer={<><button className="btn btn-ghost" onClick={() => setGig(null)}>Cancel</button>
          <button className="btn btn-gold" form="gig-form" disabled={busy}>{busy && <Loader2 size={14} className="animate-spin" />} {gig?.id ? "Save changes" : "Add booking"}</button></>}>
        {gig && <form id="gig-form" onSubmit={saveGig}><FormGrid fields={gigFields([p], clubs, { lockTalent: true })} form={gig.form} setForm={(fn) => setGig((s) => ({ ...s, form: fn(s.form) }))} /></form>}
      </Modal>
    </div>
  );
}
