"use client";
import { Suspense } from "react";
import { CalendarCheck2, Check, X, CheckCheck, Phone, MessageCircle, Mail } from "lucide-react";
import ResourcePage, { DetailRows } from "@/components/admin/ResourcePage";
import Avatar from "@/lib/ui/Avatar";
import { useOptions } from "@/components/admin/useOptions";
import { fmtDate, fmtDateTime, ago, STATUS_PILL } from "@/components/admin/fmt";
import { BOOKING_STATUSES, catLabel } from "@/lib/constants";

const wa = (p) => `https://wa.me/${String(p).replace(/\D/g, "").replace(/^0/, "254")}`;

function Page() {
  const talent = useOptions("talent");
  const fields = [
    { key: "talent_id", label: "Talent", type: "select", options: talent.map((t) => ({ value: t.id, label: `${t.name} · ${catLabel(t.category)}` })) },
    { key: "client_name", label: "Client name", required: true, half: true },
    { key: "phone", label: "Phone", required: true, half: true },
    { key: "email", label: "Email", type: "email", half: true },
    { key: "event_date", label: "Event date", type: "date", required: true, half: true },
    { key: "event_type", label: "Event type", half: true, placeholder: "Birthday, corporate, club night…" },
    { key: "venue", label: "Venue", half: true },
    { key: "guests", label: "Guests", type: "number", half: true },
    { key: "budget", label: "Budget", half: true },
    { key: "message", label: "Client message", type: "textarea", rows: 3 },
    { key: "status", label: "Status", type: "select", required: true, half: true, options: BOOKING_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })) },
    { key: "admin_note", label: "Internal note (sent to client on approve/decline)", type: "textarea", rows: 2 },
  ];
  return (
    <ResourcePage resource="bookings" title="Bookings" singular="Booking" icon={<CalendarCheck2 size={15} />} subtitle="Requests from the website and bookings added by staff"
      tabs={BOOKING_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))} tabKey="status"
      searchKeys={["ref", "client_name", "phone", "talent.name", "venue"]} defaults={{ status: "approved" }} fields={fields}
      deleteLabel={(r) => `booking ${r.ref}`}
      transformSave={(f) => { const { talent: _t, handler: _h, ...rest } = f; return rest; }}
      columns={[
        { label: "Ref", render: (r) => <div><div className="font-semibold">{r.ref}</div><div className="text-[11px] t-muted">{ago(r.created_at)}</div></div> },
        { label: "Client", render: (r) => <div><div className="font-medium">{r.client_name}</div><div className="text-[11px] t-muted">{r.phone}</div></div> },
        { label: "Talent", render: (r) => r.talent ? <div className="flex items-center gap-2"><Avatar src={r.talent.photo_url} name={r.talent.name} size={26} /><span className="font-medium">{r.talent.name}</span></div> : <span className="t-faint">Any</span> },
        { label: "Event", render: (r) => <div><div className="font-medium">{fmtDate(r.event_date)}</div><div className="text-[11px] t-muted truncate max-w-[180px]">{[r.event_type, r.venue].filter(Boolean).join(" · ")}</div></div> },
        { label: "Status", render: (r) => <span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span> },
      ]}
      extraActions={(r, { patch }) => [
        r.status !== "approved" && { label: "Approve", icon: Check, onClick: () => patch(r, { status: "approved" }, "Booking approved") },
        r.status !== "declined" && { label: "Decline", icon: X, onClick: () => patch(r, { status: "declined" }, "Booking declined") },
        r.status === "approved" && { label: "Mark completed", icon: CheckCheck, onClick: () => patch(r, { status: "completed" }, "Marked completed") },
        { label: "WhatsApp client", icon: MessageCircle, onClick: () => window.open(wa(r.phone), "_blank") },
      ].filter(Boolean)}
      renderView={(r, { patch, close }) => (<div>
        <div className="flex items-center gap-4 mb-4">
          <Avatar src={r.talent?.photo_url} name={r.talent?.name || r.client_name} size={64} ring />
          <div className="flex-1"><div className="text-[17px] font-semibold">{r.talent?.name || "No specific talent"}</div><div className="t-muted">{r.ref} · received {fmtDateTime(r.created_at)}</div>
            <span className={`pill mt-1.5 ${STATUS_PILL[r.status]}`}>{r.status}</span></div>
        </div>
        {r.message && <div className="well p-3 mb-4 t-2 whitespace-pre-line">“{r.message}”</div>}
        <DetailRows rows={[["Client", r.client_name], ["Phone", r.phone], ["Email", r.email], ["Event date", fmtDate(r.event_date)], ["Event type", r.event_type], ["Venue", r.venue], ["Guests", r.guests], ["Budget", r.budget], ["Note", r.admin_note], ["Handled by", r.handler?.name]]} />
        <div className="flex flex-wrap gap-2 mt-4">
          <a className="btn btn-ghost" href={`tel:${r.phone}`}><Phone size={14} /> Call</a>
          <a className="btn btn-ghost" href={wa(r.phone)} target="_blank"><MessageCircle size={14} /> WhatsApp</a>
          {r.email && <a className="btn btn-ghost" href={`mailto:${r.email}`}><Mail size={14} /> Email</a>}
          <span className="flex-1" />
          {r.status === "pending" && <>
            <button className="btn btn-ghost" style={{ color: "var(--bad)" }} onClick={() => { patch(r, { status: "declined" }, "Booking declined"); close(); }}><X size={14} /> Decline</button>
            <button className="btn btn-gold" onClick={() => { patch(r, { status: "approved" }, "Booking approved"); close(); }}><Check size={14} /> Approve</button>
          </>}
        </div>
      </div>)} />
  );
}
export default function BookingsPage() { return <Suspense><Page /></Suspense>; }
