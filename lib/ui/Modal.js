"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

// Boxed (square-cornered) modal used for every form in the dashboard.
export default function Modal({ open, onClose, title, subtitle, icon, children, footer, width = 560 }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto" style={{ background: "var(--overlay)", backdropFilter: "blur(3px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="card w-full flex flex-col max-h-[92vh]" style={{ maxWidth: width, borderRadius: 4 }}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b b-line">
          {icon && <span className="grid place-items-center h-8 w-8 rounded bg-gold-soft t-gold">{icon}</span>}
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold truncate">{title}</div>
            {subtitle && <div className="text-[11px] t-muted truncate">{subtitle}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3 border-t b-line bg-surface-2" style={{ borderRadius: "0 0 4px 4px" }}>{footer}</div>}
      </div>
    </div>
  );
}
