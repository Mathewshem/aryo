"use client";
import { Suspense } from "react";
import { Handshake, Wine } from "lucide-react";
import ResourcePage, { DetailRows } from "@/components/admin/ResourcePage";

const Logo = ({ r, size = 34 }) => (
  <div className="rounded-md border b-line bg-white grid place-items-center overflow-hidden shrink-0" style={{ width: size * 1.6, height: size }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {r.logo_url ? <img src={r.logo_url} alt={r.name} className="max-h-full max-w-full object-contain p-1" /> : <span className="text-[10px] font-bold text-[#8a7a55]">{r.name.slice(0, 3).toUpperCase()}</span>}
  </div>
);

const fields = [
  { key: "logo_url", label: "Official logo", type: "photo", folder: "partners", shape: "square", size: 88, help: "Upload the official logo the brand supplied (PNG with transparent background or SVG works best)." },
  { key: "name", label: "Name", required: true, half: true },
  { key: "kind", label: "Type", type: "select", required: true, half: true, options: [{ value: "sponsor", label: "Sponsor" }, { value: "media", label: "Online presence / media" }] },
  { key: "website", label: "Website", half: true },
  { key: "instagram", label: "Instagram", half: true },
  { key: "sort_order", label: "Display order", type: "number", half: true },
  { key: "active", label: "Show on website", type: "toggle", half: true },
  { key: "hero_brand", label: "Use on the 3D bottle (homepage)", type: "toggle", hidden: (f) => f.kind !== "sponsor" },
];

function Page() {
  return (
    <ResourcePage resource="partners" title="Sponsors & Media" singular="Partner" icon={<Handshake size={15} />} subtitle="Brands that sponsor ARYO and where ARYO is featured online"
      tabs={[{ value: "sponsor", label: "Sponsors" }, { value: "media", label: "Online presence" }]} tabKey="kind"
      defaults={{ kind: "sponsor", active: true, hero_brand: false, sort_order: 0 }} fields={fields}
      columns={[
        { label: "Brand", render: (r) => <div className="flex items-center gap-3"><Logo r={r} /><div className="font-semibold">{r.name}</div></div> },
        { label: "Type", render: (r) => <span className={`pill ${r.kind === "sponsor" ? "pill-gold" : "pill-info"}`}>{r.kind === "sponsor" ? "Sponsor" : "Media"}</span> },
        { label: "3D bottle", render: (r) => r.hero_brand ? <span className="pill pill-gold">On bottle</span> : <span className="t-faint">—</span> },
        { label: "Logo", render: (r) => r.logo_url ? <span className="pill pill-ok">Uploaded</span> : <span className="pill pill-mute">Missing</span> },
        { label: "Website", render: (r) => <span className={`pill ${r.active ? "pill-ok" : "pill-mute"}`}>{r.active ? "Visible" : "Hidden"}</span> },
      ]}
      extraActions={(r, { patch }) => r.kind === "sponsor" ? [{ label: r.hero_brand ? "Remove from 3D bottle" : "Put on 3D bottle", icon: Wine, onClick: () => patch(r, { hero_brand: !r.hero_brand }) }] : []}
      renderView={(r) => (<div>
        <div className="flex items-center gap-4 mb-5"><Logo r={r} size={60} /><div><div className="text-[18px] font-semibold">{r.name}</div><div className="t-muted capitalize">{r.kind}</div></div></div>
        <DetailRows rows={[["Website", r.website], ["Instagram", r.instagram], ["3D bottle", r.hero_brand ? "Yes — this brand's logo is on the homepage bottle" : "No"]]} />
      </div>)} />
  );
}
export default function PartnersPage() { return <Suspense><Page /></Suspense>; }
