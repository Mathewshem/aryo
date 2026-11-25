"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const field = "w-full h-12 rounded-xl bg-white/[.04] border border-white/10 px-4 text-[14.5px] text-white placeholder:text-[#6f695e] outline-none focus:border-[#CFAA5C]/70 focus:bg-white/[.06] transition";

export default function BookingForm({ talent = [], preset = null }) {
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ talent_id: preset?.id || "", client_name: "", phone: "", email: "", event_date: "", event_type: "", venue: "", guests: "", budget: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, guests: f.guests ? +f.guests : null }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Something went wrong.");
      setDone(d.ref);
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }

  return (
    <div className="relative rounded-[28px] border border-white/[.08] bg-[#0e0c0b]/90 backdrop-blur p-6 md:p-9">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-14 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}><CheckCircle2 size={56} className="mx-auto text-[#CFAA5C]" /></motion.div>
            <h3 className="mt-5 font-display font-bold text-[30px]">Request received</h3>
            <p className="mt-2 text-[#a7a092]">Your reference is <b className="text-[#E8D39C]">{done}</b>. The ARYO team will call or WhatsApp you to confirm.</p>
            <button onClick={() => { setDone(null); setF({ ...f, message: "" }); }} className="mt-8 text-[13px] font-semibold text-[#E8D39C] underline underline-offset-4">Make another request</button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid sm:grid-cols-2 gap-4">
            <label className="sm:col-span-2"><span className="block mb-2 text-[12px] font-semibold tracking-wide text-[#a7a092]">Who would you like to book?</span>
              <select className={field} value={f.talent_id} onChange={set("talent_id")}>
                <option value="">Not sure yet — recommend someone</option>
                {["dj", "host", "mc", "artist", "designer"].map((c) => {
                  const list = talent.filter((t) => t.category === c);
                  return list.length ? <optgroup key={c} label={{ dj: "DJs", host: "Hosts & Entertainers", mc: "MCs", artist: "Artists", designer: "Designers" }[c]}>{list.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup> : null;
                })}
              </select></label>
            <label><span className="block mb-2 text-[12px] font-semibold text-[#a7a092]">Your name *</span><input className={field} required value={f.client_name} onChange={set("client_name")} placeholder="Full name" /></label>
            <label><span className="block mb-2 text-[12px] font-semibold text-[#a7a092]">Phone / WhatsApp *</span><input className={field} required type="tel" value={f.phone} onChange={set("phone")} placeholder="07XX XXX XXX" /></label>
            <label><span className="block mb-2 text-[12px] font-semibold text-[#a7a092]">Email</span><input className={field} type="email" value={f.email} onChange={set("email")} placeholder="For your confirmation" /></label>
            <label><span className="block mb-2 text-[12px] font-semibold text-[#a7a092]">Event date *</span><input className={`${field} [color-scheme:dark]`} required type="date" min={today} value={f.event_date} onChange={set("event_date")} /></label>
            <label><span className="block mb-2 text-[12px] font-semibold text-[#a7a092]">Type of event</span><input className={field} value={f.event_type} onChange={set("event_type")} placeholder="Birthday, launch, club night…" /></label>
            <label><span className="block mb-2 text-[12px] font-semibold text-[#a7a092]">Venue</span><input className={field} value={f.venue} onChange={set("venue")} placeholder="Where is it?" /></label>
            <label><span className="block mb-2 text-[12px] font-semibold text-[#a7a092]">Guests</span><input className={field} type="number" min="0" value={f.guests} onChange={set("guests")} placeholder="Approx." /></label>
            <label><span className="block mb-2 text-[12px] font-semibold text-[#a7a092]">Budget</span><input className={field} value={f.budget} onChange={set("budget")} placeholder="Optional" /></label>
            <label className="sm:col-span-2"><span className="block mb-2 text-[12px] font-semibold text-[#a7a092]">Anything else?</span><textarea rows={4} className={`${field} h-auto py-3`} value={f.message} onChange={set("message")} placeholder="Timing, music style, special requests…" /></label>
            <input tabIndex={-1} autoComplete="off" className="hidden" value={f.website} onChange={set("website")} aria-hidden />
            {err && <p className="sm:col-span-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-[13px] text-red-300">{err}</p>}
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 pt-2">
              <p className="text-[12px] text-[#6f695e]">We'll only use your details to arrange this booking.</p>
              <button disabled={busy} className="group inline-flex items-center gap-3 h-13 py-3.5 px-8 rounded-full bg-[#E8D39C] text-[#0b0a08] text-[15px] font-semibold hover:bg-[#F3EEE3] disabled:opacity-60 transition">
                {busy ? <Loader2 size={17} className="animate-spin" /> : null} Send request <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
