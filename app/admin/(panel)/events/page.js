"use client";
import { Suspense } from "react";
import { PartyPopper, Eye, EyeOff } from "lucide-react";
import ResourcePage, { DetailRows } from "@/components/admin/ResourcePage";
import Avatar from "@/lib/ui/Avatar";
import { useOptions } from "@/components/admin/useOptions";
import { fmtDate } from "@/components/admin/fmt";
import { catLabel } from "@/lib/constants";

function Page() {
  const clubs = useOptions("clubs");
  const talent = useOptions("talent");
  const tById = Object.fromEntries(talent.map((t) => [t.id, t]));
  const today = new Date().toISOString().slice(0, 10);
  const fields = [
    { key: "poster_url", label: "Poster / flyer", type: "photo", folder: "events", shape: "square", size: 110 },
    { key: "title", label: "Event name", required: true, placeholder: "e.g. Pent R'n'B Tuesday" },
    { key: "event_date", label: "Date", type: "date", required: true, half: true },
    { key: "start_time", label: "Time", half: true, placeholder: "e.g. 4:00 PM" },
    { key: "club_id", label: "Club", type: "select", half: true, options: clubs.map((c) => ({ value: c.id, label: c.name })) },
    { key: "music_policy", label: "Music policy", half: true, placeholder: "e.g. Feisal 254" },
    { key: "lineup", label: "Line-up (tap to select)", type: "multi", options: talent.filter((t) => t.active && t.category !== "designer").map((t) => ({ value: t.id, label: t.name })) },
    { key: "description", label: "Description", type: "textarea", rows: 3 },
    { key: "published", label: "Published on website", type: "toggle" },
  ];
  return (
    <ResourcePage resource="events" title="Events" singular="Event" icon={<PartyPopper size={15} />} subtitle="Theme nights, parties and line-ups shown on the website"
      defaults={{ published: true, lineup: [], club_id: clubs.find((c) => c.is_flagship)?.id || "" }} fields={fields} searchKeys={["title", "music_policy"]}
      columns={[
        { label: "Event", render: (r) => (<div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded overflow-hidden bg-surface-3 shrink-0">{/* eslint-disable-next-line @next/next/no-img-element */}{r.poster_url && <img src={r.poster_url} alt="" className="h-full w-full object-cover" />}</div>
          <div><div className="font-semibold">{r.title}</div><div className="text-[11px] t-muted">{r.music_policy ? `Music: ${r.music_policy}` : clubs.find((c) => c.id === r.club_id)?.name}</div></div></div>) },
        { label: "Date", render: (r) => <div><div className="font-medium">{fmtDate(r.event_date)}</div><div className="text-[11px] t-muted">{r.start_time}</div></div> },
        { label: "Line-up", render: (r) => <div className="flex -space-x-2">{(r.lineup || []).slice(0, 5).map((id) => tById[id] && <span key={id} title={tById[id].name}><Avatar src={tById[id].photo_url} name={tById[id].name} size={26} ring /></span>)}{!(r.lineup || []).length && <span className="t-faint">—</span>}</div> },
        { label: "Status", render: (r) => !r.published ? <span className="pill pill-mute">Draft</span> : r.event_date < today ? <span className="pill pill-info">Past</span> : <span className="pill pill-ok">Upcoming</span> },
      ]}
      extraActions={(r, { patch }) => [{ label: r.published ? "Unpublish" : "Publish", icon: r.published ? EyeOff : Eye, onClick: () => patch(r, { published: !r.published }) }]}
      renderView={(r) => (<div className="grid sm:grid-cols-[180px_1fr] gap-5">
        <div className="rounded-md overflow-hidden bg-surface-3 aspect-[4/5]">{/* eslint-disable-next-line @next/next/no-img-element */}{r.poster_url && <img src={r.poster_url} alt="" className="h-full w-full object-cover" />}</div>
        <div>
          {r.description && <p className="t-2 mb-3">{r.description}</p>}
          <DetailRows rows={[["Date", `${fmtDate(r.event_date)} ${r.start_time || ""}`], ["Club", clubs.find((c) => c.id === r.club_id)?.name], ["Music policy", r.music_policy], ["Published", r.published ? "Yes" : "No"]]} />
          <div className="label mt-4">Line-up</div>
          <div className="flex flex-col gap-2">{(r.lineup || []).map((id) => tById[id] && <div key={id} className="flex items-center gap-2.5"><Avatar src={tById[id].photo_url} name={tById[id].name} size={28} /><span className="font-medium">{tById[id].name}</span><span className="t-muted text-[11px]">{catLabel(tById[id].category)}</span></div>)}</div>
        </div>
      </div>)} />
  );
}
export default function EventsPage() { return <Suspense><Page /></Suspense>; }
