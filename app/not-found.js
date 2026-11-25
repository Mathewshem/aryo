import Link from "next/link";
export default function NotFound() {
  return (
    <main className="site min-h-screen grid place-items-center text-center px-6">
      <div><div className="font-display font-extrabold text-[140px] leading-none gold-text">404</div>
        <p className="mt-2 text-[#a7a092]">This page has left the party.</p>
        <Link href="/" className="mt-8 inline-flex h-12 items-center px-7 rounded-full bg-[#E8D39C] text-[#0b0a08] font-semibold">Back to ARYO</Link></div>
    </main>
  );
}
