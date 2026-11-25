"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck2, Disc3, PartyPopper, Building2, Handshake, UsersRound, Settings, History,
  Search, Bell, ChevronDown, LogOut, UserRound, Globe, Menu, X, ArrowUpRight, Loader2,
} from "lucide-react";
import { ThemeSwitch } from "@/lib/ui/theme";
import Avatar from "@/lib/ui/Avatar";
import { api } from "@/lib/ui/api";
import { MeContext } from "./MeContext";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck2, badge: true },
  { href: "/admin/talent", label: "Talent", icon: Disc3 },
  { href: "/admin/events", label: "Events", icon: PartyPopper },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/partners", label: "Sponsors & Media", icon: Handshake },
  { href: "/admin/staff", label: "Staff", icon: UsersRound },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/activity", label: "Activity log", icon: History, admin: true },
];

export default function Shell({ me: initialMe, children }) {
  const [me, setMe] = useState(initialMe);
  const path = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [pending, setPending] = useState([]);
  useEffect(() => setDrawer(false), [path]);
  useEffect(() => {
    const load = () => api("/api/admin/r/bookings").then((d) => setPending(d.rows.filter((b) => b.status === "pending"))).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    window.addEventListener("aryo-bookings", load);
    return () => { clearInterval(t); window.removeEventListener("aryo-bookings", load); };
  }, []);

  const isActive = (href) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-2 pt-1 pb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aryo-logo.jpg" alt="ARYO" className="h-10 w-10 rounded-full" style={{ boxShadow: "0 0 0 1.5px var(--gold)" }} />
        <div className="leading-tight">
          <div className="text-[14px] font-bold tracking-[.18em]">ARYO</div>
          <div className="text-[10.5px] t-muted">Management Hub</div>
        </div>
      </Link>
      <nav className="flex flex-col gap-0.5">
        {NAV.filter((n) => !n.admin || me.role === "admin").map((n) => (
          <Link key={n.href} href={n.href} className={`nav-item ${isActive(n.href) ? "active" : ""}`}>
            <n.icon size={16} strokeWidth={1.8} /> <span className="flex-1">{n.label}</span>
            {n.badge && pending.length > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center text-[10px] font-bold" style={{ background: "var(--gold)", color: "#0b0a08" }}>{pending.length}</span>}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-6 space-y-3">
        <div className="rounded-lg p-4 relative overflow-hidden" style={{ background: "linear-gradient(150deg, #1b160d, #0b0a08)", color: "#EFEAE0" }}>
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-40" style={{ background: "#CFAA5C" }} />
          <div className="relative text-[13px] font-semibold text-[#E8D39C]">Live website</div>
          <p className="relative mt-1 text-[11px] text-[#a7a092] leading-relaxed">Changes you publish here show on the public site instantly.</p>
          <a href="/" target="_blank" className="relative mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11.5px] font-semibold" style={{ background: "#CFAA5C", color: "#0b0a08" }}>Open website <ArrowUpRight size={13} /></a>
        </div>
        <Link href="/admin/profile" className="flex items-center gap-2.5 rounded-lg border b-line p-2.5 hover:bg-[var(--surface-2)]">
          <Avatar src={me.avatar_url} name={me.name} size={34} />
          <div className="min-w-0 flex-1"><div className="font-semibold truncate">{me.name}</div><div className="text-[11px] t-muted capitalize">{me.title || me.role}</div></div>
          <ChevronDown size={14} className="t-faint -rotate-90" />
        </Link>
      </div>
    </div>
  );

  return (
    <MeContext.Provider value={{ me, setMe, pending }}>
      <div className="erp">
        <aside className="hidden lg:block fixed inset-y-0 left-0 w-[236px] border-r b-line bg-surface p-4 overflow-y-auto">{sidebar}</aside>
        {drawer && (
          <div className="lg:hidden fixed inset-0 z-[70]" style={{ background: "var(--overlay)" }} onClick={() => setDrawer(false)}>
            <aside className="absolute inset-y-0 left-0 w-[260px] bg-surface p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button className="icon-btn absolute right-3 top-3" onClick={() => setDrawer(false)}><X size={16} /></button>{sidebar}
            </aside>
          </div>
        )}
        <div className="lg:pl-[236px]">
          <header className="sticky top-0 z-40 flex items-center gap-3 h-[60px] px-4 sm:px-6 border-b b-line" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)", backdropFilter: "blur(10px)" }}>
            <button className="icon-btn lg:hidden" onClick={() => setDrawer(true)}><Menu size={18} /></button>
            <GlobalSearch />
            <div className="ml-auto flex items-center gap-2">
              <ThemeSwitch />
              <Notifications pending={pending} />
              <ProfileMenu me={me} router={router} />
            </div>
          </header>
          <main className="p-4 sm:p-6 max-w-[1500px]">{children}</main>
        </div>
      </div>
    </MeContext.Provider>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  const router = useRouter();
  useEffect(() => {
    const k = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); input.current?.focus(); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return; }
    setBusy(true);
    const t = setTimeout(() => api(`/api/admin/search?q=${encodeURIComponent(q)}`).then((d) => setRes(d.results)).catch(() => setRes([])).finally(() => setBusy(false)), 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div className="relative w-full max-w-[420px]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 t-faint" />
      <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => setTimeout(() => setRes(null), 150)}
        placeholder="Search talent, bookings, events…" className="field pl-9 pr-12 h-9 bg-surface" />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold t-faint border b-line rounded px-1.5 py-0.5 hidden sm:block">⌘K</span>
      {res && (
        <div className="card absolute left-0 right-0 top-11 p-1 max-h-[360px] overflow-y-auto z-50">
          {busy && <div className="p-3 t-muted flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Searching…</div>}
          {!busy && !res.length && <div className="p-3 t-muted">No matches for “{q}”.</div>}
          {res.map((r) => (
            <button key={r.type + r.id} onMouseDown={() => { router.push(r.href); setQ(""); }} className="w-full flex items-center gap-3 rounded px-2.5 py-2 text-left hover:bg-[var(--surface-2)]">
              {r.type === "Talent" ? <Avatar src={r.photo} name={r.title} size={26} /> : <span className="h-[26px] w-[26px] rounded-full grid place-items-center bg-gold-soft t-gold">{r.type === "Booking" ? <CalendarCheck2 size={13} /> : <PartyPopper size={13} />}</span>}
              <div className="min-w-0 flex-1"><div className="font-medium truncate">{r.title}</div><div className="text-[11px] t-muted capitalize">{r.type} · {r.sub}</div></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Notifications({ pending }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button className="icon-btn relative h-9 w-9 border b-line bg-surface" onClick={() => setOpen(!open)} aria-label="Notifications">
        <Bell size={16} />
        {pending.length > 0 && <span className="absolute -right-1 -top-1 min-w-[16px] h-4 px-1 rounded-full text-[9.5px] font-bold grid place-items-center text-white" style={{ background: "var(--bad)" }}>{pending.length}</span>}
      </button>
      {open && (<>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div className="card absolute right-0 top-11 w-[320px] z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b b-line"><span className="font-semibold">Pending requests</span><span className="pill pill-warn">{pending.length}</span></div>
          <div className="max-h-[320px] overflow-y-auto p-1">
            {!pending.length && <div className="p-4 t-muted">You're all caught up.</div>}
            {pending.slice(0, 8).map((b) => (
              <Link key={b.id} href={`/admin/bookings?open=${b.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded px-3 py-2.5 hover:bg-[var(--surface-2)]">
                <Avatar src={b.talent?.photo_url} name={b.talent?.name || b.client_name} size={30} />
                <div className="min-w-0"><div className="font-medium truncate">{b.client_name} → {b.talent?.name || "Any talent"}</div><div className="text-[11px] t-muted">{b.ref} · {b.event_date}</div></div>
              </Link>
            ))}
          </div>
          <Link href="/admin/bookings" onClick={() => setOpen(false)} className="block text-center py-2.5 border-t b-line t-gold font-semibold">View all bookings</Link>
        </div>
      </>)}
    </div>
  );
}

function ProfileMenu({ me, router }) {
  const [open, setOpen] = useState(false);
  const out = async () => { await api("/api/auth/logout", { method: "POST" }); router.replace("/admin/login"); };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full pl-1 pr-2 h-9 border b-line bg-surface hover:bg-[var(--surface-2)]">
        <span className="relative"><Avatar src={me.avatar_url} name={me.name} size={28} /><span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2" style={{ background: "var(--ok)", borderColor: "var(--surface)" }} /></span>
        <span className="hidden md:block font-semibold max-w-[120px] truncate">{me.name.split(" ")[0]}</span>
        <ChevronDown size={13} className="t-faint" />
      </button>
      {open && (<>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div className="card absolute right-0 top-11 w-[240px] z-50 p-1">
          <div className="flex items-center gap-3 px-3 py-3 border-b b-line mb-1">
            <Avatar src={me.avatar_url} name={me.name} size={38} ring />
            <div className="min-w-0"><div className="font-semibold truncate">{me.name}</div><div className="text-[11px] t-muted truncate">{me.email}</div>
              <span className="pill pill-gold mt-1">{me.role}</span></div>
          </div>
          {[[UserRound, "My profile", () => router.push("/admin/profile")], [Globe, "View website", () => window.open("/", "_blank")], [LogOut, "Sign out", out]].map(([I, l, fn]) => (
            <button key={l} onClick={() => { setOpen(false); fn(); }} className="w-full flex items-center gap-2.5 h-9 px-3 rounded text-left font-medium t-2 hover:bg-[var(--surface-2)]" style={l === "Sign out" ? { color: "var(--bad)" } : undefined}><I size={15} /> {l}</button>
          ))}
        </div>
      </>)}
    </div>
  );
}
