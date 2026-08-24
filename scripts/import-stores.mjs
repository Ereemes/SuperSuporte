import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const XLSX_PATH = process.argv[2];
if (!XLSX_PATH) {
  console.error("Usage: node scripts/import-stores.mjs <path-to-xlsx>");
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./prisma/dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Read JSON data exported by the Python script
const stores = JSON.parse(readFileSync(XLSX_PATH, "utf8"));

console.log(`Found ${stores.length} stores to import.`);

let created = 0;
let updated = 0;
let errors = 0;

for (const s of stores) {
  try {
    // Check if store exists by codigo
    const existing = await client.execute({
      sql: "SELECT id FROM Store WHERE codigo = ?",
      args: [s.codigo],
    });

    if (existing.rows.length > 0) {
      await client.execute({
        sql: `UPDATE Store SET
          nome = ?, razaoSocial = ?, cnpj = ?, status = ?,
          unidadeNegocio = ?, grupoFinanceiro = ?,
          logradouro = ?, numero = ?, complemento = ?, bairro = ?,
          cidade = ?, uf = ?, cep = ?, regional = ?, diretor = ?,
          telefone = ?, whatsapp = ?, emailLoja = ?, emailGerente = ?,
          horaAbertura = ?, horaFechamento = ?,
          ip = ?, linkInternet = ?, operadora = ?, tipoConexao = ?,
          qtdePdvs = ?, servidorLocal = ?, modeloEquipamento = ?,
          versaoMegastore = ?, versaoRetaguarda = ?, versaoFrente = ?,
          ambiente = ?, homologacao = ?, observacoes = ?, ultimaAtualizacao = ?,
          updatedAt = datetime('now')
        WHERE codigo = ?`,
        args: [
          s.nome, s.razaoSocial, s.cnpj, s.status,
          s.unidadeNegocio, s.grupoFinanceiro,
          s.logradouro, s.numero, s.complemento, s.bairro,
          s.cidade, s.uf, s.cep, s.regional, s.diretor,
          s.telefone, s.whatsapp, s.emailLoja, s.emailGerente,
          s.horaAbertura, s.horaFechamento,
          s.ip, s.linkInternet, s.operadora, s.tipoConexao,
          s.qtdePdvs, s.servidorLocal, s.modeloEquipamento,
          s.versaoMegastore, s.versaoRetaguarda, s.versaoFrente,
          s.ambiente, s.homologacao, s.observacoes, s.ultimaAtualizacao,
          s.codigo,
        ],
      });
      updated++;
    } else {
      await client.execute({
        sql: `INSERT INTO Store (
          codigo, nome, razaoSocial, cnpj, status,
          unidadeNegocio, grupoFinanceiro,
          logradouro, numero, complemento, bairro,
          cidade, uf, cep, regional, diretor,
          telefone, whatsapp, emailLoja, emailGerente,
          horaAbertura, horaFechamento,
          ip, linkInternet, operadora, tipoConexao,
          qtdePdvs, servidorLocal, modeloEquipamento,
          versaoMegastore, versaoRetaguarda, versaoFrente,
          ambiente, homologacao, observacoes, ultimaAtualizacao,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          s.codigo, s.nome, s.razaoSocial, s.cnpj, s.status,
          s.unidadeNegocio, s.grupoFinanceiro,
          s.logradouro, s.numero, s.complemento, s.bairro,
          s.cidade, s.uf, s.cep, s.regional, s.diretor,
          s.telefone, s.whatsapp, s.emailLoja, s.emailGerente,
          s.horaAbertura, s.horaFechamento,
          s.ip, s.linkInternet, s.operadora, s.tipoConexao,
          s.qtdePdvs, s.servidorLocal, s.modeloEquipamento,
          s.versaoMegastore, s.versaoRetaguarda, s.versaoFrente,
          s.ambiente, s.homologacao, s.observacoes, s.ultimaAtualizacao,
        ],
      });
      created++;
    }
  } catch (e) {
    console.error(`Error on store ${s.codigo}:`, e.message);
    errors++;
  }
}

console.log(`\nDone: ${created} created, ${updated} updated, ${errors} errors.`);

// Verify
const count = await client.execute("SELECT COUNT(*) as total FROM Store");
console.log(`Total stores in database: ${count.rows[0].total}`);

client.close();
