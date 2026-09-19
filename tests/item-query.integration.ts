import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { getItemPage } from "../lib/item-query";

const databaseUrl = process.env.TEST_DATABASE_URL;

if (!databaseUrl) {
  if (process.env.CI === "true") {
    throw new Error("TEST_DATABASE_URL is required in CI");
  }

  test(
    "item query integration tests require TEST_DATABASE_URL",
    { skip: true },
    () => {},
  );
} else {
  const pool = new Pool({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  test.after(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  test("uses a stable cursor and isolates users during item queries", async () => {
    const userId = `query-integration-${randomUUID()}`;
    const otherUserId = `query-integration-${randomUUID()}`;

    await prisma.user.createMany({
      data: [
        {
          id: userId,
          name: "Query Integration User",
          email: `${userId}@example.com`,
        },
        {
          id: otherUserId,
          name: "Other Query Integration User",
          email: `${otherUserId}@example.com`,
        },
      ],
    });

    try {
      await prisma.item.createMany({
        data: Array.from({ length: 101 }, (_, index) => ({
          title: `Query item ${String(index).padStart(3, "0")}`,
          normalizedTitle: `query item ${String(index).padStart(3, "0")}`,
          userId,
        })),
      });
      await prisma.item.create({
        data: {
          title: "Query item 100",
          normalizedTitle: "query item 100",
          userId: otherUserId,
        },
      });

      const firstPage = await getItemPage(userId, "");
      assert.equal(firstPage.items.length, 100);
      assert.equal(firstPage.hasMore, true);
      assert.ok(firstPage.nextCursor);

      const secondPage = await getItemPage(userId, "", firstPage.nextCursor);
      assert.equal(secondPage.items.length, 1);
      assert.equal(secondPage.hasMore, false);
      assert.equal(secondPage.nextCursor, null);

      const firstIds = new Set(firstPage.items.map((item) => item.id));
      assert.equal(firstIds.has(secondPage.items[0].id), false);

      const searchPage = await getItemPage(userId, "100");
      assert.deepEqual(
        searchPage.items.map((item) => item.title),
        ["Query item 100"],
      );
    } finally {
      await prisma.user.deleteMany({
        where: { id: { in: [userId, otherUserId] } },
      });
    }
  });
}
