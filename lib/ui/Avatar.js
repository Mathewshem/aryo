"use client";
import { initials } from "../constants";

export default function Avatar({ src, name, size = 32, ring = false }) {
  const style = { width: size, height: size, fontSize: Math.max(9, size * 0.36) };
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name || ""} className="rounded-full object-cover shrink-0" style={{ ...style, boxShadow: ring ? "0 0 0 2px var(--surface), 0 0 0 3.5px var(--gold)" : undefined }} />
  ) : (
    <span className="rounded-full grid place-items-center font-semibold shrink-0" style={{ ...style, background: "var(--gold-soft)", color: "var(--gold)", boxShadow: ring ? "0 0 0 2px var(--surface), 0 0 0 3.5px var(--gold)" : undefined }}>
      {initials(name)}
    </span>
  );
}
