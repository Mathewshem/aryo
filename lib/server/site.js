import "server-only";
import { cache } from "react";
import { publicDb } from "./db";

// Everything the public website needs, read with the anon key (RLS: published rows only).
export const getSite = cache(async () => {
  // Local preview without database access: ARYO_FIXTURE_FILE=/path/to/data.json
  if (process.env.ARYO_FIXTURE_FILE) return JSON.parse(require("fs").readFileSync(process.env.ARYO_FIXTURE_FILE, "utf8"));
  const db = publicDb();
  const today = new Date().toISOString().slice(0, 10);
  const [s, t, c, p, e] = await Promise.all([
    db.from("aryo_settings").select("*").eq("id", 1).maybeSingle(),
    db.from("aryo_talent").select("id,name,slug,category,headline,bio,genres,photo_url,instagram,featured,sort_order").order("sort_order").order("name"),
    db.from("aryo_clubs").select("*").order("sort_order"),
    db.from("aryo_partners").select("*").order("sort_order"),
    db.from("aryo_events").select("*").gte("event_date", today).order("event_date").limit(12),
  ]);
  return {
    settings: s.data || { site_name: "ARYO Nairobi", tagline: "Where dining meets nightlife", address: "Astrol Square, Red Hill Rd, Nairobi", happy_hour: "Happy hour 4PM – 7PM", instagram: "https://www.instagram.com/aryo_nairobi/" },
    talent: t.data || [], clubs: c.data || [], partners: p.data || [], events: e.data || [],
  };
});

export const igHandle = (v) => v ? "@" + String(v).replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/^@/, "").replace(/\/.*$/, "") : null;
export const igUrl = (v) => v ? (String(v).startsWith("http") ? v : `https://www.instagram.com/${String(v).replace(/^@/, "")}/`) : null;
