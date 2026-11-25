"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarCheck2, CheckCircle2, BadgeCheck, Wallet, XCircle, MessageCircle, Phone, UserRound, Ban } from "lucide-react";
import ResourcePage, { DetailRows } from "@/components/admin/ResourcePage";
import Avatar from "@/lib/ui/Avatar";
import { useOptions } from "@/components/admin/useOptions";
import { gigFields, gigSave, PayPill, STATUS_PILL, statusLabel, fmtDay, gigSummary } from "@/components/admin/gigs";
import { waLink } from "@/components/admin/people";
import { GIG_STATUSES, kes, catLabel, payState } from "@/lib/constants";

const iso = (d) => d.toISOString().slice(0, 10);

function WeekStrip({ rows, openCreate }) {
  const days = useMemo(() => [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return iso(d); }), []);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-5">
      {days.map((d, i) => {
        const list = rows.filter((g) => g.gig_date === d && !["cancelled", "no_show"].includes(g.status));
        const dt = new Date(d + "T00:00:00");
        return (
          <div key={d} className="card p-3 flex flex-col min-h-[132px]" style={i === 0 ? { borderColor: "var(--gold-line)", boxShadow: "0 0 0 1px var(--gold-line)" } : undefined}>
            <div className="flex items-baseline justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: i === 0 ? "var(--gold)" : "var(--muted)" }}>{i === 0 ? "Tonight" : dt.toLocaleDateString("en-GB", { weekday: "short" })}</span>
              <span className="text-[18px] font-semibold">{dt.getDate()}</span>
            </div>
            <div className="mt-2 flex-1 space-y-1.5">
              {list.slice(0, 3).map((g) => (
                <Link key={g.id} href={`/admin/bookings?open=${g.id}`} scroll={false} className="flex items-center gap-2 rounded px-1 -mx-1 py-0.5 hover:bg-[var(--surface-2)]">
                  <Avatar src={g.talent?.photo_url} name={g.talent?.name} size={22} />
                  <span className="truncate text-[11.5px] font-medium">{g.talent?.name}</span>
                </Link>))}
              {list.length > 3 && <div className="text-[11px] t-muted">+{list.length - 3} more</div>}
            </div>
            {!list.length && <button onClick={() => openCreate({ gig_date: d })} className="text-[11px] t-faint hover:text-[var(--gold)] text-left">+ Book someone</button>}
          </div>
        );
      })}
    </div>
  );
}

function Page() {
  const talent = useOptions("talent");
  const clubs = useOptions("clubs");
  const params = useSearchParams();
  const ctxRef = useRef(null);
  const flagship = clubs.find((c) => c.is_flagship)?.id || "";
  // ?new=<talentId> opens the form with that person pre-selected (from a profile)
  useEffect(() => {
    const id = params.get("new");
    if (id && ctxRef.current && talent.length) {
      const t = talent.find((x) => x.id === id);
      ctxRef.current.openCreate({ talent_id: id, fee: t?.rate ? Number(t.rate) : null });
    }
  }, [params, talent]);
  const today = iso(new Date());

  return (
    <ResourcePage resource="gigs" title="DJ bookings" singular="Booking" icon={<CalendarCheck2 size={15} />} modalWidth={620}
      subtitle="ARYO's schedule — who plays which night, the agreed fee and whether they've been paid"
      tabs={GIG_STATUSES.map((s) => ({ value: s.value, label: s.label }))} tabKey="status"
      searchKeys={["talent.name", "night", "payment_ref", "gig_date"]}
      defaults={{ status: "confirmed", club_id: flagship, gig_date: today, amount_paid: 0 }}
      fields={gigFields(talent, clubs)} transformSave={gigSave}
      deleteLabel={(r) => `${r.talent?.name}'s booking on ${fmtDay(r.gig_date)}`}
      header={(ctx) => { ctxRef.current = ctx; return <WeekStrip rows={ctx.rows} openCreate={ctx.openCreate} />; }}
      columns={[
        { label: "Date", render: (r) => <div><div className="font-semibold">{fmtDay(r.gig_date)}</div><div className="text-[11px] t-muted">{r.start_time ? `${r.start_time}${r.end_time ? `–${r.end_time}` : ""}` : "Time not set"}</div></div> },
        { label: "Who", render: (r) => <div className="flex items-center gap-2.5"><Avatar src={r.talent?.photo_url} name={r.talent?.name} size={30} /><div><div className="font-medium">{r.talent?.name}</div><div className="text-[11px] t-muted">{catLabel(r.talent?.category)}</div></div></div> },
        { label: "Night", render: (r) => <div><div className="t-2">{r.night || "—"}</div><div className="text-[11px] t-muted">{r.club?.name}</div></div> },
        { label: "Fee", align: "right", render: (r) => <span className="font-medium">{Number(r.fee) ? kes(r.fee) : "—"}</span> },
        { label: "Payment", render: (r) => <PayPill g={r} /> },
        { label: "Status", render: (r) => <span className={`pill ${STATUS_PILL[r.status]}`}>{statusLabel(r.status)}</span> },
      ]}
      extraActions={(r, { patch }) => [
        r.status === "scheduled" && { label: "Mark confirmed", icon: BadgeCheck, onClick: () => patch(r, { status: "confirmed" }, "Confirmed") },
        ["scheduled", "confirmed"].includes(r.status) && { label: "Mark completed", icon: CheckCircle2, onClick: () => patch(r, { status: "completed" }, "Marked completed") },
        ["unpaid", "partial"].includes(payState(r)) && { label: "Mark fully paid", icon: Wallet, onClick: () => patch(r, { amount_paid: Number(r.fee), paid_on: today }, "Marked paid") },
        ["scheduled", "confirmed"].includes(r.status) && { label: "Cancel booking", icon: Ban, onClick: () => patch(r, { status: "cancelled" }, "Cancelled") },
        r.status !== "no_show" && r.gig_date <= today && { label: "Mark no-show", icon: XCircle, onClick: () => patch(r, { status: "no_show" }, "Marked no-show") },
        { label: "Open profile", icon: UserRound, onClick: () => (window.location.href = `/admin/people/${r.talent_id}`) },
      ].filter(Boolean)}
      renderView={(r, { patch, close }) => {
        const t = r.talent || {};
        const bal = Math.max(0, Number(r.fee) - Number(r.amount_paid));
        return (<div>
          <div className="flex items-center gap-4 mb-4">
            <Avatar src={t.photo_url} name={t.name} size={64} ring />
            <div className="flex-1"><Link href={`/admin/people/${t.id}`} className="text-[17px] font-semibold hover:underline">{t.name}</Link>
              <div className="t-muted">{gigSummary(r)}</div>
              <div className="flex gap-1.5 mt-1.5"><span className={`pill ${STATUS_PILL[r.status]}`}>{statusLabel(r.status)}</span><PayPill g={r} /></div></div>
          </div>
          <DetailRows rows={[["Night", r.night], ["Venue", r.club?.name], ["Agreed fee", Number(r.fee) ? kes(r.fee) : null], ["Paid", kes(r.amount_paid)], ["Balance", bal ? <b key="b" style={{ color: "var(--bad)" }}>{kes(bal)}</b> : "Nothing owed"],
            ["Paid on", r.paid_on && fmtDay(r.paid_on)], ["Reference", r.payment_ref],
            ["Pay via", t.payment_method === "mpesa" ? `M-Pesa ${t.mpesa_number || ""}${t.mpesa_name ? ` (${t.mpesa_name})` : ""}` : t.payment_method === "bank" ? `${t.bank_name || "Bank"} ${t.bank_account || ""}` : t.payment_method],
            ["Notes", r.notes], ["Added by", r.creator?.name]]} />
          <div className="flex flex-wrap gap-2 mt-4">
            {t.phone && <a className="btn btn-ghost" href={`tel:${t.phone}`}><Phone size={14} /> Call</a>}
            {(t.whatsapp || t.phone) && <a className="btn btn-ghost" href={waLink(t.whatsapp || t.phone)} target="_blank"><MessageCircle size={14} /> WhatsApp</a>}
            <span className="flex-1" />
            {["scheduled", "confirmed"].includes(r.status) && <button className="btn btn-ghost" onClick={() => { patch(r, { status: "completed" }, "Marked completed"); close(); }}><CheckCircle2 size={14} /> Completed</button>}
            {bal > 0 && <button className="btn btn-gold" onClick={() => { patch(r, { amount_paid: Number(r.fee), paid_on: today }, "Marked paid"); close(); }}><Wallet size={14} /> Mark paid</button>}
          </div>
        </div>);
      }} />
  );
}
export default function BookingsPage() { return <Suspense><Page /></Suspense>; }
