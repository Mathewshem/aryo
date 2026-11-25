import Link from "next/link";
import { Instagram, MapPin, Mail, Phone } from "lucide-react";

export default function SiteFooter({ settings: s }) {
  return (
    <footer className="relative border-t border-[#CFAA5C]/10 overflow-hidden">
      <div className="absolute inset-x-0 -bottom-[5vw] text-center font-display font-extrabold leading-none select-none pointer-events-none text-[26vw] text-white/[.025]">ARYO</div>
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 py-16 grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aryo-logo.jpg" alt="" className="h-12 w-12 rounded-full ring-1 ring-[#CFAA5C]/50" />
            <div className="font-serif italic text-2xl text-[#E8D39C]">{s.tagline || "Where dining meets nightlife"}</div>
          </div>
          <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-[#8f897d]">Cocktails, cuisine and experiences. Home of Nairobi's finest DJs, hosts and nights out.</p>
        </div>
        <div><div className="text-[11px] tracking-[.25em] uppercase text-[#CFAA5C] mb-4">Explore</div>
          {[["/talent", "Talent"], ["/events", "Events"], ["/clubs", "Clubs"], ["/book", "Book talent"]].map(([h, l]) => <Link key={h} href={h} className="block py-1.5 text-[14px] text-[#cbc6bc] hover:text-white">{l}</Link>)}</div>
        <div><div className="text-[11px] tracking-[.25em] uppercase text-[#CFAA5C] mb-4">Visit</div>
          <p className="flex gap-2 text-[14px] text-[#cbc6bc]"><MapPin size={15} className="mt-0.5 shrink-0 text-[#CFAA5C]" />{s.address}</p>
          {s.happy_hour && <p className="mt-3 text-[13px] text-[#8f897d]">{s.happy_hour}</p>}</div>
        <div><div className="text-[11px] tracking-[.25em] uppercase text-[#CFAA5C] mb-4">Contact</div>
          {s.phone && <a href={`tel:${s.phone}`} className="flex items-center gap-2 py-1.5 text-[14px] text-[#cbc6bc] hover:text-white"><Phone size={14} />{s.phone}</a>}
          {s.email && <a href={`mailto:${s.email}`} className="flex items-center gap-2 py-1.5 text-[14px] text-[#cbc6bc] hover:text-white"><Mail size={14} />{s.email}</a>}
          {s.instagram && <a href={s.instagram} target="_blank" className="flex items-center gap-2 py-1.5 text-[14px] text-[#cbc6bc] hover:text-white"><Instagram size={14} />@aryo_nairobi</a>}</div>
      </div>
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 pb-8 flex flex-wrap justify-between gap-3 text-[12px] text-[#5d584f]">
        <span>© {new Date().getFullYear()} ARYO Nairobi. Please drink responsibly · 18+ only.</span>
        <Link href="/admin/login" className="hover:text-[#a7a092]">Staff sign in</Link>
      </div>
    </footer>
  );
}
