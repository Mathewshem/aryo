export const CATEGORIES = [
  { id: "dj", label: "DJs", one: "DJ", href: "/admin/djs" },
  { id: "host", label: "Hosts & Entertainers", one: "Host / Entertainer", href: "/admin/hosts" },
  { id: "designer", label: "Designers", one: "Designer", href: "/admin/designers" },
  { id: "artist", label: "Artists", one: "Artist", href: "/admin/artists" },
  { id: "mc", label: "MCs", one: "MC", href: "/admin/mcs" },
];
export const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.one || id;
export const catOf = (id) => CATEGORIES.find((c) => c.id === id);

export const GIG_STATUSES = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

export const PAYMENT_METHODS = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "bank", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
];

export function payState(g) {
  const fee = Number(g.fee || 0), paid = Number(g.amount_paid || 0);
  if (!fee) return "no_fee";
  if (paid >= fee) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

export const kes = (n) => "KES " + Number(n || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 });

export function initials(name = "") {
  const parts = String(name).replace(/^(dj|mc)\s+/i, "").split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "?").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}
