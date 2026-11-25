export const CATEGORIES = [
  { id: "dj", label: "DJs", one: "DJ" },
  { id: "host", label: "Hosts & Entertainers", one: "Host / Entertainer" },
  { id: "mc", label: "MCs", one: "MC" },
  { id: "artist", label: "Artists", one: "Artist" },
  { id: "designer", label: "Designers", one: "Designer" },
];
export const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.one || id;

export const BOOKING_STATUSES = ["pending", "approved", "declined", "completed", "cancelled"];

export function initials(name = "") {
  const parts = String(name).replace(/^(dj|mc)\s+/i, "").split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "?").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

export function slugify(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
