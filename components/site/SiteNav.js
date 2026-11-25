"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

const LINKS = [["/", "Home"], ["/talent", "Talent"], ["/events", "Events"], ["/clubs", "Clubs"]];

export default function SiteNav() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => setOpen(false), [path]);
  return (
    <>
      <motion.header initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{ background: scrolled ? "rgba(7,6,10,.72)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(207,170,92,.12)" : "1px solid transparent" }}>
        <div className="mx-auto max-w-[1400px] flex items-center h-[76px] px-5 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aryo-logo.jpg" alt="ARYO Nairobi" className="h-10 w-10 rounded-full ring-1 ring-[#CFAA5C]/50" />
            <span className="leading-none"><span className="block font-display font-bold tracking-[.32em] text-[15px]">ARYO</span><span className="block text-[9px] tracking-[.5em] text-[#CFAA5C] mt-1">NAIROBI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 mx-auto">
            {LINKS.map(([h, l]) => {
              const on = h === "/" ? path === "/" : path.startsWith(h);
              return <Link key={h} href={h} className="relative px-4 py-2 text-[14px] transition-colors" style={{ color: on ? "#F3EEE3" : "#a7a092" }}>
                {l}{on && <motion.span layoutId="nav-dot" className="absolute left-1/2 -bottom-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-[#CFAA5C]" />}
              </Link>;
            })}
          </nav>
          <Link href="/book" className="hidden md:inline-flex group items-center gap-2 h-11 pl-5 pr-2 rounded-full bg-[#F3EEE3] text-[#0b0a08] text-[13.5px] font-semibold hover:bg-white transition-colors">
            Book now <span className="grid place-items-center h-7 w-7 rounded-full bg-[#0b0a08] text-[#CFAA5C] group-hover:translate-x-0.5 transition-transform"><ArrowRight size={14} /></span>
          </Link>
          <button className="md:hidden ml-auto h-10 w-10 grid place-items-center rounded-full border border-white/15" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={18} /></button>
        </div>
      </motion.header>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-[#07060A]/95 backdrop-blur-xl flex flex-col p-6">
            <button className="self-end h-10 w-10 grid place-items-center rounded-full border border-white/15" onClick={() => setOpen(false)}><X size={18} /></button>
            <div className="mt-10 flex flex-col gap-2">
              {[...LINKS, ["/book", "Book now"]].map(([h, l], i) => (
                <motion.div key={h} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                  <Link href={h} className="block font-display font-bold text-5xl py-2 gold-text">{l}</Link>
                </motion.div>))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
