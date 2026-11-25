"use client";
import { Suspense } from "react";
import { Building2, Crown, MapPin } from "lucide-react";
import ResourcePage, { DetailRows } from "@/components/admin/ResourcePage";
import Avatar from "@/lib/ui/Avatar";
import { contactFields, ContactButtons, contactCell } from "@/components/admin/contacts";
import { igHandle } from "@/components/admin/people";

const fields = [
  { key: "photo_url", label: "Logo / photo", type: "photo", folder: "clubs", size: 84 },
  { type: "section", label: "Club" },
  { key: "name", label: "Club name", required: true, half: true },
  { key: "tagline", label: "Tagline", half: true, placeholder: "e.g. The Mother" },
  { key: "location", label: "Location", half: true },
  { key: "map_url", label: "Google Maps link", half: true },
  { key: "instagram", label: "Instagram", half: true },
  { key: "is_flagship", label: "This is ARYO (flagship)", type: "toggle", half: true },
  ...contactFields,
  { type: "section", label: "Internal" },
  { key: "description", label: "Relationship with ARYO", type: "textarea", rows: 2, placeholder: "Sister club, shares DJs, same owners…" },
  { key: "notes", label: "Notes", type: "textarea", rows: 2 },
  { key: "sort_order", label: "Order in list", type: "number", half: true },
  { key: "active", label: "Active", type: "toggle", half: true },
];

function Page() {
  return (
    <ResourcePage resource="clubs" title="Clubs" singular="Club" icon={<Building2 size={15} />} subtitle="ARYO (the mother) and its partner and sister clubs"
      defaults={{ active: true, is_flagship: false, sort_order: 0 }} fields={fields} searchKeys={["name", "location", "contact_person"]}
      columns={[
        { label: "Club", render: (r) => <div className="flex items-center gap-3"><Avatar src={r.photo_url} name={r.name} size={34} /><div><div className="font-semibold flex items-center gap-1.5">{r.name}{r.is_flagship && <Crown size={12} className="t-gold" />}</div><div className="text-[11px] t-muted">{r.tagline || (r.is_flagship ? "Flagship" : "Partner club")}</div></div></div> },
        { label: "Location", render: (r) => r.location ? <span className="inline-flex items-center gap-1 t-2"><MapPin size={12} />{r.location}</span> : <span className="t-faint">—</span> },
        { label: "Contact", render: contactCell },
        { label: "Type", render: (r) => <span className={`pill ${r.is_flagship ? "pill-gold" : "pill-info"}`}>{r.is_flagship ? "Flagship" : "Partner"}</span> },
      ]}
      renderView={(r) => (<div>
        <div className="flex items-center gap-4 mb-5"><Avatar src={r.photo_url} name={r.name} size={76} ring /><div><div className="text-[18px] font-semibold">{r.name}</div><div className="t-muted">{r.tagline || (r.is_flagship ? "Flagship" : "Partner club")}</div></div></div>
        <DetailRows rows={[["Location", r.location], ["Map", r.map_url && <a key="m" className="t-gold" href={r.map_url} target="_blank">Open map</a>], ["Instagram", r.instagram && igHandle(r.instagram)],
          ["Contact person", r.contact_person], ["Phone", r.contact_phone], ["Email", r.contact_email], ["Relationship", r.description], ["Notes", r.notes]]} />
        <ContactButtons r={r} />
      </div>)} />
  );
}
export default function ClubsPage() { return <Suspense><Page /></Suspense>; }
