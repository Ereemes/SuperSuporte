"use client";

import { usePathname } from "next/navigation";

const modules = [
  {
    name: "Lojas",
    href: "/lojas",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M3 9 12 3l9 6v11H3z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
    active: true,
  },
];

const soon = [
  { name: "Monitoramento", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 12h4l3-9 4 18 3-9h4" /></svg> },
  { name: "Versionamento", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M6 9v6" /></svg> },
  { name: "Custos TI", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7" /></svg> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col gap-1 w-60 border-r py-5 px-3.5"
      style={{ background: "var(--paper-sub)", borderColor: "var(--rule)" }}
    >
      <span
        className="text-[10.5px] font-semibold uppercase tracking-[0.16em] px-2.5 pt-4 pb-2"
        style={{ color: "var(--muted)" }}
      >
        Modulos
      </span>
      {modules.map((m) => {
        const isActive = pathname?.startsWith(m.href);
        return (
          <a
            key={m.name}
            href={m.href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors"
            style={{
              background: isActive ? "var(--paper-hi)" : "transparent",
              color: isActive ? "var(--ink)" : "var(--ink-soft)",
              border: isActive ? "1px solid var(--rule-hi)" : "1px solid transparent",
              fontWeight: isActive ? 600 : 400,
              boxShadow: isActive ? "inset 3px 0 0 var(--brand)" : "none",
            }}
          >
            <span style={{ color: isActive ? "var(--brand)" : "var(--muted)" }}>{m.icon}</span>
            {m.name}
          </a>
        );
      })}

      <span
        className="text-[10.5px] font-semibold uppercase tracking-[0.16em] px-2.5 pt-6 pb-2"
        style={{ color: "var(--muted)" }}
      >
        Proximas secoes
      </span>
      {soon.map((m) => (
        <div
          key={m.name}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] cursor-not-allowed"
          style={{ color: "var(--muted-2)" }}
        >
          <span className="flex items-center gap-2.5">
            <span style={{ color: "var(--muted-2)" }}>{m.icon}</span>
            {m.name}
          </span>
          <span
            className="text-[9.5px] tracking-[0.1em] px-1.5 py-0.5 rounded"
            style={{
              background: "var(--paper-hi)",
              color: "var(--muted)",
              border: "1px solid var(--rule)",
            }}
          >
            Em breve
          </span>
        </div>
      ))}
    </aside>
  );
}
