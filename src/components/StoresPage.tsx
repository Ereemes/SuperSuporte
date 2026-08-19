"use client";

import { useState, useEffect, useCallback } from "react";
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

export function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Aberta");
  const [ufFilter, setUfFilter] = useState("");
  const [regionalFilter, setRegionalFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (regionalFilter) params.set("regional", regionalFilter);
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
      console.error("Erro ao buscar lojas");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, statusFilter, ufFilter, regionalFilter, favoritesOnly, page]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter, ufFilter, regionalFilter, favoritesOnly]);

  async function toggleFavorite(storeId: number, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId }),
    });
    fetchStores();
  }

  function openDrawer(store: Store) {
    setSelectedStore(store);
  }

  const filterChipStyle = (active: boolean) => ({
    background: active ? "var(--brand-wash)" : "var(--paper-hi)",
    color: active ? "var(--brand-deep)" : "var(--ink-soft)",
    border: active ? "1px solid var(--brand)" : "1px solid var(--rule)",
  });

  return (
    <main className="flex-1 px-5 sm:px-9 py-7 flex flex-col gap-5 overflow-x-hidden" style={{ background: "var(--paper)" }}>
      {/* Page header */}
      <div className="flex items-baseline justify-between pb-4" style={{ borderBottom: "1px solid var(--rule)" }}>
        <h1 className="text-2xl font-semibold m-0" style={{ letterSpacing: "-0.01em", color: "var(--ink)" }}>
          Lojas
        </h1>
        <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
          <strong style={{ color: "var(--ink)" }}>{total}</strong> registros
        </span>
      </div>

      {/* Search */}
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
          placeholder="Buscar por codigo, nome, cidade, CNPJ ou regional..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--ink)" }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter(statusFilter === "Aberta" ? "" : "Aberta")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-colors"
          style={filterChipStyle(statusFilter === "Aberta")}
        >
          <span className="text-[11.5px] font-medium" style={{ color: "inherit", opacity: 0.7 }}>Status:</span>
          {statusFilter === "Aberta" ? "Abertas" : "Todas"}
        </button>
        <button
          onClick={() => setUfFilter(ufFilter === "SP" ? (ufFilter === "" ? "SP" : "") : "SP")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-colors"
          style={filterChipStyle(!!ufFilter)}
        >
          <span className="text-[11.5px] font-medium" style={{ color: "inherit", opacity: 0.7 }}>UF:</span>
          {ufFilter || "Todas"}
        </button>
        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-colors"
          style={filterChipStyle(favoritesOnly)}
        >
          ★ So favoritas
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: "var(--paper-hi)", border: "1px solid var(--rule)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="w-9 px-4 py-3 text-left" style={thStyle}></th>
                <th className="px-4 py-3 text-left" style={thStyle}>Codigo</th>
                <th className="px-4 py-3 text-left" style={thStyle}>Loja</th>
                <th className="px-4 py-3 text-left hidden md:table-cell" style={thStyle}>Cidade · UF</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell" style={thStyle}>Gestao</th>
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
                    onClick={() => openDrawer(s)}
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
                        title={s.isFavorite ? "Remover dos favoritos" : "Fixar como favorito"}
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
                        <span className="font-medium" style={{ color: "var(--ink)" }}>{s.nome}</span>
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

        {/* Footer */}
        <div
          className="px-5 py-3 flex justify-between items-center text-[12.5px]"
          style={{ borderTop: "1px solid var(--rule)", background: "var(--paper-sub)", color: "var(--muted)" }}
        >
          <span>
            Mostrando {stores.length} de {total}
          </span>
          <div className="flex gap-1">
            {page > 1 && (
              <button onClick={() => setPage(page - 1)} className="px-2.5 py-0.5 rounded cursor-pointer" style={{ background: "transparent", border: "none", color: "var(--ink-soft)" }}>
                ‹
              </button>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="px-2.5 py-0.5 rounded cursor-pointer"
                  style={{
                    background: p === page ? "var(--brand)" : "transparent",
                    color: p === page ? "#fff" : "var(--ink-soft)",
                    fontWeight: p === page ? 700 : 400,
                    border: "none",
                  }}
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-1">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setPage(totalPages)}
                className="px-2.5 py-0.5 rounded cursor-pointer"
                style={{
                  background: totalPages === page ? "var(--brand)" : "transparent",
                  color: totalPages === page ? "#fff" : "var(--ink-soft)",
                  border: "none",
                }}
              >
                {totalPages}
              </button>
            )}
            {page < totalPages && (
              <button onClick={() => setPage(page + 1)} className="px-2.5 py-0.5 rounded cursor-pointer" style={{ background: "transparent", border: "none", color: "var(--ink-soft)" }}>
                ›
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
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
