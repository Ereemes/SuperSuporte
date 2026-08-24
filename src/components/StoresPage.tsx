"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Store, StoresResponse } from "@/lib/types";
import { StoreDrawer } from "./StoreDrawer";

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Aberta: { bg: "var(--ok-soft)", color: "var(--ok)" },
    Fechada: { bg: "var(--paper-sub)", color: "var(--muted)" },
  };
  const s = map[status] || { bg: "var(--warn-soft)", color: "var(--warn)" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function PageButton({ p, current, onClick }: { p: number; current: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      className="px-2.5 py-0.5 rounded cursor-pointer"
      style={{
        background: current ? "var(--brand)" : "transparent",
        color: current ? "#fff" : "var(--ink-soft)",
        fontWeight: current ? 700 : 400,
        border: "none",
      }}
    >
      {p}
    </button>
  );
}

function getPageWindow(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  if (page <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...", totalPages);
  } else if (page >= totalPages - 3) {
    pages.push(1, "...");
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
  }
  return pages;
}

function DropdownChip({
  label,
  value,
  options,
  allLabel,
  onChange,
  filterChipStyle,
}: {
  label: string;
  value: string;
  options: string[];
  allLabel: string;
  onChange: (v: string) => void;
  filterChipStyle: (active: boolean) => React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-colors"
        style={filterChipStyle(!!value)}
      >
        <span className="text-[11.5px] font-medium" style={{ color: "inherit", opacity: 0.7 }}>{label}:</span>
        {value || allLabel}
        <svg viewBox="0 0 12 12" className="w-3 h-3" style={{ opacity: 0.5 }}>
          <path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={`Filtrar por ${label}`}
          className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg z-10 min-w-[160px] max-h-[280px] overflow-y-auto"
          style={{ background: "var(--paper-hi)", border: "1px solid var(--rule)" }}
        >
          <button
            role="option"
            aria-selected={!value}
            onClick={() => { onChange(""); setOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-[13px] cursor-pointer"
            style={{
              background: !value ? "var(--brand-wash)" : "transparent",
              color: !value ? "var(--brand-deep)" : "var(--ink-soft)",
              border: "none",
            }}
          >
            {allLabel}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              role="option"
              aria-selected={value === opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[13px] cursor-pointer"
              style={{
                background: value === opt ? "var(--brand-wash)" : "transparent",
                color: value === opt ? "var(--brand-deep)" : "var(--ink-soft)",
                border: "none",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Aberta");
  const [ufFilter, setUfFilter] = useState("");
  const [unidadeFilter, setUnidadeFilter] = useState("");
  const [diretorFilter, setDiretorFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [betaOnly, setBetaOnly] = useState(false);
  const [fornecedorFilter, setFornecedorFilter] = useState("");
  const [taxaFilter, setTaxaFilter] = useState("");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<{ ufs: string[]; unidades: string[]; diretores: string[] }>({ ufs: [], unidades: [], diretores: [] });

  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((d) => setFilterOptions(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (statusFilter) params.set("status", statusFilter);
    if (ufFilter) params.set("uf", ufFilter);
    if (unidadeFilter) params.set("unidade", unidadeFilter);
    if (diretorFilter) params.set("diretor", diretorFilter);
    if (betaOnly) params.set("ambiente", "Beta");
    if (fornecedorFilter) params.set("fornecedor", fornecedorFilter);
    if (taxaFilter === "Possui taxa") params.set("taxa", "true");
    if (favoritesOnly) params.set("favorites", "true");
    params.set("page", page.toString());
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/stores?${params}`);
      const data: StoresResponse = await res.json();
      setStores(data.stores);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setStores([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, statusFilter, ufFilter, unidadeFilter, diretorFilter, betaOnly, fornecedorFilter, taxaFilter, favoritesOnly, page]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter, ufFilter, unidadeFilter, diretorFilter, betaOnly, fornecedorFilter, taxaFilter, favoritesOnly]);

  async function toggleFavorite(storeId: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
    } catch { /* ignore */ }
    fetchStores();
  }

  const filterChipStyle = (active: boolean) => ({
    background: active ? "var(--brand-wash)" : "var(--paper-hi)",
    color: active ? "var(--brand-deep)" : "var(--ink-soft)",
    border: active ? "1px solid var(--brand)" : "1px solid var(--rule)",
  });

  const hasActiveFilters = ufFilter || unidadeFilter || diretorFilter || betaOnly || fornecedorFilter || taxaFilter || favoritesOnly || statusFilter !== "Aberta";
  const pageWindow = getPageWindow(page, totalPages);

  return (
    <main className="flex-1 px-5 sm:px-9 py-7 flex flex-col gap-5 overflow-x-hidden" style={{ background: "var(--paper)" }}>
      <div className="flex items-baseline justify-between pb-4" style={{ borderBottom: "1px solid var(--rule)" }}>
        <h1 className="text-2xl font-semibold m-0" style={{ letterSpacing: "-0.01em", color: "var(--ink)" }}>
          Lojas
        </h1>
        <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
          <strong style={{ color: "var(--ink)" }}>{total}</strong> registros
        </span>
      </div>

      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg max-w-lg"
        style={{ background: "var(--paper-hi)", border: "1px solid var(--rule-hi)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)" }}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, cidade, CNPJ, unidade, diretor..."
          aria-label="Buscar lojas"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--ink)" }}
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setStatusFilter(statusFilter === "Aberta" ? "" : "Aberta")}
          aria-pressed={statusFilter === "Aberta"}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-colors"
          style={filterChipStyle(statusFilter === "Aberta")}
        >
          <span className="text-[11.5px] font-medium" style={{ color: "inherit", opacity: 0.7 }}>Status:</span>
          {statusFilter === "Aberta" ? "Abertas" : "Todas"}
        </button>

        <DropdownChip
          label="UF"
          value={ufFilter}
          options={filterOptions.ufs}
          allLabel="Todas"
          onChange={setUfFilter}
          filterChipStyle={filterChipStyle}
        />

        <DropdownChip
          label="Unidade"
          value={unidadeFilter}
          options={filterOptions.unidades}
          allLabel="Todas"
          onChange={setUnidadeFilter}
          filterChipStyle={filterChipStyle}
        />

        <DropdownChip
          label="Diretor"
          value={diretorFilter}
          options={filterOptions.diretores}
          allLabel="Todos"
          onChange={setDiretorFilter}
          filterChipStyle={filterChipStyle}
        />

        <DropdownChip
          label="Fornecedor"
          value={fornecedorFilter}
          options={["TI Partner", "C4"]}
          allLabel="Todos"
          onChange={setFornecedorFilter}
          filterChipStyle={filterChipStyle}
        />

        <DropdownChip
          label="Taxa"
          value={taxaFilter}
          options={["Possui taxa"]}
          allLabel="Todas"
          onChange={setTaxaFilter}
          filterChipStyle={filterChipStyle}
        />

        <button
          onClick={() => setBetaOnly(!betaOnly)}
          aria-pressed={betaOnly}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-colors"
          style={filterChipStyle(betaOnly)}
        >
          <span
            className="inline-flex items-center px-1.5 py-px rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ background: betaOnly ? "var(--warn)" : "var(--warn-soft)", color: betaOnly ? "#fff" : "var(--warn)", lineHeight: 1.2 }}
          >
            Beta
          </span>
          Lojas Beta
        </button>

        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          aria-pressed={favoritesOnly}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-colors"
          style={filterChipStyle(favoritesOnly)}
        >
          ★ Favoritas
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setStatusFilter("Aberta");
              setUfFilter("");
              setUnidadeFilter("");
              setDiretorFilter("");
              setFornecedorFilter("");
              setTaxaFilter("");
              setBetaOnly(false);
              setFavoritesOnly(false);
              setQuery("");
            }}
            className="text-[12px] px-2 py-1 rounded cursor-pointer transition-colors"
            style={{ background: "transparent", border: "none", color: "var(--muted)", textDecoration: "underline" }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: "var(--paper-hi)", border: "1px solid var(--rule)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="w-9 px-4 py-3 text-left" style={thStyle}></th>
                <th className="px-4 py-3 text-left" style={thStyle}>Codigo</th>
                <th className="px-4 py-3 text-left" style={thStyle}>Loja</th>
                <th className="px-4 py-3 text-left hidden md:table-cell" style={thStyle}>Cidade · UF</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell" style={thStyle}>Regional</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell" style={thStyle}>Unidade</th>
                <th className="px-4 py-3 text-left" style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--muted)" }}>
                    Carregando...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--muted)" }}>
                    Nenhuma loja encontrada
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStore(s)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") setSelectedStore(s); }}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: "1px solid var(--rule)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-sub)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => toggleFavorite(s.id, e)}
                        className="w-6 h-6 grid place-items-center rounded cursor-pointer transition-colors"
                        style={{ color: s.isFavorite ? "var(--brand)" : "var(--muted-2)", background: "transparent", border: "none" }}
                        aria-label={s.isFavorite ? "Remover dos favoritos" : "Fixar como favorito"}
                      >
                        <svg viewBox="0 0 24 24" fill={s.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <path d="M12 2l3 6.9 7.5 1.1-5.4 5.3 1.3 7.4L12 19l-6.4 3.7 1.3-7.4L1.5 10l7.5-1.1z" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs" style={{ color: "var(--muted)" }}>
                      {s.codigo}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5">
                          <span className="font-medium" style={{ color: "var(--ink)" }}>{s.nome}</span>
                          {s.ambiente === "Beta" && (
                            <span
                              className="inline-flex items-center px-1.5 py-px rounded text-[10px] font-bold uppercase tracking-wider"
                              style={{ background: "var(--warn-soft)", color: "var(--warn)", lineHeight: 1.4 }}
                            >
                              Beta
                            </span>
                          )}
                          {s.possuiTaxaDeslocamento && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-px rounded text-[10px] font-medium tracking-wide"
                              style={{ background: "var(--brand-wash)", color: "var(--brand)", lineHeight: 1.4 }}
                            >
                              <span className="text-[9px]">&#x1F7E0;</span>
                              Deslocamento
                            </span>
                          )}
                        </span>
                        <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{s.razaoSocial}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell" style={{ color: "var(--ink)" }}>
                      {s.cidade} · {s.uf}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium" style={{ color: "var(--ink)" }}>{s.regional}</span>
                        <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>Dir: {s.diretor}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-[12px]" style={{ color: "var(--ink-soft)" }}>
                      {s.unidadeNegocio?.replace("Grupo ", "") || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={s.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          className="px-5 py-3 flex justify-between items-center text-[12.5px]"
          style={{ borderTop: "1px solid var(--rule)", background: "var(--paper-sub)", color: "var(--muted)" }}
        >
          <span>
            Mostrando {stores.length} de {total}
          </span>
          <nav aria-label="Paginacao" className="flex gap-1">
            {page > 1 && (
              <button onClick={() => setPage(page - 1)} aria-label="Pagina anterior" className="px-2.5 py-0.5 rounded cursor-pointer" style={{ background: "transparent", border: "none", color: "var(--ink-soft)" }}>
                ‹
              </button>
            )}
            {pageWindow.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1" style={{ color: "var(--muted)" }}>...</span>
              ) : (
                <PageButton key={p} p={p} current={p === page} onClick={() => setPage(p)} />
              )
            )}
            {page < totalPages && (
              <button onClick={() => setPage(page + 1)} aria-label="Proxima pagina" className="px-2.5 py-0.5 rounded cursor-pointer" style={{ background: "transparent", border: "none", color: "var(--ink-soft)" }}>
                ›
              </button>
            )}
          </nav>
        </div>
      </div>

      {selectedStore && <StoreDrawer store={selectedStore} onClose={() => setSelectedStore(null)} />}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "11.5px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--muted)",
  background: "var(--paper-sub)",
  borderBottom: "1px solid var(--rule)",
};
