"use client";
import { Suspense } from "react";
import { Disc3, Mic2, Shirt, Music4, Megaphone, Phone, MessageCircle, EyeOff, Eye, CalendarPlus } from "lucide-react";
import ResourcePage from "./ResourcePage";
import Avatar from "@/lib/ui/Avatar";
import { CATEGORIES, PAYMENT_METHODS, catOf, kes } from "@/lib/constants";

export const CAT_ICON = { dj: Disc3, host: Mic2, designer: Shirt, artist: Music4, mc: Megaphone };
export const waLink = (p) => p ? `https://wa.me/${String(p).replace(/\D/g, "").replace(/^0/, "254")}` : null;
export const igLink = (v) => v ? (String(v).startsWith("http") ? v : `https://www.instagram.com/${String(v).replace(/^@/, "")}/`) : null;
export const igHandle = (v) => v ? "@" + String(v).replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/^@/, "").replace(/\/.*$/, "") : "";

const SPECIALITY = { dj: ["Genres", "Afrobeats, Amapiano, R'n'B…"], host: ["What they do", "Hosting, hype, comedy…"], mc: ["Style", "Hype MC, event MC…"], artist: ["Genre", "Gengetone, Afro-pop…"], designer: ["Speciality", "Suits, streetwear, styling…"] };

export function personFields(category) {
  const [specLabel, specPh] = SPECIALITY[category] || SPECIALITY.dj;
  return [
    { key: "photo_url", label: "Profile picture", type: "photo", folder: "talent", size: 92 },
    { type: "section", label: "Profile" },
    { key: "name", label: "Stage / brand name", required: true, half: true, placeholder: category === "dj" ? "e.g. DJ AceKing" : "" },
    { key: "real_name", label: "Real name", half: true },
    { key: "category", label: "Tab", type: "select", required: true, half: true, options: CATEGORIES.map((c) => ({ value: c.id, label: c.label })) },
    { key: "genres", label: specLabel, placeholder: specPh, half: true },
    { key: "headline", label: "Short description", placeholder: "One line about them" },
    { key: "bio", label: "Bio", type: "textarea", rows: 3 },
    { type: "section", label: "Contacts" },
    { key: "phone", label: "Phone", half: true, placeholder: "07…" },
    { key: "whatsapp", label: "WhatsApp (if different)", half: true },
    { key: "email", label: "Email", type: "email", half: true },
    { key: "instagram", label: "Instagram", half: true, placeholder: "@handle" },
    { key: "tiktok", label: "TikTok", half: true, placeholder: "@handle" },
    { type: "section", label: "Rates & payment" },
    { key: "rate", label: "Usual fee (KES)", type: "number", half: true },
    { key: "rate_unit", label: "Fee is", type: "select", half: true, options: ["per night", "per set", "per hour", "per event", "negotiable"].map((v) => ({ value: v, label: v })) },
    { key: "payment_method", label: "Pay them via", type: "select", half: true, options: PAYMENT_METHODS },
    { key: "mpesa_number", label: "M-Pesa number", half: true, hidden: (f) => f.payment_method !== "mpesa" },
    { key: "mpesa_name", label: "Name on M-Pesa", half: true, hidden: (f) => f.payment_method !== "mpesa" },
    { key: "bank_name", label: "Bank", half: true, hidden: (f) => f.payment_method !== "bank" },
    { key: "bank_account", label: "Account number / name", half: true, hidden: (f) => f.payment_method !== "bank" },
    { type: "section", label: "Internal" },
    { key: "notes", label: "Notes (staff only)", type: "textarea", rows: 3, placeholder: "Reliability, what crowds they suit, agreements…" },
    { key: "sort_order", label: "Order in list", type: "number", half: true },
    { key: "active", label: "Active on roster", type: "toggle", half: true },
  ];
}

function Tab({ category }) {
  const c = catOf(category);
  const I = CAT_ICON[category];
  return (
    <ResourcePage resource="talent" title={c.label} singular={c.one} icon={<I size={15} />} modalWidth={620}
      subtitle={`Profiles of ${c.label.toLowerCase()} who work with ARYO — contacts, rates, payment details and nights worked`}
      filter={(r) => r.category === category} viewHref={(r) => `/admin/people/${r.id}`}
      tabs={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} tabKey="active"
      searchKeys={["name", "real_name", "genres", "phone", "instagram"]}
      defaults={{ category, active: true, sort_order: 0, rate_unit: "per night" }} fields={personFields(category)}
      columns={[
        { label: "Name", render: (r) => (
          <div className="flex items-center gap-3"><Avatar src={r.photo_url} name={r.name} size={36} />
            <div className="min-w-0"><div className="font-semibold">{r.name}</div><div className="text-[11px] t-muted truncate max-w-[240px]">{r.real_name || r.genres || "—"}</div></div></div>) },
        { label: "Phone", render: (r) => r.phone || <span className="t-faint">Add phone</span> },
        { label: "Instagram", render: (r) => r.instagram ? igHandle(r.instagram) : <span className="t-faint">—</span> },
        { label: "Fee", render: (r) => r.rate ? <span>{kes(r.rate)} <span className="t-muted text-[11px]">{r.rate_unit}</span></span> : <span className="t-faint">—</span> },
        { label: "Pay via", render: (r) => r.payment_method ? <span className="pill pill-gold">{PAYMENT_METHODS.find((p) => p.value === r.payment_method)?.label}</span> : <span className="t-faint">—</span> },
        { label: "Status", render: (r) => <span className={`pill ${r.active ? "pill-ok" : "pill-mute"}`}>{r.active ? "Active" : "Inactive"}</span> },
      ]}
      extraActions={(r, { patch }) => [
        { label: "Book for a night", icon: CalendarPlus, onClick: () => (window.location.href = `/admin/bookings?new=${r.id}`) },
        r.phone && { label: "Call", icon: Phone, onClick: () => (window.location.href = `tel:${r.phone}`) },
        (r.whatsapp || r.phone) && { label: "WhatsApp", icon: MessageCircle, onClick: () => window.open(waLink(r.whatsapp || r.phone), "_blank") },
        { label: r.active ? "Mark inactive" : "Mark active", icon: r.active ? EyeOff : Eye, onClick: () => patch(r, { active: !r.active }) },
      ].filter(Boolean)}
      renderView={() => null} />
  );
}

export default function PeopleTab({ category }) { return <Suspense><Tab category={category} /></Suspense>; }
