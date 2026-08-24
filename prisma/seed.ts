import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const url = dbUrl.replace("file:", "");
const adapter = new PrismaBetterSqlite3({ url });
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
    { name: "Administrador TI", email: "admin@grupooscar.com.br", password: "admin123", profileType: "admin" },
    { name: "Operador TI", email: "operador@grupooscar.com.br", password: "operador123", profileType: "operador" },
    { name: "Consulta TI", email: "consulta@grupooscar.com.br", password: "consulta123", profileType: "consulta" },
  ];

  for (const u of seedUsers) {
    const profile = await prisma.profile.findUnique({ where: { type: u.profileType } });
    if (!profile) throw new Error(`Profile ${u.profileType} not found after seed`);

    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const hash = await bcrypt.hash(u.password, 10);
      await prisma.user.create({
        data: { name: u.name, email: u.email, password: hash, profileId: profile.id },
      });
      console.log(`User created: ${u.email} / ${u.password} (${u.profileType})`);
    } else {
      console.log(`User ${u.email} already exists, skipping.`);
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
