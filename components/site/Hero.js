"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, RotateCcw, Martini } from "lucide-react";

const PourScene = dynamic(() => import("./PourScene"), { ssr: false, loading: () => null });

const word = { hidden: { y: "110%" }, show: (i) => ({ y: "0%", transition: { delay: 0.25 + i * 0.12, duration: 1.1, ease: [0.22, 1, 0.36, 1] } }) };

export default function Hero({ brand, settings, talentCount, nextEvent, lineupFaces }) {
  const ref = useRef(null);
  const [replay, setReplay] = useState(0);
  const [phase, setPhase] = useState("ready");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[720px] overflow-hidden grain">
      {/* night-sky backdrop with gold haze */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 50% 30%, #2b2112 0%, #120e0a 40%, #07060A 80%)" }} />
      <motion.div className="absolute left-1/2 top-[38%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]" style={{ background: "radial-gradient(circle, rgba(207,170,92,.35), transparent 65%)", opacity: fade }} />

      {/* huge stacked headline behind the 3D scene */}
      <motion.div style={{ y: textY, opacity: fade }} className="absolute inset-x-0 top-[17vh] md:top-[15vh] flex flex-col items-center pointer-events-none select-none">
        {["Sip Slow.", "Party Loud."].map((w, i) => (
          <div key={w} className="overflow-hidden leading-[0.86]">
            <motion.h1 custom={i} variants={word} initial="hidden" animate="show"
              className="font-display font-extrabold tracking-[-0.05em] text-[17vw] md:text-[11.5vw]"
              style={{ background: i ? "linear-gradient(180deg,#8f877a 0%,#4a443c 100%)" : "linear-gradient(180deg,#f6ecd2 0%,#b59a63 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {w}
            </motion.h1>
          </div>
        ))}
      </motion.div>

      {/* 3D bottle + glass */}
      <motion.div style={{ y: sceneY, scale: sceneScale }} className="absolute inset-0 top-[8vh]">
        <PourScene brand={brand} replay={replay} onPhase={setPhase} />
      </motion.div>

      {/* left column: quote + happy hour */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 1 }}
        className="hidden lg:flex absolute left-[5vw] top-[42vh] w-[250px] flex-col items-center text-center gap-12">
        <div>
          <span className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-white/95 text-[#0b0a08] shadow-[0_10px_40px_-10px_rgba(207,170,92,.6)]"><Martini size={22} /></span>
          <p className="mt-5 text-[15px] leading-relaxed text-[#d9d3c6]">{settings.tagline || "Where dining meets nightlife"} — cocktails, cuisine and experiences at Astrol Square.</p>
          <div className="mt-3 text-[11px] font-bold tracking-[.25em] text-[#CFAA5C]">ARYO NAIROBI</div>
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-[.25em] text-white">HAPPY HOUR</div>
          <p className="mt-1.5 text-[14px] text-[#a7a092]">{(settings.happy_hour || "4PM – 7PM").replace(/^happy hour\s*/i, "")} · selected cocktails</p>
        </div>
      </motion.div>

      {/* right column: stat + line-up */}
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.15, duration: 1 }}
        className="hidden lg:flex absolute right-[5vw] top-[44vh] w-[240px] flex-col items-center text-center">
        <div className="text-[15px] text-[#d9d3c6]">Talent on the roster</div>
        <div className="font-display font-bold text-[44px] leading-none mt-1 gold-text">{talentCount}+</div>
        <div className="my-6 h-24 w-px bg-gradient-to-b from-[#CFAA5C]/70 to-transparent" />
        <Link href="/events" className="group flex items-center">
          <span className="grid place-items-center h-14 w-14 rounded-full bg-[#CFAA5C] text-[#0b0a08] group-hover:scale-110 transition-transform z-10"><Play size={18} fill="currentColor" /></span>
          <span className="flex -space-x-3 -ml-2">
            {lineupFaces.slice(0, 3).map((t) => t.photo_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img key={t.id} src={t.photo_url} alt={t.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-[#07060A]" />
              : <span key={t.id} className="h-12 w-12 rounded-full grid place-items-center bg-[#1c1813] text-[#CFAA5C] text-[12px] font-bold ring-2 ring-[#07060A]">{t.name.replace(/^dj\s*/i, "").slice(0, 2).toUpperCase()}</span>)}
          </span>
        </Link>
        <p className="mt-4 text-[14px] text-[#d9d3c6] leading-snug">{nextEvent ? <>Next up: <b className="text-white">{nextEvent.title}</b></> : "Nairobi's best DJs, hosts & MCs"}</p>
        <Link href="/events" className="mt-2 text-[12px] font-bold tracking-[.18em] underline underline-offset-4 decoration-[#CFAA5C]">SEE LINE-UP</Link>
      </motion.div>

      {/* bottom CTA */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.9 }}
        className="absolute bottom-[5vh] inset-x-0 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 p-2 rounded-full border border-white/10 bg-white/[.03] backdrop-blur">
          <Link href="/book" className="group inline-flex items-center gap-3 h-14 pl-8 pr-6 rounded-full bg-[#F3EEE3] text-[#0b0a08] text-[17px] font-semibold hover:bg-white transition-colors">
            Book a DJ tonight <ArrowRight size={18} className="text-[#C2541B] group-hover:translate-x-1 transition-transform" />
          </Link>
          <button onClick={() => setReplay((r) => r + 1)} disabled={phase === "tilt" || phase === "pour"} title="Pour again"
            className="grid place-items-center h-14 w-14 rounded-full border border-white/15 text-[#E8D39C] hover:bg-white/10 disabled:opacity-40 transition">
            <RotateCcw size={18} />
          </button>
        </div>
        <span className="text-[10px] tracking-[.3em] text-[#6f695e]">{phase === "pour" ? "POURING…" : "SCROLL TO EXPLORE"}</span>
      </motion.div>
    </section>
  );
}
