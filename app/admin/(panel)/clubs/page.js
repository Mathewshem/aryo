"use client";
import { Suspense } from "react";
import { Building2, Crown, MapPin } from "lucide-react";
import ResourcePage, { DetailRows } from "@/components/admin/ResourcePage";
import Avatar from "@/lib/ui/Avatar";

const fields = [
  { key: "photo_url", label: "Club logo / photo", type: "photo", folder: "clubs", size: 88 },
  { key: "name", label: "Club name", required: true, half: true },
  { key: "tagline", label: "Tagline", half: true, placeholder: "e.g. The Mother" },
  { key: "description", label: "Description", type: "textarea", rows: 3 },
  { key: "location", label: "Location", half: true },
  { key: "map_url", label: "Google Maps link", half: true },
  { key: "instagram", label: "Instagram", half: true },
  { key: "sort_order", label: "Display order", type: "number", half: true },
  { key: "is_flagship", label: "Flagship (ARYO)", type: "toggle", half: true },
  { key: "active", label: "Show on website", type: "toggle", half: true },
];

function Page() {
  return (
    <ResourcePage resource="clubs" title="Clubs" singular="Club" icon={<Building2 size={15} />} subtitle="ARYO (the mother) and partner/sister clubs"
      defaults={{ active: true, is_flagship: false, sort_order: 0 }} fields={fields} searchKeys={["name", "location", "tagline"]}
      columns={[
        { label: "Club", render: (r) => <div className="flex items-center gap-3"><Avatar src={r.photo_url} name={r.name} size={34} /><div><div className="font-semibold flex items-center gap-1.5">{r.name}{r.is_flagship && <Crown size={12} className="t-gold" />}</div><div className="text-[11px] t-muted">{r.tagline || (r.is_flagship ? "Flagship" : "Partner club")}</div></div></div> },
        { label: "Location", render: (r) => r.location ? <span className="inline-flex items-center gap-1 t-2"><MapPin size={12} />{r.location}</span> : <span className="t-faint">—</span> },
        { label: "Type", render: (r) => <span className={`pill ${r.is_flagship ? "pill-gold" : "pill-info"}`}>{r.is_flagship ? "Flagship" : "Partner"}</span> },
        { label: "Website", render: (r) => <span className={`pill ${r.active ? "pill-ok" : "pill-mute"}`}>{r.active ? "Visible" : "Hidden"}</span> },
      ]}
      renderView={(r) => (<div>
        <div className="flex items-center gap-4 mb-5"><Avatar src={r.photo_url} name={r.name} size={76} ring /><div><div className="text-[18px] font-semibold">{r.name}</div><div className="t-muted">{r.tagline}</div></div></div>
        {r.description && <p className="t-2 mb-4">{r.description}</p>}
        <DetailRows rows={[["Location", r.location], ["Map", r.map_url && <a className="t-gold" href={r.map_url} target="_blank">Open map</a>], ["Instagram", r.instagram], ["Type", r.is_flagship ? "Flagship" : "Partner club"]]} />
      </div>)} />
  );
}
export default function ClubsPage() { return <Suspense><Page /></Suspense>; }
