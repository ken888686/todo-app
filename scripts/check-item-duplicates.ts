import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });

try {
  const tableResult = await pool.query<{ table_name: string | null }>(
    `SELECT to_regclass('public.items') AS table_name`,
  );

  if (!tableResult.rows[0]?.table_name) {
    console.log("items table does not exist; no duplicate titles to check");
  } else {
    const duplicateResult = await pool.query<{
      userId: string;
      normalizedTitle: string;
      count: string;
    }>(`
      SELECT
        "userId",
        lower(btrim("title")) AS "normalizedTitle",
        COUNT(*)::text AS count
      FROM "items"
      GROUP BY "userId", lower(btrim("title"))
      HAVING COUNT(*) > 1
      ORDER BY "userId", "normalizedTitle"
      LIMIT 100
    `);

    if (duplicateResult.rows.length > 0) {
      console.error("Duplicate todo titles detected:");
      for (const row of duplicateResult.rows) {
        console.error(
          `- user=${row.userId}, title=${JSON.stringify(row.normalizedTitle)}, count=${row.count}`,
        );
      }
      process.exitCode = 1;
    } else {
      console.log("No duplicate todo titles detected");
    }
  }
} finally {
  await pool.end();
}
