import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Instagram, Music2 } from "lucide-react";
import BookingForm from "@/components/site/BookingForm";
import { Reveal, Face, TalentCard } from "@/components/site/bits";
import { getSite, igHandle, igUrl } from "@/lib/server/site";
import { catLabel } from "@/lib/constants";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { talent } = await getSite();
  const t = talent.find((x) => x.slug === params.slug);
  return t ? { title: t.name, description: t.headline || `Book ${t.name} through ARYO Nairobi.`, openGraph: { images: t.photo_url ? [t.photo_url] : ["/aryo-logo.jpg"] } } : {};
}

export default async function TalentProfile({ params }) {
  const { talent, events } = await getSite();
  const t = talent.find((x) => x.slug === params.slug);
  if (!t) notFound();
  const more = talent.filter((x) => x.category === t.category && x.id !== t.id).slice(0, 4);
  const playing = events.filter((e) => (e.lineup || []).includes(t.id));
  return (
    <main>
      <section className="relative pt-36 pb-20 overflow-hidden grain">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_25%_30%,#3a2d16,#07060A_70%)]" />
        <div className="absolute right-0 top-24 font-display font-extrabold text-[22vw] leading-none text-white/[.025] select-none whitespace-nowrap">{t.name.replace(/^dj\s+/i, "")}</div>
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Link href={`/talent?c=${t.category}`} className="inline-flex items-center gap-2 text-[13px] text-[#a7a092] hover:text-white"><ArrowLeft size={15} /> All {catLabel(t.category)}s</Link>
          <div className="mt-10 grid lg:grid-cols-[auto_1fr] gap-12 items-center">
            <Reveal>
              <div className="relative mx-auto w-fit">
                <div className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,#CFAA5C,#3a2d16,#E8D39C,#3a2d16,#CFAA5C)] animate-[spin_9s_linear_infinite] opacity-70 blur-[2px]" />
                <div className="relative rounded-full p-2 bg-[#07060A]"><Face t={t} size={280} /></div>
              </div>
            </Reveal>
            <div>
              <Reveal delay={0.1}><div className="text-[12px] font-bold tracking-[.35em] text-[#CFAA5C] uppercase">{catLabel(t.category)}</div></Reveal>
              <Reveal delay={0.15}><h1 className="mt-3 font-display font-extrabold text-[54px] md:text-[96px] leading-[0.9] tracking-[-0.05em]">{t.name}</h1></Reveal>
              {t.headline && <Reveal delay={0.2}><p className="mt-4 font-serif italic text-[26px] text-[#E8D39C]">{t.headline}</p></Reveal>}
              <Reveal delay={0.25}>
                <div className="mt-6 flex flex-wrap gap-3">
                  {t.genres && <span className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white/[.05] border border-white/10 text-[13px]"><Music2 size={15} className="text-[#CFAA5C]" />{t.genres}</span>}
                  {t.instagram && <a href={igUrl(t.instagram)} target="_blank" className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-white/15 text-[13px] hover:bg-white/5"><Instagram size={15} />{igHandle(t.instagram)}</a>}
                </div>
              </Reveal>
              {t.bio && <Reveal delay={0.3}><p className="mt-7 max-w-2xl text-[16px] leading-relaxed text-[#a7a092] whitespace-pre-line">{t.bio}</p></Reveal>}
              {playing.length > 0 && <Reveal delay={0.35}><div className="mt-7 text-[14px] text-[#cbc6bc]">Catch them at: {playing.map((e) => <b key={e.id} className="text-[#E8D39C] mr-3">{e.title} ({e.event_date})</b>)}</div></Reveal>}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1000px] px-5 md:px-10 pb-24">
        <Reveal><h2 className="font-display font-bold text-[36px] md:text-[48px] tracking-[-0.04em] mb-6">Book {t.name}</h2></Reveal>
        <Reveal delay={0.1}><BookingForm talent={talent} preset={t} /></Reveal>
      </section>
      {more.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-28">
          <h3 className="font-display font-bold text-[28px] mb-6">More {catLabel(t.category)}s</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{more.map((m, i) => <TalentCard key={m.id} t={m} i={i} />)}</div>
        </section>
      )}
    </main>
  );
}
