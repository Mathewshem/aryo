"use client";
import { motion } from "framer-motion";

export default function PageHero({ eyebrow, title, accent, children }) {
  return (
    <section className="relative pt-40 pb-14 overflow-hidden grain">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,#2b2112,#07060A_70%)]" />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3 text-[11px] font-bold tracking-[.3em] uppercase text-[#CFAA5C]"><span className="h-px w-8 bg-[#CFAA5C]" />{eyebrow}</motion.div>
        <div className="overflow-hidden mt-4">
          <motion.h1 initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="font-display font-extrabold text-[52px] md:text-[110px] leading-[0.9] tracking-[-0.05em]">
            {title} {accent && <span className="font-serif italic font-medium text-[#E8D39C]">{accent}</span>}
          </motion.h1>
        </div>
        {children && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{children}</motion.div>}
      </div>
    </section>
  );
}
