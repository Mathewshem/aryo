import "server-only";
import { slugify } from "../constants";

// One definition per manageable table: which columns the dashboard may write,
// how lists are ordered, and how to label rows in the audit log.
export const RESOURCES = {
  talent: {
    table: "aryo_talent",
    fields: ["name", "slug", "category", "headline", "bio", "genres", "photo_url", "instagram", "phone", "featured", "active", "sort_order"],
    required: ["name", "category"],
    order: [["category", true], ["sort_order", true], ["name", true]],
    label: (r) => r.name,
    prepare: (row) => { if (row.name && !row.slug) row.slug = slugify(row.name); if (row.slug) row.slug = slugify(row.slug); row.updated_at = new Date().toISOString(); return row; },
  },
  clubs: {
    table: "aryo_clubs",
    fields: ["name", "slug", "tagline", "description", "is_flagship", "location", "map_url", "instagram", "photo_url", "active", "sort_order"],
    required: ["name"],
    order: [["sort_order", true], ["name", true]],
    label: (r) => r.name,
    prepare: (row) => { if (row.name && !row.slug) row.slug = slugify(row.name); if (row.slug) row.slug = slugify(row.slug); return row; },
  },
  partners: {
    table: "aryo_partners",
    fields: ["name", "kind", "logo_url", "website", "instagram", "hero_brand", "active", "sort_order"],
    required: ["name", "kind"],
    order: [["kind", false], ["sort_order", true], ["name", true]],
    label: (r) => r.name,
  },
  events: {
    table: "aryo_events",
    fields: ["title", "event_date", "start_time", "description", "music_policy", "poster_url", "club_id", "lineup", "published"],
    required: ["title", "event_date"],
    order: [["event_date", false]],
    label: (r) => r.title,
  },
  bookings: {
    table: "aryo_bookings",
    select: "*, talent:aryo_talent(id,name,category,photo_url), handler:aryo_staff(id,name)",
    fields: ["talent_id", "client_name", "phone", "email", "event_date", "event_type", "venue", "guests", "budget", "message", "status", "admin_note"],
    required: ["client_name", "phone", "event_date"],
    order: [["created_at", false]],
    label: (r) => r.ref || r.client_name,
    prepare: (row, staff, isCreate) => {
      if (isCreate) row.ref = makeRef();
      if (row.status) row.handled_by = staff.id;
      row.updated_at = new Date().toISOString();
      return row;
    },
  },
};

export function makeRef() {
  const d = new Date();
  const n = Math.floor(Math.random() * 36 ** 4).toString(36).toUpperCase().padStart(4, "0");
  return `ARY-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}-${n}`;
}

export function pick(body, fields) {
  const out = {};
  for (const f of fields) {
    if (!(f in body)) continue;
    let v = body[f];
    if (typeof v === "string") v = v.trim();
    if (v === "") v = null;
    out[f] = v;
  }
  return out;
}
