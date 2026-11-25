"use client";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { api } from "@/lib/ui/api";
import { toast } from "@/lib/ui/dialogs";
import { PageHead, FormGrid } from "@/components/admin/ResourcePage";
import { useMe } from "@/components/admin/MeContext";

const fields = [
  { key: "site_name", label: "Business name", half: true },
  { key: "tagline", label: "Tagline", half: true },
  { key: "email", label: "Email", type: "email", half: true },
  { key: "phone", label: "Phone", half: true, placeholder: "07…" },
  { key: "whatsapp", label: "WhatsApp number", half: true, placeholder: "2547…" },
  { key: "instagram", label: "Instagram link", half: true },
  { key: "address", label: "Address", half: true },
];

export default function SettingsPage() {
  const { me } = useMe();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api("/api/admin/settings").then((d) => setForm(d.settings)).catch((e) => toast(e.message, "bad")); }, []);
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api("/api/admin/settings", { method: "PATCH", body: form }); toast("Settings saved"); } catch (err) { toast(err.message, "bad"); } finally { setBusy(false); }
  };
  return (
    <div className="max-w-3xl">
      <PageHead title="Settings" subtitle="ARYO's own details, used on emails the system sends" />
      <form onSubmit={save} className="card">
        <div className="px-5 py-3.5 border-b b-line font-semibold">Business details</div>
        <div className="p-5">{form ? <fieldset disabled={me.role !== "admin"}><FormGrid fields={fields} form={form} setForm={setForm} /></fieldset> : <div className="skeleton h-48" />}</div>
        <div className="flex items-center justify-between px-5 py-3 border-t b-line bg-surface-2" style={{ borderRadius: "0 0 8px 8px" }}>
          <span className="t-muted">{me.role !== "admin" ? "Only admins can change settings." : "Changes apply immediately."}</span>
          {me.role === "admin" && <button className="btn btn-gold" disabled={busy || !form}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save settings</button>}
        </div>
      </form>
    </div>
  );
}
