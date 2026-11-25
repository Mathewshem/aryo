"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Instagram } from "lucide-react";

export function Reveal({ children, delay = 0, y = 40, className = "" }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
  );
}

export function Eyebrow({ children }) {
  return <div className="flex items-center gap-3 text-[11px] font-bold tracking-[.3em] uppercase text-[#CFAA5C]"><span className="h-px w-8 bg-[#CFAA5C]" />{children}</div>;
}

export function Face({ t, size = 120 }) {
  return t.photo_url
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={t.photo_url} alt={t.name} className="rounded-full object-cover" style={{ width: size, height: size }} />
    : <span className="rounded-full grid place-items-center font-display font-bold text-[#CFAA5C]" style={{ width: size, height: size, fontSize: size * 0.3, background: "radial-gradient(circle at 30% 25%, #2b2214, #0d0b09 70%)" }}>
        {t.name.replace(/^(dj|mc)\s+/i, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
      </span>;
}

const CAT = { dj: "DJ", host: "Host", mc: "MC", artist: "Artist", designer: "Designer" };

// Card that tilts in 3D toward the cursor.
export function TalentCard({ t, i = 0 }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 200, damping: 18 });
  const glare = useTransform([mx, my], ([x, y]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,240,210,.18), transparent 55%)`);
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.8, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 900 }}>
      <motion.div ref={ref} style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onMouseMove={(e) => { const r = ref.current.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height); }}
        onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}
        className="group relative rounded-[22px] border border-white/[.07] bg-gradient-to-b from-[#16130f] to-[#0b0a09] p-6 pt-8 text-center overflow-hidden">
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: glare }} />
        <Link href={`/talent/${t.slug}`} className="block">
          <div className="relative mx-auto w-fit" style={{ transform: "translateZ(50px)" }}>
            <div className="absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,#CFAA5C,#5a451f,#E8D39C,#5a451f,#CFAA5C)] opacity-80 group-hover:animate-[spin_4s_linear_infinite]" />
            <div className="relative rounded-full p-1 bg-[#0b0a09]"><Face t={t} size={124} /></div>
          </div>
          <div className="mt-6" style={{ transform: "translateZ(30px)" }}>
            <div className="text-[10px] font-bold tracking-[.3em] text-[#CFAA5C]">{CAT[t.category]}</div>
            <div className="mt-1.5 font-display font-bold text-[20px] leading-tight text-white">{t.name}</div>
            <div className="mt-1 text-[12.5px] text-[#8f897d] line-clamp-1 min-h-[19px]">{t.headline || t.genres || "Available for bookings"}</div>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-[12px] font-semibold text-[#E8D39C] opacity-70 group-hover:opacity-100 transition" style={{ transform: "translateZ(20px)" }}>
            View & book <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// Spinning vinyl record in CSS 3D.
export function Vinyl({ label = "ARYO" }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]" style={{ perspective: 1200 }}>
      <motion.div initial={{ rotateX: 50, opacity: 0, scale: 0.85 }} whileInView={{ rotateX: 28, opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateZ: -8 }}>
        <div className="absolute inset-0 rounded-full shadow-[0_60px_80px_-30px_rgba(0,0,0,.9),0_0_120px_-30px_rgba(207,170,92,.45)] animate-[spin_6s_linear_infinite]"
          style={{ background: "repeating-radial-gradient(circle at 50% 50%, #0b0a0c 0 2px, #17151a 2px 3px), conic-gradient(from 30deg, rgba(255,255,255,.12), transparent 18%, rgba(255,255,255,.08) 50%, transparent 68%, rgba(255,255,255,.12))", backgroundBlendMode: "screen" }}>
          <div className="absolute inset-[33%] rounded-full grid place-items-center" style={{ background: "radial-gradient(circle, #E8D39C, #A47F37 70%)" }}>
            <div className="text-center text-[#1b150b]"><div className="font-display font-extrabold tracking-[.3em] text-[clamp(12px,2.2vw,20px)]">{label}</div><div className="text-[9px] tracking-[.4em]">NAIROBI</div></div>
            <div className="absolute h-3 w-3 rounded-full bg-[#0b0a0c]" />
          </div>
        </div>
      </motion.div>
      <div className="absolute -right-2 top-[6%] h-[62%] w-3 rounded-full bg-gradient-to-b from-[#d9d3c6] to-[#6f695e] origin-top rotate-[24deg] shadow-lg" />
    </div>
  );
}

export function SocialLink({ handle, href }) {
  if (!handle) return null;
  return <a href={href} target="_blank" className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-white/15 text-[13px] hover:bg-white/5"><Instagram size={15} /> {handle}</a>;
}
