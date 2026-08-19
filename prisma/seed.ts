import { PrismaClient } from "@prisma/client";
import storesRaw from "./stores_data.json";

const prisma = new PrismaClient();

function parseCode(raw: string | null): string {
  if (!raw) return "000";
  return String(raw).padStart(3, "0");
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

function parseInt_(raw: string | null): number | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

async function main() {
  console.log("Seeding database...");
  await prisma.store.deleteMany();
  await prisma.favorite.deleteMany();

  for (const s of storesRaw as Record<string, string | null>[]) {
    const codigo = parseCode(s["Código Loja"]);
    const nome = parseName(s["Nome Fantasia"]);

    await prisma.store.create({
      data: {
        codigo,
        nome,
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
        qtdePdvs: parseInt_(s["Qtde PDVs"]),
        servidorLocal: s["Servidor Local (S/N)"] || null,
        modeloEquipamento: s["Modelo de Equipamento"] || null,
        versaoMegastore: s["Versão MegaStore"] || null,
        versaoRetaguarda: s["Versão Retaguarda"] || null,
        versaoFrente: s["Versão Frente"] || null,
        ambiente: s["Ambiente (Produção/Beta)"] || null,
        homologacao: s["Homologação"] || null,
        observacoes: s["Observações"] || null,
        ultimaAtualizacao: s["Última Atualização"] || null,
      },
    });
  }

  const count = await prisma.store.count();
  console.log(`Seeded ${count} stores.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
