import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Prisma, PrismaClient } from "../lib/generated/prisma/client";

const databaseUrl = process.env.TEST_DATABASE_URL;

if (!databaseUrl) {
  if (process.env.CI === "true") {
    throw new Error("TEST_DATABASE_URL is required in CI");
  }

  test(
    "database integration tests require TEST_DATABASE_URL",
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

  test("enforces normalized todo title uniqueness per user", async () => {
    const userId = `integration-${randomUUID()}`;
    const otherUserId = `integration-${randomUUID()}`;

    await prisma.user.createMany({
      data: [
        {
          id: userId,
          name: "Integration User",
          email: `${userId}@example.com`,
        },
        {
          id: otherUserId,
          name: "Other Integration User",
          email: `${otherUserId}@example.com`,
        },
      ],
    });

    try {
      await prisma.item.create({
        data: {
          title: "Buy milk",
          normalizedTitle: "buy milk",
          userId,
        },
      });

      await assert.rejects(
        prisma.item.create({
          data: {
            title: "  BUY MILK  ",
            normalizedTitle: "buy milk",
            userId,
          },
        }),
        (error: unknown) =>
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002",
      );

      await prisma.item.create({
        data: {
          title: "  BUY MILK  ",
          normalizedTitle: "buy milk",
          userId: otherUserId,
        },
      });

      assert.equal(
        await prisma.item.count({ where: { normalizedTitle: "buy milk" } }),
        2,
      );
    } finally {
      await prisma.user.deleteMany({
        where: { id: { in: [userId, otherUserId] } },
      });
    }
  });
}
