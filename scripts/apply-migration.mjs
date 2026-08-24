import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const r = await client.execute("SELECT 1 as ok");
console.log("Connection OK:", r.rows[0]);

const sql = readFileSync("prisma/migrations/20260824145250_add_auth_tables/migration.sql", "utf8");
const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0);

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    console.log("OK:", stmt.slice(0, 70));
  } catch (e) {
    console.log("ERR:", stmt.slice(0, 70), "->", e.message);
  }
}

const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log("\nTables created:", tables.rows.map(r => r.name).join(", "));

client.close();
