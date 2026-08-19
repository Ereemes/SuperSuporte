"use client";

import { useEffect, useState } from "react";

export function Topbar() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <header
      className="flex items-center justify-between px-6 py-3.5"
      style={{ background: "var(--paper)", borderBottom: "1px solid var(--rule)" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M 30 88 Q 30 165 65 180 L 65 195 L 135 195 L 135 180 Q 170 165 170 88 Z" fill="var(--brand)" />
            <circle cx="100" cy="62" r="32" fill="var(--brand)" />
          </svg>
        </div>
        <span className="font-semibold text-sm tracking-[0.14em] uppercase" style={{ color: "var(--ink)" }}>
          SUPERSUPORTE
        </span>
      </div>

      <span className="text-[13px] hidden sm:block" style={{ color: "var(--muted)" }}>
        Grupo Oscar · TI · <strong style={{ color: "var(--ink)" }}>Lojas</strong>
      </span>

      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 grid place-items-center rounded-full cursor-pointer transition-colors"
          style={{
            background: "var(--paper-hi)",
            border: "1px solid var(--rule)",
            color: "var(--ink-soft)",
          }}
          title="Alternar tema"
        >
          {dark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full"
          style={{
            background: "var(--paper-hi)",
            border: "1px solid var(--rule)",
          }}
        >
          <div
            className="w-7 h-7 rounded-full grid place-items-center text-xs font-bold"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            S
          </div>
          <div className="hidden sm:block">
            <div className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
              Sergio Vinicius
            </div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              Analista N1 · TI
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
