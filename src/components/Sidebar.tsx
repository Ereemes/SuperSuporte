"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getVisibleModules, type ProfileType } from "@/lib/auth";

const ICONS: Record<string, React.ReactNode> = {
  lojas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 9 12 3l9 6v11H3z" />
      <path d="M9 22V12h6v10" />
    </svg>
  ),
  mudancas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

const PROFILE_COLORS: Record<ProfileType, string> = {
  admin: "var(--alert)",
  operador: "var(--brand)",
  consulta: "var(--ok)",
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const modules = getVisibleModules(user.profileType);

  return (
    <aside
      className="hidden md:flex flex-col w-60 border-r"
      style={{ background: "var(--paper-sub)", borderColor: "var(--rule)" }}
    >
      <div className="flex-1 flex flex-col gap-1 py-5 px-3.5">
        <span
          className="text-[10.5px] font-semibold uppercase tracking-[0.16em] px-2.5 pt-4 pb-2"
          style={{ color: "var(--muted)" }}
        >
          Modulos
        </span>
        {modules.map((m) => {
          const isActive = pathname?.startsWith(m.href);
          return (
            <Link
              key={m.name}
              href={m.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors no-underline"
              style={{
                background: isActive ? "var(--paper-hi)" : "transparent",
                color: isActive ? "var(--ink)" : "var(--ink-soft)",
                border: isActive ? "1px solid var(--rule-hi)" : "1px solid transparent",
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? "inset 3px 0 0 var(--brand)" : "none",
              }}
            >
              <span style={{ color: isActive ? "var(--brand)" : "var(--muted)" }}>
                {ICONS[m.icon]}
              </span>
              {m.name}
            </Link>
          );
        })}
      </div>

      <div
        className="px-3.5 py-4 flex flex-col gap-3"
        style={{ borderTop: "1px solid var(--rule)" }}
      >
        <div className="flex items-center gap-2.5 px-2">
          <div
            className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold flex-shrink-0"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            {user.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium truncate" style={{ color: "var(--ink)" }}>
              {user.name}
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: PROFILE_COLORS[user.profileType] }}
              />
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                {user.profileLabel}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors"
          style={{
            background: "transparent",
            border: "1px solid var(--rule)",
            color: "var(--muted)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
