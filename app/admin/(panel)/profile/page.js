"use client";
import { useState } from "react";
import { Loader2, Save, KeyRound, ShieldCheck, Mail, Phone, Briefcase, CalendarClock } from "lucide-react";
import { api } from "@/lib/ui/api";
import { toast } from "@/lib/ui/dialogs";
import PhotoPicker from "@/lib/ui/PhotoPicker";
import { PageHead } from "@/components/admin/ResourcePage";
import { useMe } from "@/components/admin/MeContext";
import { fmtDateTime } from "@/components/admin/fmt";

export default function ProfilePage() {
  const { me, setMe } = useMe();
  const [f, setF] = useState({ name: me.name, phone: me.phone || "", title: me.title || "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState("");
  const saveProfile = async (patch) => {
    setBusy("profile");
    try { const d = await api("/api/admin/profile", { method: "PATCH", body: patch }); setMe({ ...me, ...d.me }); toast("Profile updated"); } catch (e) { toast(e.message, "bad"); } finally { setBusy(""); }
  };
  const savePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast("New passwords don't match", "bad");
    setBusy("pw");
    try { await api("/api/admin/profile", { method: "PATCH", body: pw }); toast("Password changed"); setPw({ currentPassword: "", newPassword: "", confirm: "" }); } catch (e2) { toast(e2.message, "bad"); } finally { setBusy(""); }
  };
  return (
    <div className="max-w-5xl">
      <PageHead title="My profile" subtitle="Your photo and details appear on bookings you handle and in the activity log" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        <div className="card p-5 h-fit">
          <div className="relative -m-5 mb-0 h-20 rounded-t-lg" style={{ background: "linear-gradient(120deg, #1b160d, #3a2d16 60%, #CFAA5C)" }} />
          <div className="-mt-10 flex flex-col items-center text-center">
            <PhotoPicker value={me.avatar_url} name={me.name} folder="staff" size={96} onChange={(url) => saveProfile({ avatar_url: url })} />
          </div>
          <div className="text-center mt-4"><div className="text-[16px] font-semibold">{me.name}</div><div className="t-muted">{me.title || "No title"}</div><span className="pill pill-gold mt-2">{me.role}</span></div>
          <div className="mt-5 space-y-2.5 border-t b-line pt-4">
            {[[Mail, me.email], [Phone, me.phone || "No phone"], [Briefcase, me.title || "—"], [CalendarClock, `Last sign-in ${me.last_login ? fmtDateTime(me.last_login) : "—"}`]].map(([I, v], i) => (
              <div key={i} className="flex items-center gap-2.5 t-2"><I size={14} className="t-faint shrink-0" /><span className="truncate">{v}</span></div>))}
          </div>
        </div>
        <div className="space-y-5">
          <form className="card" onSubmit={(e) => { e.preventDefault(); saveProfile(f); }}>
            <div className="px-5 py-3.5 border-b b-line font-semibold">Personal details</div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <label><span className="label">Full name</span><input className="field" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
              <label><span className="label">Email</span><input className="field" value={me.email} disabled /></label>
              <label><span className="label">Phone</span><input className="field" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
              <label><span className="label">Job title</span><input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
            </div>
            <div className="flex justify-end px-5 py-3 border-t b-line bg-surface-2" style={{ borderRadius: "0 0 8px 8px" }}>
              <button className="btn btn-gold" disabled={busy === "profile"}>{busy === "profile" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save details</button></div>
          </form>
          <form className="card" onSubmit={savePw}>
            <div className="px-5 py-3.5 border-b b-line font-semibold flex items-center gap-2"><ShieldCheck size={15} className="t-gold" /> Password & security</div>
            <div className="p-5 grid sm:grid-cols-3 gap-4">
              {[["currentPassword", "Current password"], ["newPassword", "New password"], ["confirm", "Confirm new"]].map(([k, l]) => (
                <label key={k}><span className="label">{l}</span><input type="password" required className="field" value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} /></label>))}
              <p className="sm:col-span-3 text-[11px] t-faint">At least 8 characters, with letters and numbers. You'll be signed out automatically after 12 hours.</p>
            </div>
            <div className="flex justify-end px-5 py-3 border-t b-line bg-surface-2" style={{ borderRadius: "0 0 8px 8px" }}>
              <button className="btn btn-primary" disabled={busy === "pw"}>{busy === "pw" ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />} Change password</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
