"use client";
import { Suspense } from "react";
import { Handshake, Globe2, ExternalLink } from "lucide-react";
import ResourcePage, { DetailRows } from "./ResourcePage";
import { contactFields, ContactButtons, contactCell } from "./contacts";
import { igHandle, igLink } from "./people";

export const Logo = ({ r, size = 34 }) => (
  <div className="rounded-md border b-line bg-white grid place-items-center overflow-hidden shrink-0" style={{ width: size * 1.6, height: size }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {r.logo_url ? <img src={r.logo_url} alt={r.name} className="max-h-full max-w-full object-contain p-1" /> : <span className="text-[10px] font-bold text-[#8a7a55]">{r.name.slice(0, 3).toUpperCase()}</span>}
  </div>
);

const COPY = {
  sponsor: { title: "Sponsors", singular: "Sponsor", icon: Handshake, sub: "Brands that sponsor ARYO — who to call and what's been agreed" },
  media: { title: "Online presence", singular: "Page / platform", icon: Globe2, sub: "Pages, blogs and platforms where ARYO is featured or promoted" },
};

function Tab({ kind }) {
  const c = COPY[kind];
  const fields = [
    { key: "logo_url", label: "Logo", type: "photo", folder: "partners", shape: "square", size: 84 },
    { type: "section", label: c.singular },
    { key: "name", label: "Name", required: true, half: true },
    { key: "website", label: "Website / link", half: true },
    { key: "instagram", label: "Instagram", half: true },
    ...(kind === "media" ? [{ key: "followers", label: "Followers / reach", half: true, placeholder: "e.g. 120K" }] : []),
    ...contactFields,
    { type: "section", label: "Internal" },
    { key: "notes", label: kind === "sponsor" ? "Deal notes" : "Notes", type: "textarea", rows: 3, placeholder: kind === "sponsor" ? "What they give (drinks, cash, branding), what ARYO gives back, dates…" : "Posts done, rates, contact history…" },
    { key: "sort_order", label: "Order in list", type: "number", half: true },
    { key: "active", label: "Active", type: "toggle", half: true },
  ];
  return (
    <ResourcePage resource="partners" title={c.title} singular={c.singular} icon={<c.icon size={15} />} subtitle={c.sub}
      filter={(r) => r.kind === kind} defaults={{ kind, active: true, sort_order: 0 }} fields={fields} searchKeys={["name", "contact_person", "notes"]}
      columns={[
        { label: "Name", render: (r) => <div className="flex items-center gap-3"><Logo r={r} /><div className="font-semibold">{r.name}</div></div> },
        { label: "Contact", render: contactCell },
        ...(kind === "media" ? [{ label: "Reach", render: (r) => r.followers || <span className="t-faint">—</span> }] : []),
        { label: "Instagram", render: (r) => r.instagram ? igHandle(r.instagram) : <span className="t-faint">—</span> },
        { label: "Status", render: (r) => <span className={`pill ${r.active ? "pill-ok" : "pill-mute"}`}>{r.active ? "Active" : "Inactive"}</span> },
      ]}
      renderView={(r) => (<div>
        <div className="flex items-center gap-4 mb-5"><Logo r={r} size={60} /><div><div className="text-[18px] font-semibold">{r.name}</div><div className="t-muted">{c.singular}</div></div></div>
        <DetailRows rows={[["Website", r.website && <a key="w" className="t-gold inline-flex items-center gap-1" href={r.website} target="_blank">{r.website} <ExternalLink size={11} /></a>],
          ["Instagram", r.instagram && <a key="i" className="t-gold" href={igLink(r.instagram)} target="_blank">{igHandle(r.instagram)}</a>], kind === "media" && ["Reach", r.followers],
          ["Contact person", r.contact_person], ["Phone", r.contact_phone], ["Email", r.contact_email], ["Notes", r.notes && <span key="n" className="whitespace-pre-line">{r.notes}</span>]]} />
        <ContactButtons r={r} />
      </div>)} />
  );
}
export default function PartnersTab({ kind }) { return <Suspense><Tab kind={kind} /></Suspense>; }
