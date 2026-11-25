"use client";
import { CATEGORIES, GIG_STATUSES, payState, kes, catLabel } from "@/lib/constants";

export const PAY_PILL = { paid: ["pill-ok", "Paid"], partial: ["pill-warn", "Part-paid"], unpaid: ["pill-bad", "Unpaid"], no_fee: ["pill-mute", "No fee"] };
export const STATUS_PILL = { scheduled: "pill-info", confirmed: "pill-gold", completed: "pill-ok", cancelled: "pill-mute", no_show: "pill-bad" };
export const statusLabel = (s) => GIG_STATUSES.find((x) => x.value === s)?.label || s;
export const fmtDay = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export function PayPill({ g }) { const [c, l] = PAY_PILL[payState(g)]; return <span className={`pill ${c}`}>{l}</span>; }

export function gigFields(talent, clubs, { lockTalent = false } = {}) {
  const byId = Object.fromEntries(talent.map((t) => [t.id, t]));
  return [
    { key: "talent_id", label: "Who is playing / working", type: "select", required: true, hidden: () => lockTalent,
      options: CATEGORIES.flatMap((c) => talent.filter((t) => t.category === c.id && t.active !== false).map((t) => ({ value: t.id, label: t.name, group: c.label }))),
      // fill in their usual fee when someone is picked
      onSet: (v, f) => (byId[v]?.rate && !f.fee ? { fee: Number(byId[v].rate) } : {}) },
    { key: "gig_date", label: "Date", type: "date", required: true, half: true },
    { key: "night", label: "Night / theme", half: true, placeholder: "e.g. Pent R'n'B Tuesday" },
    { key: "start_time", label: "Starts", type: "time", half: true },
    { key: "end_time", label: "Ends", type: "time", half: true },
    { key: "club_id", label: "Venue", type: "select", half: true, options: clubs.map((c) => ({ value: c.id, label: c.name })) },
    { key: "status", label: "Status", type: "select", required: true, half: true, options: GIG_STATUSES },
    { type: "section", label: "Payment" },
    { key: "fee", label: "Agreed fee (KES)", type: "number", half: true },
    { key: "amount_paid", label: "Amount paid (KES)", type: "number", half: true },
    { key: "paid_on", label: "Paid on", type: "date", half: true },
    { key: "payment_ref", label: "M-Pesa code / reference", half: true, placeholder: "e.g. SKL4X…" },
    { key: "notes", label: "Notes", type: "textarea", rows: 2 },
  ];
}

export const gigSave = (f) => {
  const { talent: _t, club: _c, creator: _cr, id: _id, created_at: _ca, updated_at: _u, created_by: _cb, ...rest } = f;
  return rest;
};

export function gigSummary(g) {
  return `${fmtDay(g.gig_date)}${g.start_time ? ` · ${g.start_time}${g.end_time ? `–${g.end_time}` : ""}` : ""}`;
}
export { kes, catLabel };
