"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { api } from "@/lib/ui/api";
import { ThemeSwitch } from "@/lib/ui/theme";

const PourScene = dynamic(() => import("./PourScene"), { ssr: false, loading: () => null });

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login | forgot | reset | change
  const [f, setF] = useState({ email: "", password: "", code: "", newPassword: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    try {
      if (mode === "login") {
        const r = await api("/api/auth/login", { method: "POST", body: { email: f.email, password: f.password } });
        if (r.mustChange) { setMode("change"); setMsg("Welcome! Choose your own password to continue."); }
        else router.replace("/admin");
      } else if (mode === "forgot") {
        await api("/api/auth/forgot", { method: "POST", body: { email: f.email } });
        setMode("reset"); setMsg("If that email has an account, a 6-digit code is on its way.");
      } else {
        if (f.newPassword !== f.confirm) throw new Error("The two passwords don't match.");
        if (mode === "reset") {
          await api("/api/auth/reset", { method: "POST", body: { email: f.email, code: f.code, password: f.newPassword } });
          setMode("login"); setF({ ...f, password: "", code: "", newPassword: "", confirm: "" }); setMsg("Password updated. Sign in with your new password.");
        } else {
          await api("/api/admin/profile", { method: "PATCH", body: { currentPassword: f.password, newPassword: f.newPassword } });
          router.replace("/admin");
        }
      }
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }

  const titles = { login: ["Welcome back", "Sign in to the ARYO dashboard"], forgot: ["Forgot password", "We'll email you a reset code"], reset: ["Reset password", "Enter the code and a new password"], change: ["Set your password", "This replaces your temporary password"] };
  return (
    <div className="erp grid lg:grid-cols-[1.1fr_1fr] min-h-screen">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 min-h-screen text-[#EFEAE0] grain" style={{ background: "radial-gradient(120% 80% at 20% 0%, #2a2112 0%, #0b0a08 55%, #050407 100%)" }}>
        <div className="absolute -right-40 top-1/3 h-[520px] w-[520px] rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle, #CFAA5C, transparent 60%)" }} />
        <div className="relative flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aryo-logo.jpg" alt="ARYO" className="h-12 w-12 rounded-full ring-1 ring-[#CFAA5C]/60" />
          <div><div className="font-display font-bold tracking-[.25em] text-sm">ARYO</div><div className="text-[10px] tracking-[.35em] text-[#CFAA5C]">NAIROBI</div></div>
        </div>
        <div className="absolute inset-x-0 top-[8%] h-[58%] pointer-events-none"><PourScene loop /></div>
        <div className="relative">
        <div className="relative max-w-md">
          <div className="text-[11px] uppercase tracking-[.3em] text-[#CFAA5C]">Management hub</div>
          <h2 className="mt-3 font-display text-[44px] font-bold leading-[1.02] gold-text">Where dining<br />meets nightlife.</h2>
          <p className="mt-5 text-[13px] text-[#a7a092] leading-relaxed">DJ bookings, people, clubs, sponsors and online presence — everything ARYO runs on, in one place.</p>
        </div>
        <div className="relative mt-8 text-[11px] text-[#6f695e]">Astrol Square, Red Hill Rd · Nairobi</div>
        </div>
      </aside>
      <main className="relative flex items-center justify-center p-6">
        <div className="absolute right-5 top-5"><ThemeSwitch /></div>
        <form onSubmit={submit} className="w-full max-w-[360px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aryo-logo.jpg" alt="ARYO" className="lg:hidden h-14 w-14 rounded-full mb-6 ring-1 ring-[var(--gold)]" />
          {mode !== "login" && mode !== "change" && (
            <button type="button" onClick={() => { setMode("login"); setErr(""); setMsg(""); }} className="flex items-center gap-1 text-[12px] t-muted mb-4 hover:text-[var(--text)]"><ArrowLeft size={13} /> Back to sign in</button>
          )}
          <h1 className="text-[22px] font-semibold">{titles[mode][0]}</h1>
          <p className="t-muted mt-1 mb-6">{titles[mode][1]}</p>
          {msg && <div className="mb-4 rounded-md px-3 py-2.5 text-[12px]" style={{ background: "var(--gold-soft)", color: "var(--text-2)", border: "1px solid var(--gold-line)" }}>{msg}</div>}
          {err && <div className="mb-4 rounded-md px-3 py-2.5 text-[12px]" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>{err}</div>}
          <div className="space-y-3.5">
            {mode !== "change" && (
              <label className="block"><span className="label">Email</span>
                <div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 t-faint" />
                  <input className="field pl-9 h-10" type="email" required autoComplete="email" value={f.email} onChange={set("email")} placeholder="you@example.com" disabled={mode === "reset"} /></div>
              </label>
            )}
            {mode === "login" && (
              <label className="block"><span className="label flex justify-between">Password
                <button type="button" className="t-gold font-semibold" onClick={() => { setMode("forgot"); setErr(""); setMsg(""); }}>Forgot?</button></span>
                <div className="relative"><Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 t-faint" />
                  <input className="field pl-9 pr-9 h-10" type={show ? "text" : "password"} required autoComplete="current-password" value={f.password} onChange={set("password")} placeholder="••••••••" />
                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 t-faint" onClick={() => setShow(!show)}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
              </label>
            )}
            {mode === "reset" && (
              <label className="block"><span className="label">6-digit code</span>
                <div className="relative"><KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 t-faint" />
                  <input className="field pl-9 h-10 tracking-[.4em] font-semibold" inputMode="numeric" maxLength={6} required value={f.code} onChange={set("code")} placeholder="000000" /></div>
              </label>
            )}
            {(mode === "reset" || mode === "change") && (<>
              <label className="block"><span className="label">New password</span>
                <input className="field h-10" type="password" required minLength={8} autoComplete="new-password" value={f.newPassword} onChange={set("newPassword")} placeholder="At least 8 characters, letters + numbers" /></label>
              <label className="block"><span className="label">Confirm new password</span>
                <input className="field h-10" type="password" required autoComplete="new-password" value={f.confirm} onChange={set("confirm")} /></label>
            </>)}
          </div>
          <button className="btn btn-primary w-full justify-center h-10 mt-6" disabled={busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : null}
            {{ login: "Sign in", forgot: "Send reset code", reset: "Update password", change: "Save & continue" }[mode]} {!busy && <ArrowRight size={14} />}
          </button>
          <p className="mt-8 text-center text-[11px] t-faint">ARYO Nairobi · Staff access only</p>
        </form>
      </main>
    </div>
  );
}
