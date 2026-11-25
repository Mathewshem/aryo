"use client";
import { useEffect, useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { api } from "@/lib/ui/api";
import { PageHead } from "@/components/admin/ResourcePage";
import { fmtDateTime } from "@/components/admin/fmt";

export default function ActivityPage() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  useEffect(() => { api("/api/admin/audit").then((d) => setRows(d.rows)).catch(() => setRows([])); }, []);
  const list = useMemo(() => (rows || []).filter((r) => !q || `${r.actor_name} ${r.action} ${r.entity} ${r.detail}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  return (
    <div>
      <PageHead title="Activity log" subtitle="Who changed what, newest first (last 500 actions)" />
      <div className="card">
        <div className="p-3 border-b b-line"><div className="relative w-full sm:w-72"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 t-faint" /><input className="field pl-8 h-8" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Section</th><th>Detail</th></tr></thead>
          <tbody>
            {!rows && [...Array(8)].map((_, i) => <tr key={i}><td colSpan={5}><div className="skeleton h-4" /></td></tr>)}
            {list.map((r) => <tr key={r.id}><td className="whitespace-nowrap t-muted">{fmtDateTime(r.created_at)}</td><td className="font-medium">{r.actor_name}</td><td>{r.action}</td><td><span className="pill pill-mute">{r.entity}</span></td><td className="t-2">{r.detail}</td></tr>)}
          </tbody>
        </table>
        {rows && !list.length && <div className="py-12 text-center t-muted"><History size={26} className="mx-auto mb-2 t-faint" />No activity yet.</div>}</div>
      </div>
    </div>
  );
}
