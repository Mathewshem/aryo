"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Pencil, Plus, Search, Trash2, Loader2, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { api } from "@/lib/ui/api";
import { confirmBox, toast } from "@/lib/ui/dialogs";
import Modal from "@/lib/ui/Modal";
import RowMenu from "@/lib/ui/RowMenu";
import PhotoPicker from "@/lib/ui/PhotoPicker";
import { useMe } from "./MeContext";

export function PageHead({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div><h1 className="text-[20px] font-semibold">{title}</h1>{subtitle && <p className="t-muted mt-0.5">{subtitle}</p>}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border b-line px-3 h-[34px] cursor-pointer select-none">
      <span className="font-medium t-2">{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className="relative h-5 w-9 rounded-full transition-colors" style={{ background: checked ? "var(--gold)" : "var(--surface-3)" }}>
        <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" style={{ left: checked ? 18 : 2 }} />
      </button>
    </label>
  );
}

export function FieldInput({ f, value, onChange, form }) {
  const common = { className: "field", value: value ?? "", onChange: (e) => onChange(e.target.value), placeholder: f.placeholder, required: f.required };
  switch (f.type) {
    case "textarea": return <textarea rows={f.rows || 4} {...common} />;
    case "select": return (
      <select {...common}>{!f.required && <option value="">—</option>}{(typeof f.options === "function" ? f.options(form) : f.options).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
    );
    case "toggle": return <Toggle checked={!!value} onChange={onChange} label={f.label} />;
    case "photo": return <PhotoPicker value={value} onChange={onChange} name={form.name || form.title} folder={f.folder} shape={f.shape} size={f.size || 88} />;
    case "multi": {
      const opts = typeof f.options === "function" ? f.options(form) : f.options;
      const sel = value || [];
      return (
        <div className="rounded-md border b-line p-2 max-h-[170px] overflow-y-auto flex flex-wrap gap-1.5">
          {opts.map((o) => {
            const on = sel.includes(o.value);
            return <button type="button" key={o.value} onClick={() => onChange(on ? sel.filter((x) => x !== o.value) : [...sel, o.value])}
              className="h-7 px-2.5 rounded-full text-[11.5px] font-medium border transition-colors"
              style={on ? { background: "var(--gold)", color: "#0b0a08", borderColor: "var(--gold)" } : { borderColor: "var(--line-strong)", color: "var(--text-2)" }}>{o.label}</button>;
          })}
          {!opts.length && <span className="t-faint p-1">Nothing to choose yet.</span>}
        </div>
      );
    }
    default: return <input type={f.type || "text"} {...common} onChange={(e) => onChange(f.type === "number" ? (e.target.value === "" ? null : +e.target.value) : e.target.value)} />;
  }
}

export function FormGrid({ fields, form, setForm }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
      {fields.filter((f) => !f.hidden?.(form)).map((f) => (
        <div key={f.key} className={f.half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
          {f.type !== "toggle" && <span className="label">{f.label}{f.required && <span style={{ color: "var(--bad)" }}> *</span>}</span>}
          <FieldInput f={f} form={form} value={form[f.key]} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
          {f.help && <p className="mt-1 text-[10.5px] t-faint">{f.help}</p>}
        </div>
      ))}
    </div>
  );
}

const PAGE = 20;

export default function ResourcePage({
  resource, title, subtitle, singular, icon, columns, fields, defaults = {}, tabs, tabKey, searchKeys = ["name"],
  renderView, extraActions, toolbar, onRows, endpoint, canCreate = true, deleteLabel, transformSave, onSaved, readOnly,
}) {
  const { me } = useMe();
  const isAdmin = me.role === "admin";
  const base = endpoint || `/api/admin/r/${resource}`;
  const params = useSearchParams();
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(0);
  const [edit, setEdit] = useState(null); // {mode:'create'|'edit', form}
  const [view, setView] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const d = await api(base); setRows(d.rows); onRows?.(d.rows); } catch (e) { toast(e.message, "bad"); setRows([]); }
  }, [base]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = params.get("open");
    if (id && rows) { const r = rows.find((x) => x.id === id); if (r) setView(r); }
  }, [params, rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    return rows.filter((r) => (tab === "all" || String(r[tabKey]) === tab) &&
      (!s || searchKeys.some((k) => String(k.split(".").reduce((o, p) => o?.[p], r) ?? "").toLowerCase().includes(s))));
  }, [rows, q, tab, tabKey, searchKeys]);
  useEffect(() => setPage(0), [q, tab]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const shown = filtered.slice(page * PAGE, page * PAGE + PAGE);

  const openCreate = () => setEdit({ mode: "create", form: { ...defaults } });
  const openEdit = (r) => { setView(null); setEdit({ mode: "edit", id: r.id, form: { ...r } }); };
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = transformSave ? transformSave(edit.form) : edit.form;
      const res = edit.mode === "create" ? await api(base, { method: "POST", body }) : await api(`${base}/${edit.id}`, { method: "PATCH", body });
      onSaved?.(res, edit.mode);
      toast(edit.mode === "create" ? `${singular} added` : "Changes saved");
      setEdit(null); load();
    } catch (err) { toast(err.message, "bad"); } finally { setSaving(false); }
  };
  const remove = async (r) => {
    if (!(await confirmBox(`Delete ${deleteLabel ? deleteLabel(r) : r.name || r.title || "this item"}? This can't be undone.`, { title: `Delete ${singular.toLowerCase()}` }))) return;
    try { await api(`${base}/${r.id}`, { method: "DELETE" }); toast("Deleted"); setView(null); load(); } catch (e) { toast(e.message, "bad"); }
  };
  const patch = async (r, body, msg) => {
    try { await api(`${base}/${r.id}`, { method: "PATCH", body }); toast(msg || "Updated"); load(); window.dispatchEvent(new Event("aryo-bookings")); } catch (e) { toast(e.message, "bad"); }
  };
  const ctx = { patch, reload: load, openEdit, remove, isAdmin, rows: rows || [] };

  return (
    <div>
      <PageHead title={title} subtitle={subtitle}>
        {toolbar?.(ctx)}
        {canCreate && <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Add {singular.toLowerCase()}</button>}
      </PageHead>
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-3 border-b b-line">
          {tabs && (
            <div className="flex flex-wrap gap-1 p-0.5 rounded-md bg-surface-2">
              {[{ value: "all", label: "All" }, ...tabs].map((t) => {
                const n = t.value === "all" ? rows?.length : rows?.filter((r) => String(r[tabKey]) === t.value).length;
                return <button key={t.value} onClick={() => setTab(t.value)} className="h-7 px-3 rounded text-[11.5px] font-semibold transition-all"
                  style={tab === t.value ? { background: "var(--surface)", color: "var(--text)", boxShadow: "var(--shadow)" } : { color: "var(--muted)" }}>
                  {t.label} <span className="t-faint font-medium">{n ?? ""}</span></button>;
              })}
            </div>
          )}
          <div className="relative ml-auto w-full sm:w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 t-faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`} className="field pl-8 h-8" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr>{columns.map((c) => <th key={c.label} style={{ width: c.width, textAlign: c.align }}>{c.label}</th>)}<th style={{ width: 48 }} /></tr></thead>
            <tbody>
              {!rows && [...Array(6)].map((_, i) => <tr key={i}>{columns.map((c) => <td key={c.label}><div className="skeleton h-4 w-3/4" /></td>)}<td /></tr>)}
              {rows && shown.map((r) => (
                <tr key={r.id} className="cursor-pointer" onClick={() => setView(r)}>
                  {columns.map((c) => <td key={c.label} style={{ textAlign: c.align }}>{c.render(r, ctx)}</td>)}
                  <td onClick={(e) => e.stopPropagation()}>
                    <RowMenu items={[
                      { label: "View", icon: Eye, onClick: () => setView(r) },
                      { label: "Edit", icon: Pencil, disabled: readOnly, onClick: () => openEdit(r) },
                      ...(extraActions?.(r, ctx) || []),
                      "sep",
                      { label: "Delete", icon: Trash2, danger: true, disabled: !isAdmin, onClick: () => remove(r) },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows && !filtered.length && (
            <div className="py-14 text-center t-muted"><Inbox size={28} className="mx-auto mb-2 t-faint" />Nothing here yet{q && ` for “${q}”`}.</div>
          )}
        </div>
        {rows && filtered.length > PAGE && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t b-line t-muted">
            <span>Showing {page * PAGE + 1}–{Math.min(filtered.length, (page + 1) * PAGE)} of {filtered.length}</span>
            <div className="flex gap-1">
              <button className="icon-btn" disabled={!page} onClick={() => setPage(page - 1)}><ChevronLeft size={15} /></button>
              <span className="px-2 self-center">{page + 1} / {pages}</span>
              <button className="icon-btn" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.mode === "create" ? `Add ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}
        subtitle={edit?.mode === "edit" ? edit.form.name || edit.form.title || edit.form.ref : "Fields marked * are required"} icon={icon}
        footer={<><button className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
          <button className="btn btn-gold" form="res-form" disabled={saving}>{saving && <Loader2 size={14} className="animate-spin" />} {edit?.mode === "create" ? `Add ${singular.toLowerCase()}` : "Save changes"}</button></>}>
        {edit && <form id="res-form" onSubmit={save}><FormGrid fields={fields} form={edit.form} setForm={(fn) => setEdit((s) => ({ ...s, form: fn(s.form) }))} /></form>}
      </Modal>

      <Modal open={!!view} onClose={() => setView(null)} title={view?.name || view?.title || view?.ref} subtitle={singular} icon={icon} width={600}
        footer={view && <>
          {isAdmin && <button className="btn btn-ghost mr-auto" style={{ color: "var(--bad)" }} onClick={() => remove(view)}><Trash2 size={14} /> Delete</button>}
          <button className="btn btn-ghost" onClick={() => setView(null)}>Close</button>
          {!readOnly && <button className="btn btn-primary" onClick={() => openEdit(view)}><Pencil size={14} /> Edit</button>}</>}>
        {view && renderView(view, { ...ctx, close: () => setView(null) })}
      </Modal>
    </div>
  );
}

export function DetailRows({ rows }) {
  return (
    <div className="rounded-md border b-line divide-y" style={{ borderColor: "var(--line)" }}>
      {rows.filter(Boolean).map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4 px-3.5 py-2.5" style={{ borderColor: "var(--line)" }}>
          <span className="t-muted shrink-0">{k}</span><span className="font-medium text-right break-words min-w-0">{v || <span className="t-faint">—</span>}</span>
        </div>
      ))}
    </div>
  );
}
