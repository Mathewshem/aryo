import { Crown, MapPin, Instagram, ArrowUpRight } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import { Reveal, Face } from "@/components/site/bits";
import { getSite, igUrl } from "@/lib/server/site";

export const revalidate = 60;
export const metadata = { title: "Clubs" };

export default async function ClubsPage() {
  const { clubs, partners } = await getSite();
  const media = partners.filter((p) => p.kind === "media");
  return (
    <main>
      <PageHero eyebrow="The family" title="ARYO &" accent="friends." />
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-20 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clubs.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.07} className={c.is_flagship ? "md:col-span-2 lg:col-span-3" : ""}>
            <div className={`group relative overflow-hidden rounded-[28px] border p-8 h-full ${c.is_flagship ? "border-[#CFAA5C]/30 bg-[radial-gradient(80%_80%_at_80%_10%,#3a2d16,#0b0a08_70%)] min-h-[360px] flex flex-col justify-end" : "border-white/[.07] bg-[#0e0c0b] min-h-[260px] flex flex-col justify-between"}`}>
              <div className={c.is_flagship ? "absolute right-8 top-8" : ""}>
                {c.is_flagship
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={c.photo_url || "/aryo-logo.jpg"} alt="" className="h-32 w-32 rounded-full ring-1 ring-[#CFAA5C]/60 object-cover" />
                  : <Face t={c} size={72} />}
              </div>
              <div>
                {c.is_flagship && <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.3em] text-[#CFAA5C]"><Crown size={14} /> {c.tagline || "THE MOTHER"}</div>}
                <h2 className={`font-display font-bold ${c.is_flagship ? "mt-3 text-[64px] leading-none" : "text-[30px]"}`}>{c.name}</h2>
                {!c.is_flagship && c.tagline && <p className="text-[#a7a092] mt-1">{c.tagline}</p>}
                {c.description && <p className="mt-3 max-w-xl text-[15px] text-[#8f897d]">{c.description}</p>}
                <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-[#a7a092]">
                  {c.location && (c.map_url ? <a href={c.map_url} target="_blank" className="inline-flex items-center gap-1.5 hover:text-white"><MapPin size={14} />{c.location}</a> : <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{c.location}</span>)}
                  {c.instagram && <a href={igUrl(c.instagram)} target="_blank" className="inline-flex items-center gap-1.5 hover:text-white"><Instagram size={14} />Instagram</a>}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>
      {media.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-28">
          <Reveal><div className="text-[11px] font-bold tracking-[.3em] uppercase text-[#CFAA5C]">As seen on</div></Reveal>
          <div className="mt-6 flex flex-wrap gap-4">{media.map((m) => (
            <a key={m.id} href={m.website || igUrl(m.instagram) || "#"} target="_blank" className="group inline-flex items-center gap-3 h-16 px-7 rounded-full border border-white/10 hover:border-[#CFAA5C]/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.logo_url && <img src={m.logo_url} alt="" className="h-8 w-auto" />}<span className="font-display font-bold text-[20px]">{m.name}</span><ArrowUpRight size={16} className="text-[#CFAA5C] group-hover:rotate-45 transition-transform" /></a>))}</div>
        </section>
      )}
    </main>
  );
}
