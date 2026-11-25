"use client";
import { Suspense } from "react";
import { Disc3, Star, Instagram, Phone } from "lucide-react";
import ResourcePage, { DetailRows } from "@/components/admin/ResourcePage";
import Avatar from "@/lib/ui/Avatar";
import { CATEGORIES, catLabel } from "@/lib/constants";

const fields = [
  { key: "photo_url", label: "Profile picture", type: "photo", folder: "talent", size: 92 },
  { key: "name", label: "Stage name", required: true, half: true, placeholder: "e.g. DJ AceKing" },
  { key: "category", label: "Category", type: "select", required: true, half: true, options: CATEGORIES.map((c) => ({ value: c.id, label: c.one })) },
  { key: "headline", label: "Headline", placeholder: "e.g. Afrobeats & Amapiano selector", half: true },
  { key: "genres", label: "Genres / speciality", placeholder: "Afrobeats, Amapiano, R'n'B", half: true },
  { key: "bio", label: "Bio", type: "textarea" },
  { key: "instagram", label: "Instagram handle or link", half: true, placeholder: "@handle" },
  { key: "phone", label: "Phone (private, admin only)", half: true, placeholder: "07…" },
  { key: "slug", label: "Web link", half: true, help: "Leave blank to create it from the name", placeholder: "dj-aceking" },
  { key: "sort_order", label: "Display order", type: "number", half: true },
  { key: "featured", label: "Feature on homepage", type: "toggle", half: true },
  { key: "active", label: "Show on website", type: "toggle", half: true },
];

function Page() {
  return (
    <ResourcePage resource="talent" title="Talent" singular="Talent" icon={<Disc3 size={15} />}
      subtitle="DJs, hosts & entertainers, MCs, artists and designers shown on the website"
      tabs={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} tabKey="category" searchKeys={["name", "genres", "headline"]}
      defaults={{ category: "dj", active: true, featured: false, sort_order: 0 }} fields={fields}
      columns={[
        { label: "Name", render: (r) => (
          <div className="flex items-center gap-3"><Avatar src={r.photo_url} name={r.name} size={34} />
            <div className="min-w-0"><div className="font-semibold flex items-center gap-1.5">{r.name}{r.featured && <Star size={12} fill="var(--gold)" stroke="var(--gold)" />}</div>
              <div className="text-[11px] t-muted truncate max-w-[260px]">{r.headline || r.genres || "No headline yet"}</div></div></div>) },
        { label: "Category", render: (r) => <span className="pill pill-gold">{catLabel(r.category)}</span> },
        { label: "Instagram", render: (r) => r.instagram ? <span className="t-2">{r.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}</span> : <span className="t-faint">—</span> },
        { label: "Photo", render: (r) => r.photo_url ? <span className="pill pill-ok">Uploaded</span> : <span className="pill pill-mute">Missing</span> },
        { label: "Website", render: (r) => r.active ? <span className="pill pill-ok">Visible</span> : <span className="pill pill-mute">Hidden</span> },
      ]}
      extraActions={(r, { patch }) => [
        { label: r.featured ? "Unfeature" : "Feature on homepage", icon: Star, onClick: () => patch(r, { featured: !r.featured }) },
        { label: r.active ? "Hide from website" : "Show on website", icon: Disc3, onClick: () => patch(r, { active: !r.active }) },
      ]}
      renderView={(r) => (
        <div>
          <div className="flex items-center gap-4 mb-5">
            <Avatar src={r.photo_url} name={r.name} size={84} ring />
            <div><div className="text-[18px] font-semibold">{r.name}</div><div className="t-muted">{r.headline || catLabel(r.category)}</div>
              <div className="flex gap-1.5 mt-2"><span className="pill pill-gold">{catLabel(r.category)}</span>{r.featured && <span className="pill pill-info">Featured</span>}
                <span className={`pill ${r.active ? "pill-ok" : "pill-mute"}`}>{r.active ? "Visible" : "Hidden"}</span></div></div>
          </div>
          {r.bio && <p className="t-2 mb-4 whitespace-pre-line leading-relaxed">{r.bio}</p>}
          <DetailRows rows={[["Genres", r.genres], ["Instagram", r.instagram && <span className="inline-flex items-center gap-1"><Instagram size={12} />{r.instagram}</span>],
            ["Phone", r.phone && <span className="inline-flex items-center gap-1"><Phone size={12} />{r.phone}</span>], ["Public page", <a key="l" className="t-gold" href={`/talent/${r.slug}`} target="_blank">/talent/{r.slug}</a>]]} />
        </div>
      )} />
  );
}
export default function TalentPage() { return <Suspense><Page /></Suspense>; }
