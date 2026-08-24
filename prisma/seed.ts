import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaLibSql({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const prisma = new PrismaClient({ adapter });

const PROFILES = [
  {
    type: "admin",
    label: "Administrador",
    permissions: [
      "lojas.visualizar",
      "mudancas.visualizar",
      "mudancas.visualizar_detalhes",
      "mudancas.executar",
      "mudancas.cancelar",
      "mudancas.reprocessar",
      "mudancas.administrar",
      "admin.usuarios",
      "admin.perfis",
    ],
  },
  {
    type: "operador",
    label: "Operador",
    permissions: [
      "lojas.visualizar",
      "mudancas.visualizar",
      "mudancas.visualizar_detalhes",
      "mudancas.executar",
      "mudancas.cancelar",
    ],
  },
  {
    type: "consulta",
    label: "Consulta",
    permissions: ["lojas.visualizar"],
  },
];

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.length < 8) {
    throw new Error(
      `${key} nao definida ou muito curta (minimo 8 caracteres). Defina no .env antes de rodar o seed.`
    );
  }
  return value;
}

async function main() {
  for (const p of PROFILES) {
    const profile = await prisma.profile.upsert({
      where: { type: p.type },
      update: { label: p.label },
      create: { type: p.type, label: p.label },
    });

    for (const perm of p.permissions) {
      await prisma.profilePermission.upsert({
        where: { profileId_permission: { profileId: profile.id, permission: perm } },
        update: {},
        create: { profileId: profile.id, permission: perm },
      });
    }
  }

  const seedUsers = [
    { name: "Administrador TI", email: "admin@grupooscar.com.br", envKey: "SEED_PASSWORD_ADMIN", profileType: "admin" },
    { name: "Operador TI", email: "operador@grupooscar.com.br", envKey: "SEED_PASSWORD_OPERADOR", profileType: "operador" },
    { name: "Consulta TI", email: "consulta@grupooscar.com.br", envKey: "SEED_PASSWORD_CONSULTA", profileType: "consulta" },
  ];

  for (const u of seedUsers) {
    const password = getRequiredEnv(u.envKey);
    const profile = await prisma.profile.findUnique({ where: { type: u.profileType } });
    if (!profile) throw new Error(`Profile ${u.profileType} not found after seed`);

    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: { name: u.name, email: u.email, password: hash, profileId: profile.id },
      });
      console.log(`User created: ${u.email} (${u.profileType})`);
    } else {
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email: u.email },
        data: { password: hash },
      });
      console.log(`User ${u.email} password updated (${u.profileType})`);
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
