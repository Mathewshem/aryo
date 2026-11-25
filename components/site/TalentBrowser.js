"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { TalentCard } from "./bits";
import { CATEGORIES } from "@/lib/constants";

export default function TalentBrowser({ talent }) {
  const params = useSearchParams();
  const router = useRouter();
  const cat = params.get("c") || "all";
  const [q, setQ] = useState("");
  const list = useMemo(() => talent.filter((t) => (cat === "all" || t.category === cat) && (!q || `${t.name} ${t.genres || ""}`.toLowerCase().includes(q.toLowerCase()))), [talent, cat, q]);
  const tabs = [{ id: "all", label: "Everyone" }, ...CATEGORIES];
  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-28">
      <div className="sticky top-[76px] z-30 -mx-5 md:-mx-10 px-5 md:px-10 py-4 bg-[#07060A]/80 backdrop-blur-xl flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => router.replace(t.id === "all" ? "/talent" : `/talent?c=${t.id}`, { scroll: false })}
              className="relative h-10 px-5 rounded-full text-[13px] font-semibold transition-colors" style={{ color: cat === t.id ? "#0b0a08" : "#cbc6bc" }}>
              {cat === t.id && <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-[#E8D39C]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">{t.label} <span className="opacity-50">{t.id === "all" ? talent.length : talent.filter((x) => x.category === t.id).length}</span></span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-72">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f695e]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or genre" className="w-full h-11 rounded-full bg-white/[.05] border border-white/10 pl-11 pr-4 text-[14px] outline-none focus:border-[#CFAA5C]/60" />
        </div>
      </div>
      <motion.div layout className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        <AnimatePresence mode="popLayout">
          {list.map((t, i) => <motion.div key={t.id} layout exit={{ opacity: 0, scale: 0.9 }}><TalentCard t={t} i={i} /></motion.div>)}
        </AnimatePresence>
      </motion.div>
      {!list.length && <p className="py-20 text-center text-[#8f897d]">No one matches that search.</p>}
    </section>
  );
}
