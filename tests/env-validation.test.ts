import assert from "node:assert/strict";
import test from "node:test";
import { getServerEnv } from "../lib/env-validation";

const validEnv = {
  DATABASE_URL: "postgresql://localhost/todo_app",
  BETTER_AUTH_SECRET: "a-secure-test-secret-that-is-at-least-32-chars",
  NEXT_PUBLIC_BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
};

test("validates and maps server environment variables", () => {
  assert.deepEqual(getServerEnv(validEnv), {
    databaseUrl: validEnv.DATABASE_URL,
    betterAuthSecret: validEnv.BETTER_AUTH_SECRET,
    betterAuthUrl: validEnv.NEXT_PUBLIC_BETTER_AUTH_URL,
    googleClientId: validEnv.GOOGLE_CLIENT_ID,
    googleClientSecret: validEnv.GOOGLE_CLIENT_SECRET,
  });
});

test("rejects missing required environment variables", () => {
  const missingSecret = {
    ...validEnv,
    GOOGLE_CLIENT_SECRET: undefined,
  };
  assert.throws(() => getServerEnv(missingSecret), /GOOGLE_CLIENT_SECRET/);
});

test("requires HTTPS and a strong secret in production", () => {
  assert.throws(
    () =>
      getServerEnv({
        ...validEnv,
        NODE_ENV: "production",
        NEXT_PHASE: "phase-production-server",
        BETTER_AUTH_SECRET: "short-secret",
        NEXT_PUBLIC_BETTER_AUTH_URL: "https://example.com",
      }),
    /BETTER_AUTH_SECRET/,
  );

  assert.throws(
    () =>
      getServerEnv({
        ...validEnv,
        NODE_ENV: "production",
        NEXT_PHASE: "phase-production-server",
        BETTER_AUTH_SECRET: validEnv.BETTER_AUTH_SECRET,
        NEXT_PUBLIC_BETTER_AUTH_URL: "http://localhost:3000",
      }),
    /HTTPS in production/,
  );
});
