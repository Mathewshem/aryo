"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

// The "⋮" menu on every table row: View / Edit / Delete and any extra actions.
export default function RowMenu({ items }) {
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [pos]);
  const open = (e) => {
    e.stopPropagation();
    const r = btn.current.getBoundingClientRect();
    const h = items.filter(Boolean).length * 32 + 10;
    setPos({ top: r.bottom + h > window.innerHeight ? r.top - h - 4 : r.bottom + 4, left: Math.max(8, r.right - 180) });
  };
  return (
    <>
      <button ref={btn} className="icon-btn" onClick={open} aria-label="Row actions"><MoreVertical size={15} /></button>
      {pos && createPortal(
        <div className="fixed inset-0 z-[80]" onMouseDown={() => setPos(null)}>
          <div className="card absolute w-[180px] p-1" style={{ top: pos.top, left: pos.left, borderRadius: 6 }} onMouseDown={(e) => e.stopPropagation()}>
            {items.filter(Boolean).map((it, i) => it === "sep" ? <div key={i} className="my-1 border-t b-line" /> : (
              <button key={i} disabled={it.disabled} onClick={() => { setPos(null); it.onClick(); }}
                className="w-full flex items-center gap-2.5 h-8 px-2.5 rounded text-left text-[12px] font-medium disabled:opacity-40 hover:bg-[var(--surface-2)]"
                style={{ color: it.danger ? "var(--bad)" : "var(--text-2)" }}>
                {it.icon && <it.icon size={14} />} {it.label}
              </button>
            ))}
          </div>
        </div>, document.body)}
    </>
  );
}
