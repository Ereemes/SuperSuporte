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

function cleanPhone(raw: string | null): string | null {
  if (!raw) return null;
  let s = String(raw).trim();
  if (s.endsWith(".0")) s = s.slice(0, -2);
  if (!s) return null;
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 10 && !/[()-]/.test(s)) {
    const ddd = digits.slice(-11, -9) || digits.slice(0, 2);
    const num = digits.slice(-9);
    return `(${ddd}) ${num.slice(0, -4)}-${num.slice(-4)}`;
  }
  return s;
}

function parseTime(raw: string | null): string | null {
  if (!raw) return null;
  const s = String(raw);
  if (s.includes(":")) return s.substring(0, 5);
  return s;
}

type RawStore = Record<string, string | null>;

const BETA_CODES = new Set(["002", "009", "028", "209", "214", "224", "227", "302", "333", "404", "427"]);

const TI_PARTNER_CODES = new Set([
  "061", "124", "018", "414", "318", "432", "447", "431", "421", "348",
  "345", "337", "306", "037", "006", "082", "019", "319", "382", "417",
  "445", "339", "039", "356", "441", "440", "439", "428", "427", "426",
  "423", "422", "419", "415", "413", "404", "367", "364", "360", "353",
  "352", "343", "338", "333", "327", "317", "316", "302", "156", "067",
  "065", "054", "052", "043", "038", "033", "027", "326", "017", "010",
  "023", "323", "434", "436",
]);

const C4_CODES = new Set([
  "202", "208", "214", "346", "351", "359", "363", "391",
]);

function computeStatus(baseStatus: string, horaAbertura: string | null, horaFechamento: string | null): string {
  if (baseStatus === "Fechada") return "Fechada";
  if (!horaAbertura || !horaFechamento) return baseStatus;
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return hhmm >= horaAbertura && hhmm < horaFechamento ? "Aberta" : "Fechada";
}

const stores: Store[] = (rawData as RawStore[]).map((s, i) => {
  const codigo = parseCode(s["Código Loja"]);
  return {
    id: i + 1,
    codigo,
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
    telefone: cleanPhone(s["Telefone Loja"]),
    whatsapp: cleanPhone(s["WhatsApp"]),
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
    ambiente: BETA_CODES.has(codigo) ? "Beta" : s["Ambiente (Produção/Beta)"] || null,
    homologacao: s["Homologação"] || null,
    observacoes: s["Observações"] || null,
    ultimaAtualizacao: s["Última Atualização"] || null,
    fornecedorAtendimento: TI_PARTNER_CODES.has(codigo) ? "TI Partner" : C4_CODES.has(codigo) ? "C4" : null,
    possuiTaxaDeslocamento: TI_PARTNER_CODES.has(codigo) || C4_CODES.has(codigo),
    isFavorite: false,
  };
});

const favorites = new Map<string, Set<number>>();

function getUserFavorites(userId: string): Set<number> {
  let set = favorites.get(userId);
  if (!set) {
    set = new Set();
    favorites.set(userId, set);
  }
  return set;
}

export function getStores(params: {
  q?: string;
  status?: string;
  uf?: string;
  regional?: string;
  ambiente?: string;
  unidade?: string;
  diretor?: string;
  fornecedor?: string;
  taxa?: boolean;
  favoritesOnly?: boolean;
  page?: number;
  limit?: number;
  userId?: string;
}) {
  const { q, status, uf, regional, ambiente, unidade, diretor, fornecedor, taxa, favoritesOnly, page = 1, limit = 20, userId = "default" } = params;
  const userFavs = getUserFavorites(userId);

  let filtered = stores;

  if (q) {
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const needle = norm(q);
    filtered = filtered.filter(
      (s) =>
        norm(s.codigo).includes(needle) ||
        norm(s.nome).includes(needle) ||
        (s.cidade && norm(s.cidade).includes(needle)) ||
        (s.cnpj && needle.length >= 6 && s.cnpj.replace(/\D/g, "").includes(needle.replace(/\D/g, ""))) ||
        (s.regional && norm(s.regional).includes(needle)) ||
        (s.razaoSocial && norm(s.razaoSocial).includes(needle)) ||
        (s.unidadeNegocio && norm(s.unidadeNegocio).includes(needle)) ||
        (s.diretor && norm(s.diretor).includes(needle)) ||
        (s.grupoFinanceiro && norm(s.grupoFinanceiro).includes(needle))
    );
  }

  if (status) filtered = filtered.filter((s) => computeStatus(s.status, s.horaAbertura, s.horaFechamento) === status);
  if (uf) filtered = filtered.filter((s) => s.uf === uf);
  if (regional) filtered = filtered.filter((s) => s.regional === regional);
  if (ambiente) filtered = filtered.filter((s) => s.ambiente === ambiente);
  if (unidade) filtered = filtered.filter((s) => s.unidadeNegocio === unidade);
  if (diretor) filtered = filtered.filter((s) => s.diretor === diretor);
  if (fornecedor) filtered = filtered.filter((s) => s.fornecedorAtendimento === fornecedor);
  if (taxa) filtered = filtered.filter((s) => s.possuiTaxaDeslocamento);
  if (favoritesOnly) filtered = filtered.filter((s) => userFavs.has(s.id));

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return {
    stores: paged.map((s) => ({
      ...s,
      status: computeStatus(s.status, s.horaAbertura, s.horaFechamento),
      isFavorite: userFavs.has(s.id),
    })),
    total,
    page,
    totalPages,
  };
}

export function getStore(id: number, userId?: string): Store | null {
  const s = stores.find((s) => s.id === id);
  if (!s) return null;
  const userFavs = getUserFavorites(userId || "default");
  return {
    ...s,
    status: computeStatus(s.status, s.horaAbertura, s.horaFechamento),
    isFavorite: userFavs.has(s.id),
  };
}

export function getFilterOptions() {
  const ufs = [...new Set(stores.map((s) => s.uf).filter(Boolean))].sort() as string[];
  const unidades = [...new Set(stores.map((s) => s.unidadeNegocio).filter(Boolean))].sort() as string[];
  const diretores = [...new Set(stores.map((s) => s.diretor).filter(Boolean))].sort() as string[];
  return { ufs, unidades, diretores };
}

export function toggleFavorite(storeId: number, userId?: string): boolean {
  const userFavs = getUserFavorites(userId || "default");
  if (userFavs.has(storeId)) {
    userFavs.delete(storeId);
    return false;
  }
  userFavs.add(storeId);
  return true;
}
