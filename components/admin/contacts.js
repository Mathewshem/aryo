"use client";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { waLink } from "./people";

export const contactFields = [
  { type: "section", label: "Contact" },
  { key: "contact_person", label: "Contact person", half: true },
  { key: "contact_phone", label: "Phone", half: true },
  { key: "contact_email", label: "Email", type: "email", half: true },
];

export function ContactButtons({ r }) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {r.contact_phone && <a className="btn btn-ghost" href={`tel:${r.contact_phone}`}><Phone size={14} /> Call</a>}
      {r.contact_phone && <a className="btn btn-ghost" href={waLink(r.contact_phone)} target="_blank"><MessageCircle size={14} /> WhatsApp</a>}
      {r.contact_email && <a className="btn btn-ghost" href={`mailto:${r.contact_email}`}><Mail size={14} /> Email</a>}
    </div>
  );
}

export const contactCell = (r) => r.contact_person || r.contact_phone
  ? <div><div className="font-medium">{r.contact_person || "—"}</div><div className="text-[11px] t-muted">{r.contact_phone}</div></div>
  : <span className="t-faint">Add contact</span>;
