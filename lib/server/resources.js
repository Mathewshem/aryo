import "server-only";

// One definition per manageable table: which columns the dashboard may write,
// how lists are ordered, and how rows are named in the activity log.
export const RESOURCES = {
  talent: {
    table: "aryo_talent",
    fields: ["name", "real_name", "category", "headline", "bio", "genres", "photo_url", "phone", "whatsapp", "email", "instagram", "tiktok",
      "rate", "rate_unit", "payment_method", "mpesa_number", "mpesa_name", "bank_name", "bank_account", "notes", "active", "sort_order"],
    required: ["name", "category"],
    order: [["sort_order", true], ["name", true]],
    label: (r) => r.name,
    prepare: (row) => { row.updated_at = new Date().toISOString(); return row; },
  },
  gigs: {
    table: "aryo_gigs",
    select: "*, talent:aryo_talent(id,name,category,photo_url,phone,whatsapp,rate,payment_method,mpesa_number,mpesa_name,bank_name,bank_account), club:aryo_clubs(id,name), creator:aryo_staff(id,name)",
    fields: ["gig_date", "start_time", "end_time", "talent_id", "club_id", "night", "status", "fee", "amount_paid", "paid_on", "payment_ref", "notes"],
    required: ["gig_date", "talent_id"],
    order: [["gig_date", false], ["start_time", true]],
    label: (r) => `${r.gig_date}${r.night ? ` · ${r.night}` : ""}`,
    prepare: (row, staff, isCreate) => {
      if (isCreate) row.created_by = staff.id;
      for (const k of ["fee", "amount_paid"]) if (k in row) row[k] = Number(row[k] || 0);
      row.updated_at = new Date().toISOString();
      return row;
    },
  },
  clubs: {
    table: "aryo_clubs",
    fields: ["name", "tagline", "description", "is_flagship", "location", "map_url", "instagram", "photo_url", "contact_person", "contact_phone", "contact_email", "notes", "active", "sort_order"],
    required: ["name"],
    order: [["sort_order", true], ["name", true]],
    label: (r) => r.name,
  },
  partners: {
    table: "aryo_partners",
    fields: ["name", "kind", "logo_url", "website", "instagram", "followers", "contact_person", "contact_phone", "contact_email", "notes", "active", "sort_order"],
    required: ["name", "kind"],
    order: [["sort_order", true], ["name", true]],
    label: (r) => r.name,
  },
};

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
