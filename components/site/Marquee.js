export default function Marquee({ partners }) {
  const items = partners.filter((p) => p.kind === "sponsor" && p.active !== false);
  if (!items.length) return null;
  const row = [...items, ...items, ...items, ...items];
  return (
    <section className="relative border-y border-[#CFAA5C]/10 bg-[#0a090c] py-8 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-40 z-10 bg-gradient-to-r from-[#0a090c] to-transparent" />
      <div className="absolute inset-y-0 right-0 w-40 z-10 bg-gradient-to-l from-[#0a090c] to-transparent" />
      <div className="marquee items-center gap-16 pr-16">
        {row.map((p, i) => (
          <div key={i} className="flex items-center gap-16 shrink-0">
            {p.logo_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={p.logo_url} alt={p.name} className="h-9 w-auto max-w-[150px] object-contain opacity-70 grayscale brightness-200 hover:opacity-100 hover:grayscale-0 hover:brightness-100 transition" />
              : <span className="font-serif text-[30px] text-[#bdb6a8] whitespace-nowrap">{p.name}</span>}
            <span className="text-[#CFAA5C] text-lg">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
}
