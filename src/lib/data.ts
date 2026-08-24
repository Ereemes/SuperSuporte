import { prisma } from "./db";
import { Store } from "./types";

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

function getBrazilTime(): string {
  const now = new Date();
  const brazil = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return `${String(brazil.getHours()).padStart(2, "0")}:${String(brazil.getMinutes()).padStart(2, "0")}`;
}

function computeStatus(baseStatus: string, horaAbertura: string | null, horaFechamento: string | null): string {
  if (baseStatus === "Fechada") return "Fechada";
  if (!horaAbertura || !horaFechamento) return baseStatus;
  const hhmm = getBrazilTime();
  return hhmm >= horaAbertura && hhmm < horaFechamento ? "Aberta" : "Fechada";
}

function padCodigo(raw: string): string {
  const n = parseInt(raw, 10);
  return isNaN(n) ? raw.padStart(3, "0") : String(n).padStart(3, "0");
}

function toStore(s: Record<string, unknown>, isFavorite: boolean): Store {
  const codigo = padCodigo(String(s.codigo || "0"));
  return {
    id: s.id as number,
    codigo,
    nome: s.nome as string,
    razaoSocial: (s.razaoSocial as string) || null,
    cnpj: (s.cnpj as string) || null,
    status: s.status as string,
    unidadeNegocio: (s.unidadeNegocio as string) || null,
    grupoFinanceiro: (s.grupoFinanceiro as string) || null,
    logradouro: (s.logradouro as string) || null,
    numero: (s.numero as string) || null,
    complemento: (s.complemento as string) || null,
    bairro: (s.bairro as string) || null,
    cidade: (s.cidade as string) || null,
    uf: (s.uf as string) || null,
    cep: (s.cep as string) || null,
    regional: (s.regional as string) || null,
    diretor: (s.diretor as string) || null,
    telefone: (s.telefone as string) || null,
    whatsapp: (s.whatsapp as string) || null,
    emailLoja: (s.emailLoja as string) || null,
    emailGerente: (s.emailGerente as string) || null,
    horaAbertura: (s.horaAbertura as string) || null,
    horaFechamento: (s.horaFechamento as string) || null,
    ip: (s.ip as string) || null,
    linkInternet: (s.linkInternet as string) || null,
    operadora: (s.operadora as string) || null,
    tipoConexao: (s.tipoConexao as string) || null,
    qtdePdvs: (s.qtdePdvs as number) ?? null,
    servidorLocal: (s.servidorLocal as string) || null,
    modeloEquipamento: (s.modeloEquipamento as string) || null,
    versaoMegastore: (s.versaoMegastore as string) || null,
    versaoRetaguarda: (s.versaoRetaguarda as string) || null,
    versaoFrente: (s.versaoFrente as string) || null,
    ambiente: BETA_CODES.has(codigo) ? "Beta" : (s.ambiente as string) || null,
    homologacao: (s.homologacao as string) || null,
    observacoes: (s.observacoes as string) || null,
    ultimaAtualizacao: (s.ultimaAtualizacao as string) || null,
    fornecedorAtendimento: TI_PARTNER_CODES.has(codigo) ? "TI Partner" : C4_CODES.has(codigo) ? "C4" : null,
    possuiTaxaDeslocamento: TI_PARTNER_CODES.has(codigo) || C4_CODES.has(codigo),
    isFavorite,
  };
}

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function matchesQuery(s: Store, needle: string): boolean {
  return (
    norm(s.codigo).includes(needle) ||
    norm(s.nome).includes(needle) ||
    (s.cidade ? norm(s.cidade).includes(needle) : false) ||
    (s.cnpj && needle.length >= 6 ? s.cnpj.replace(/\D/g, "").includes(needle.replace(/\D/g, "")) : false) ||
    (s.regional ? norm(s.regional).includes(needle) : false) ||
    (s.razaoSocial ? norm(s.razaoSocial).includes(needle) : false) ||
    (s.unidadeNegocio ? norm(s.unidadeNegocio).includes(needle) : false) ||
    (s.diretor ? norm(s.diretor).includes(needle) : false) ||
    (s.grupoFinanceiro ? norm(s.grupoFinanceiro).includes(needle) : false)
  );
}

export async function getStores(params: {
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
  const { q, status, uf, unidade, diretor, fornecedor, taxa, favoritesOnly, page = 1, limit = 20, userId = "default" } = params;

  const allStores = await prisma.store.findMany({
    orderBy: { codigo: "asc" },
  });

  const userFavIds = new Set(
    (await prisma.favorite.findMany({
      where: { userId },
      select: { storeId: true },
    })).map((f) => f.storeId)
  );

  let filtered = allStores.map((s) => toStore(s as Record<string, unknown>, userFavIds.has(s.id)));

  if (q) {
    const needle = norm(q);
    filtered = filtered.filter((s) => matchesQuery(s, needle));
  }

  if (status) filtered = filtered.filter((s) => computeStatus(s.status, s.horaAbertura, s.horaFechamento) === status);
  if (uf) filtered = filtered.filter((s) => s.uf === uf);
  if (unidade) filtered = filtered.filter((s) => s.unidadeNegocio === unidade);
  if (diretor) filtered = filtered.filter((s) => s.diretor === diretor);
  if (fornecedor) filtered = filtered.filter((s) => s.fornecedorAtendimento === fornecedor);
  if (taxa) filtered = filtered.filter((s) => s.possuiTaxaDeslocamento);
  if (favoritesOnly) filtered = filtered.filter((s) => s.isFavorite);

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return {
    stores: paged.map((s) => ({
      ...s,
      status: computeStatus(s.status, s.horaAbertura, s.horaFechamento),
    })),
    total,
    page,
    totalPages,
  };
}

export async function getStore(id: number, userId?: string): Promise<Store | null> {
  const s = await prisma.store.findUnique({ where: { id } });
  if (!s) return null;

  const fav = userId
    ? await prisma.favorite.findUnique({ where: { userId_storeId: { userId, storeId: id } } })
    : null;

  const store = toStore(s as Record<string, unknown>, !!fav);
  return {
    ...store,
    status: computeStatus(store.status, store.horaAbertura, store.horaFechamento),
  };
}

export async function getFilterOptions() {
  const stores = await prisma.store.findMany({
    select: { uf: true, unidadeNegocio: true, diretor: true },
  });
  const ufs = [...new Set(stores.map((s) => s.uf).filter(Boolean))].sort() as string[];
  const unidades = [...new Set(stores.map((s) => s.unidadeNegocio).filter(Boolean))].sort() as string[];
  const diretores = [...new Set(stores.map((s) => s.diretor).filter(Boolean))].sort() as string[];
  return { ufs, unidades, diretores };
}

export async function toggleFavorite(storeId: number, userId: string): Promise<boolean> {
  const existing = await prisma.favorite.findUnique({
    where: { userId_storeId: { userId, storeId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return false;
  }
  await prisma.favorite.create({ data: { userId, storeId } });
  return true;
}
