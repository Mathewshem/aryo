import { Suspense } from "react";
import PageHero from "@/components/site/PageHero";
import TalentBrowser from "@/components/site/TalentBrowser";
import { getSite } from "@/lib/server/site";

export const revalidate = 60;
export const metadata = { title: "Talent", description: "Book ARYO's DJs, hosts & entertainers, MCs, artists and designers." };

export default async function TalentPage() {
  const { talent } = await getSite();
  return (
    <main>
      <PageHero eyebrow="The roster" title="Meet the" accent="talent.">
        <p className="mt-6 max-w-xl text-[16px] text-[#a7a092]">DJs, hosts & entertainers, MCs, artists and the designers who dress the night. Tap anyone to view their profile and request a booking.</p>
      </PageHero>
      <Suspense><TalentBrowser talent={talent} /></Suspense>
    </main>
  );
}
