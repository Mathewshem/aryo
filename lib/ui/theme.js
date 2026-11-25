"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "aryo_theme";

export function useTheme() {
  const [theme, setT] = useState("light");
  useEffect(() => {
    const read = () => setT(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    window.addEventListener("aryo-theme", read);
    return () => window.removeEventListener("aryo-theme", read);
  }, []);
  const set = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(KEY, t); } catch {}
    window.dispatchEvent(new Event("aryo-theme"));
  };
  return [theme, set];
}

export function ThemeSwitch() {
  const [theme, set] = useTheme();
  const dark = theme === "dark";
  return (
    <button type="button" onClick={() => set(dark ? "light" : "dark")} aria-label="Toggle light/dark mode" title={dark ? "Light mode" : "Dark mode"}
      className="relative flex items-center h-8 w-[60px] rounded-full border b-line bg-surface-2 px-1 transition-colors">
      <span className="absolute h-6 w-6 rounded-full shadow-sm transition-all duration-300 grid place-items-center"
        style={{ left: dark ? 31 : 3, background: "var(--gold)", color: "#0b0a08" }}>
        {dark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  );
}
