import { Suspense } from "react";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import BookingForm from "@/components/site/BookingForm";
import { getSite } from "@/lib/server/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book talent" };

export default async function BookPage({ searchParams }) {
  const { talent, settings } = await getSite();
  const preset = talent.find((t) => t.slug === searchParams?.t) || null;
  return (
    <main>
      <PageHero eyebrow="Bookings" title="Book the" accent="night." />
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-28 grid lg:grid-cols-[1fr_340px] gap-8">
        <Suspense><BookingForm talent={talent} preset={preset} /></Suspense>
        <aside className="space-y-4">
          {[[Clock, "Fast replies", "Requests go straight to the ARYO team's dashboard and inbox."],
            [MessageCircle, "WhatsApp-friendly", "We confirm by call or WhatsApp on the number you give."],
            [MapPin, "Visit us", settings.address],
            settings.phone && [Phone, "Reservations", settings.phone]].filter(Boolean).map(([I, h, p]) => (
            <div key={h} className="rounded-[22px] border border-white/[.07] bg-[#0e0c0b] p-6">
              <I size={20} className="text-[#CFAA5C]" /><div className="mt-3 font-semibold text-[16px]">{h}</div><p className="mt-1 text-[14px] text-[#8f897d]">{p}</p>
            </div>))}
        </aside>
      </section>
    </main>
  );
}
