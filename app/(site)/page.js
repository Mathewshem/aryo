import Link from "next/link";
import { ArrowRight, ArrowUpRight, Crown, MapPin, CalendarDays, Clock } from "lucide-react";
import Hero from "@/components/site/Hero";
import Marquee from "@/components/site/Marquee";
import { Reveal, Eyebrow, TalentCard, Vinyl, Face } from "@/components/site/bits";
import { getSite } from "@/lib/server/site";
import { CATEGORIES } from "@/lib/constants";

export const revalidate = 60;

const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export default async function Home() {
  const { settings, talent, clubs, partners, events } = await getSite();
  const brand = partners.find((p) => p.hero_brand) || partners.find((p) => p.kind === "sponsor") || null;
  const djs = [...talent.filter((t) => t.featured), ...talent.filter((t) => !t.featured && t.category === "dj")].slice(0, 8);
  const byId = Object.fromEntries(talent.map((t) => [t.id, t]));
  const nextEvent = events[0];
  const lineupFaces = (nextEvent?.lineup || []).map((id) => byId[id]).filter(Boolean).concat(djs).slice(0, 3);
  const flagship = clubs.find((c) => c.is_flagship);
  const others = clubs.filter((c) => !c.is_flagship);

  return (
    <main>
      <Hero brand={brand} settings={settings} talentCount={talent.length} nextEvent={nextEvent} lineupFaces={lineupFaces} />
      <Marquee partners={partners} />

      {/* pillars */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-28">
        <Reveal><Eyebrow>The experience</Eyebrow></Reveal>
        <Reveal delay={0.1}><h2 className="mt-5 max-w-4xl font-display font-bold text-[44px] md:text-[72px] leading-[0.95] tracking-[-0.04em]">Where dining <span className="font-serif italic font-medium text-[#E8D39C]">meets</span> nightlife.</h2></Reveal>
        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {[["01", "Cocktails", "Signature pours, premium cognac and a bar built for long nights."], ["02", "Cuisine", "A kitchen that keeps up with the party — from sundowners to late plates."], ["03", "Experiences", "Theme nights, rooftop R'n'B, live DJs, hosts and MCs every week."]].map(([n, h, p], i) => (
            <Reveal key={n} delay={i * 0.12}>
              <div className="group relative h-[320px] rounded-[28px] border border-white/[.07] bg-[#0e0c0b] p-8 overflow-hidden hover:border-[#CFAA5C]/40 transition-colors">
                <div className="absolute -right-4 -top-8 font-display font-extrabold text-[170px] leading-none text-white/[.03] group-hover:text-[#CFAA5C]/10 transition-colors">{n}</div>
                <span className="grid place-items-center h-11 w-11 rounded-full border border-white/15 text-[12px] font-bold">{n}</span>
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="font-display font-bold text-[32px]">{h}</h3>
                  <p className="mt-2 text-[14.5px] text-[#8f897d] leading-relaxed">{p}</p>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 bg-gradient-to-r from-[#CFAA5C] to-transparent" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DJs */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_40%,rgba(207,170,92,.12),transparent)]" />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
          <div>
            <Reveal><Eyebrow>On the decks</Eyebrow></Reveal>
            <Reveal delay={0.1}><h2 className="mt-5 font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-[-0.04em]">Book Nairobi's<br /><span className="gold-text">finest DJs.</span></h2></Reveal>
            <Reveal delay={0.2}><p className="mt-6 max-w-md text-[15.5px] text-[#a7a092] leading-relaxed">From AceKing to Creme De La Creme — the selectors who run ARYO's nights are available for your party, launch or corporate event.</p></Reveal>
            <Reveal delay={0.3}><div className="mt-10"><Vinyl /></div></Reveal>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-2 gap-4">
            {djs.slice(0, 4).map((t, i) => <TalentCard key={t.id} t={t} i={i} />)}
          </div>
        </div>
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {djs.slice(4, 8).map((t, i) => <TalentCard key={t.id} t={t} i={i} />)}
        </div>
        <div className="relative mt-12 flex justify-center">
          <Link href="/talent?c=dj" className="group inline-flex items-center gap-3 h-12 px-7 rounded-full border border-[#CFAA5C]/40 text-[#E8D39C] hover:bg-[#CFAA5C] hover:text-[#0b0a08] transition-colors text-[14px] font-semibold">
            See all {talent.filter((t) => t.category === "dj").length} DJs <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* events */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><Reveal><Eyebrow>What's on</Eyebrow></Reveal>
            <Reveal delay={0.1}><h2 className="mt-5 font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-[-0.04em]">Upcoming nights</h2></Reveal></div>
          <Reveal><Link href="/events" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#E8D39C]">All events <ArrowUpRight size={16} /></Link></Reveal>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.slice(0, 3).map((e, i) => (
            <Reveal key={e.id} delay={i * 0.1}>
              <Link href="/events" className="group block rounded-[24px] overflow-hidden border border-white/[.07] bg-[#0e0c0b]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {e.poster_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={e.poster_url} alt={e.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    : <div className="h-full w-full grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#3a2d16,#0b0a08_70%)]"><span className="font-display font-extrabold text-[54px] text-center leading-[.9] px-6 gold-text">{e.title}</span></div>}
                  <div className="absolute left-4 top-4 rounded-full bg-black/60 backdrop-blur px-3 py-1.5 text-[12px] font-semibold text-[#E8D39C]">{fmt(e.event_date)}</div>
                </div>
                <div className="p-6">
                  <h3 className="font-display font-bold text-[22px]">{e.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#8f897d]">
                    {e.start_time && <span className="inline-flex items-center gap-1.5"><Clock size={13} />{e.start_time}</span>}
                    {e.music_policy && <span>Music: {e.music_policy}</span>}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
          {!events.length && <Reveal><div className="rounded-[24px] border border-dashed border-white/15 p-10 text-[#8f897d]"><CalendarDays className="mb-3 text-[#CFAA5C]" />New nights are announced every week — follow <a className="text-[#E8D39C]" href={settings.instagram} target="_blank">@aryo_nairobi</a>.</div></Reveal>}
        </div>
      </section>

      {/* categories */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-20">
        <Reveal><Eyebrow>The roster</Eyebrow></Reveal>
        <div className="mt-10 divide-y divide-white/[.07] border-y border-white/[.07]">
          {CATEGORIES.filter((c) => c.id !== "dj").map((c, i) => {
            const list = talent.filter((t) => t.category === c.id);
            return (
              <Reveal key={c.id} delay={i * 0.05}>
                <Link href={`/talent?c=${c.id}`} className="group flex items-center gap-6 py-7 md:py-9">
                  <span className="text-[12px] font-bold text-[#6f695e] w-8">0{i + 1}</span>
                  <span className="font-display font-bold text-[34px] md:text-[60px] leading-none tracking-[-0.04em] text-[#d9d3c6] group-hover:text-[#E8D39C] group-hover:translate-x-3 transition-all duration-500">{c.label}</span>
                  <span className="ml-auto hidden md:flex -space-x-4">
                    {list.slice(0, 5).map((t) => <span key={t.id} className="rounded-full ring-2 ring-[#07060A] group-hover:-translate-y-1 transition-transform"><Face t={t} size={52} /></span>)}
                  </span>
                  <span className="text-[13px] text-[#8f897d] w-16 text-right">{list.length}</span>
                  <span className="grid place-items-center h-12 w-12 rounded-full border border-white/15 group-hover:bg-[#CFAA5C] group-hover:text-[#0b0a08] group-hover:rotate-45 transition-all"><ArrowUpRight size={18} /></span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* clubs */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 grid lg:grid-cols-2 gap-6">
        <Reveal>
          <div className="relative h-full min-h-[420px] rounded-[28px] overflow-hidden border border-[#CFAA5C]/25 p-10 flex flex-col justify-end bg-[radial-gradient(90%_70%_at_70%_20%,#3a2d16,#0b0a08_70%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flagship?.photo_url || "/aryo-logo.jpg"} alt="" className="absolute right-8 top-8 h-28 w-28 rounded-full ring-1 ring-[#CFAA5C]/60" />
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.3em] text-[#CFAA5C]"><Crown size={14} /> {flagship?.tagline || "THE MOTHER"}</div>
            <h3 className="mt-3 font-display font-bold text-[56px] leading-none">ARYO Nairobi</h3>
            <p className="mt-3 flex items-center gap-2 text-[#a7a092]"><MapPin size={15} />{flagship?.location || settings.address}</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-[28px] border border-white/[.07] bg-[#0e0c0b] p-10 h-full">
            <Eyebrow>The family</Eyebrow>
            <p className="mt-4 text-[15px] text-[#a7a092]">Partner and sister clubs across the city.</p>
            <div className="mt-6">{others.map((c) => (
              <Link key={c.id} href="/clubs" className="group flex items-center justify-between py-4 border-b border-white/[.07]">
                <span className="font-display font-bold text-[28px] text-[#d9d3c6] group-hover:text-[#E8D39C] transition-colors">{c.name}</span>
                <ArrowUpRight size={18} className="text-[#6f695e] group-hover:text-[#E8D39C] group-hover:rotate-45 transition-all" />
              </Link>))}</div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-28 pt-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(120deg,#E8D39C,#CFAA5C_45%,#8E6B2B)] px-8 py-16 md:px-16 md:py-20 text-[#0b0a08]">
            <div className="absolute -right-10 -bottom-16 font-display font-extrabold text-[240px] leading-none text-black/[.06]">BOOK</div>
            <h2 className="relative max-w-3xl font-display font-bold text-[42px] md:text-[68px] leading-[0.95] tracking-[-0.04em]">Make your night an ARYO night.</h2>
            <p className="relative mt-5 max-w-xl text-[16px] text-black/70">Request a DJ, host, MC or artist for your event. The team confirms availability and gets back to you quickly.</p>
            <Link href="/book" className="relative mt-9 inline-flex items-center gap-3 h-14 px-8 rounded-full bg-[#0b0a08] text-[#F3EEE3] text-[16px] font-semibold hover:gap-5 transition-all">Start a booking <ArrowRight size={18} /></Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
