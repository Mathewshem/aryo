import Link from "next/link";
import { CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import { Reveal, Face } from "@/components/site/bits";
import { getSite } from "@/lib/server/site";

export const revalidate = 60;
export const metadata = { title: "Events" };

export default async function EventsPage() {
  const { events, talent, clubs, settings } = await getSite();
  const byId = Object.fromEntries(talent.map((t) => [t.id, t]));
  const club = Object.fromEntries(clubs.map((c) => [c.id, c]));
  return (
    <main>
      <PageHero eyebrow="What's on" title="Upcoming" accent="nights.">
        {settings.happy_hour && <p className="mt-6 text-[16px] text-[#a7a092]">{settings.happy_hour} · every day at ARYO.</p>}
      </PageHero>
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-28 space-y-6">
        {events.map((e, i) => {
          const d = new Date(e.event_date + "T00:00:00");
          const lineup = (e.lineup || []).map((id) => byId[id]).filter(Boolean);
          return (
            <Reveal key={e.id} delay={i * 0.05}>
              <article className="group grid md:grid-cols-[150px_320px_1fr] gap-6 md:gap-10 items-center rounded-[28px] border border-white/[.07] bg-[#0e0c0b] p-5 md:p-7 hover:border-[#CFAA5C]/30 transition-colors">
                <div className="text-center md:text-left">
                  <div className="font-display font-extrabold text-[72px] leading-none gold-text">{d.getDate()}</div>
                  <div className="text-[13px] font-bold tracking-[.25em] uppercase text-[#a7a092]">{d.toLocaleDateString("en-GB", { month: "short", weekday: "short" })}</div>
                </div>
                <div className="rounded-[20px] overflow-hidden aspect-[4/3]">
                  {e.poster_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={e.poster_url} alt={e.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    : <div className="h-full w-full grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#3a2d16,#0b0a08_70%)]"><CalendarDays size={40} className="text-[#CFAA5C]" /></div>}
                </div>
                <div>
                  <h2 className="font-display font-bold text-[32px] md:text-[40px] leading-tight">{e.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-[#a7a092]">
                    {e.start_time && <span className="inline-flex items-center gap-2"><Clock size={15} className="text-[#CFAA5C]" />{e.start_time}</span>}
                    {club[e.club_id] && <span className="inline-flex items-center gap-2"><MapPin size={15} className="text-[#CFAA5C]" />{club[e.club_id].name}</span>}
                    {e.music_policy && <span>Music policy: <b className="text-white">{e.music_policy}</b></span>}
                  </div>
                  {e.description && <p className="mt-4 text-[15px] text-[#8f897d] max-w-xl">{e.description}</p>}
                  {lineup.length > 0 && <div className="mt-5 flex flex-wrap gap-3">{lineup.map((t) => (
                    <Link key={t.id} href={`/talent/${t.slug}`} className="inline-flex items-center gap-2 pr-4 rounded-full bg-white/[.05] border border-white/10 hover:border-[#CFAA5C]/50"><Face t={t} size={34} /><span className="text-[13px] font-semibold">{t.name}</span></Link>))}</div>}
                </div>
              </article>
            </Reveal>
          );
        })}
        {!events.length && <div className="rounded-[28px] border border-dashed border-white/15 p-14 text-center text-[#8f897d]">No upcoming events right now — check <a href={settings.instagram} target="_blank" className="text-[#E8D39C]">@aryo_nairobi</a> for the latest.</div>}
        <div className="pt-6 text-center"><Link href="/book" className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#E8D39C]">Planning your own event? Book talent <ArrowRight size={16} /></Link></div>
      </section>
    </main>
  );
}
