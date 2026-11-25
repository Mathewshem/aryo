"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

// App-wide confirm / alert / toast, so no browser pop-ups are ever used.
let push = null, pushToast = null;
const queue = [];
export function confirmBox(message, opts = {}) {
  return new Promise((resolve) => { const d = { kind: "confirm", message, resolve, ...opts }; push ? push(d) : queue.push(d); });
}
export function alertBox(message, opts = {}) {
  return new Promise((resolve) => { const d = { kind: "alert", message, resolve, ...opts }; push ? push(d) : queue.push(d); });
}
export function toast(message, tone = "ok") { pushToast?.({ id: Math.random(), message, tone }); }

export function DialogHost() {
  const [items, setItems] = useState([]);
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    push = (d) => setItems((l) => [...l, d]);
    queue.splice(0).forEach((d) => push(d));
    pushToast = (t) => { setToasts((l) => [...l, t]); setTimeout(() => setToasts((l) => l.filter((x) => x.id !== t.id)), 3200); };
    return () => { push = null; pushToast = null; };
  }, []);
  const cur = items[0];
  const close = (v) => { cur.resolve(cur.kind === "confirm" ? v : true); setItems((l) => l.slice(1)); };
  useEffect(() => {
    if (!cur) return;
    const k = (e) => { if (e.key === "Escape") close(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  const danger = cur?.kind === "confirm" && (cur.danger ?? /^(delete|remove)/i.test(cur.message));
  return (
    <>
      {cur && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 animate-[fade_.15s_ease]" style={{ background: "var(--overlay)", backdropFilter: "blur(3px)" }}>
          <div className="card w-full max-w-sm" style={{ borderRadius: 8 }}>
            <div className="flex items-start gap-3 p-4">
              <span className="grid place-items-center h-8 w-8 shrink-0 rounded-md" style={{ background: danger ? "var(--bad-soft)" : "var(--gold-soft)", color: danger ? "var(--bad)" : "var(--gold)" }}>
                {danger ? <AlertTriangle size={16} /> : <Info size={16} />}
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">{cur.title || (cur.kind === "confirm" ? "Please confirm" : "Notice")}</div>
                <p className="mt-1 t-2 whitespace-pre-line">{cur.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t b-line bg-surface-2" style={{ borderRadius: "0 0 8px 8px" }}>
              {cur.kind === "confirm" && <button className="btn btn-ghost" onClick={() => close(false)}>Cancel</button>}
              <button autoFocus className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={() => close(true)}>{cur.confirmLabel || (danger ? "Yes, delete" : "OK")}</button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-4 right-4 z-[110] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="card flex items-center gap-2 px-3 py-2.5 min-w-[220px]" style={{ borderLeft: `3px solid var(--${t.tone === "bad" ? "bad" : "ok"})` }}>
            {t.tone === "bad" ? <X size={14} style={{ color: "var(--bad)" }} /> : <CheckCircle2 size={14} style={{ color: "var(--ok)" }} />}
            <span className="font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
