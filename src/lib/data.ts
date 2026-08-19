import rawData from "./stores_data.json";
import { Store } from "./types";

function parseCode(raw: string | null): string {
  if (!raw) return "000";
  return String(parseInt(String(raw), 10)).padStart(3, "0");
}

function parseName(nomeFantasia: string | null): string {
  if (!nomeFantasia) return "";
  const parts = nomeFantasia.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ").trim() : nomeFantasia.trim();
}

function parseTime(raw: string | null): string | null {
  if (!raw) return null;
  const s = String(raw);
  if (s.includes(":")) return s.substring(0, 5);
  return s;
}

type RawStore = Record<string, string | null>;

const stores: Store[] = (rawData as RawStore[]).map((s, i) => ({
  id: i + 1,
  codigo: parseCode(s["Código Loja"]),
  nome: parseName(s["Nome Fantasia"]),
  razaoSocial: s["Razão Social"] || null,
  cnpj: s["CNPJ"] || null,
  status: s["Status"] || "Aberta",
  unidadeNegocio: s["Unidade de Negócio"] || null,
  grupoFinanceiro: s["Grupo Financeiro"] || null,
  logradouro: s["Logradouro"] || null,
  numero: s["Número"] || null,
  complemento: s["Complemento (Endereço Lojas)"] || null,
  bairro: s["Bairro"] || null,
  cidade: s["Cidade"] || null,
  uf: s["UF"] || null,
  cep: s["CEP"] || null,
  regional: s["Regional"] || null,
  diretor: s["Diretor"] || null,
  telefone: s["Telefone Loja"] || null,
  whatsapp: s["WhatsApp"] || null,
  emailLoja: s["E-mail Loja"] || null,
  emailGerente: s["E-mail Gerente"] || null,
  horaAbertura: parseTime(s["Hora Abertura"]),
  horaFechamento: parseTime(s["Hora Fechamento"]),
  ip: s["IP"] || null,
  linkInternet: s["Link de Internet"] || null,
  operadora: s["Operadora"] || null,
  tipoConexao: s["Tipo de Conexão"] || null,
  qtdePdvs: s["Qtde PDVs"] ? parseInt(s["Qtde PDVs"], 10) : null,
  servidorLocal: s["Servidor Local (S/N)"] || null,
  modeloEquipamento: s["Modelo de Equipamento"] || null,
  versaoMegastore: s["Versão MegaStore"] || null,
  versaoRetaguarda: s["Versão Retaguarda"] || null,
  versaoFrente: s["Versão Frente"] || null,
  ambiente: s["Ambiente (Produção/Beta)"] || null,
  homologacao: s["Homologação"] || null,
  observacoes: s["Observações"] || null,
  ultimaAtualizacao: s["Última Atualização"] || null,
  isFavorite: false,
}));

const favorites = new Set<number>();

export function getStores(params: {
  q?: string;
  status?: string;
  uf?: string;
  regional?: string;
  ambiente?: string;
  unidade?: string;
  favoritesOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  const { q, status, uf, regional, ambiente, unidade, favoritesOnly, page = 1, limit = 20 } = params;

  let filtered = stores;

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.codigo.toLowerCase().includes(lower) ||
        s.nome.toLowerCase().includes(lower) ||
        (s.cidade && s.cidade.toLowerCase().includes(lower)) ||
        (s.cnpj && s.cnpj.includes(q)) ||
        (s.regional && s.regional.toLowerCase().includes(lower)) ||
        (s.razaoSocial && s.razaoSocial.toLowerCase().includes(lower))
    );
  }

  if (status) filtered = filtered.filter((s) => s.status === status);
  if (uf) filtered = filtered.filter((s) => s.uf === uf);
  if (regional) filtered = filtered.filter((s) => s.regional === regional);
  if (ambiente) filtered = filtered.filter((s) => s.ambiente === ambiente);
  if (unidade) filtered = filtered.filter((s) => s.unidadeNegocio === unidade);
  if (favoritesOnly) filtered = filtered.filter((s) => favorites.has(s.id));

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return {
    stores: paged.map((s) => ({ ...s, isFavorite: favorites.has(s.id) })),
    total,
    page,
    totalPages,
  };
}

export function getStore(id: number): Store | null {
  const s = stores.find((s) => s.id === id);
  if (!s) return null;
  return { ...s, isFavorite: favorites.has(s.id) };
}

export function toggleFavorite(storeId: number): boolean {
  if (favorites.has(storeId)) {
    favorites.delete(storeId);
    return false;
  }
  favorites.add(storeId);
  return true;
}
