const MIN_AUTH_SECRET_LENGTH = 32;

type RequiredEnvName =
  | "DATABASE_URL"
  | "BETTER_AUTH_SECRET"
  | "NEXT_PUBLIC_BETTER_AUTH_URL"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET";

export type ServerEnv = {
  databaseUrl: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  googleClientId: string;
  googleClientSecret: string;
};

function requiredValue(
  env: Record<string, string | undefined>,
  name: RequiredEnvName,
) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getServerEnv(
  env: Record<string, string | undefined>,
): ServerEnv {
  const databaseUrl = requiredValue(env, "DATABASE_URL");
  const betterAuthSecret = requiredValue(env, "BETTER_AUTH_SECRET");
  const betterAuthUrl = requiredValue(env, "NEXT_PUBLIC_BETTER_AUTH_URL");
  const googleClientId = requiredValue(env, "GOOGLE_CLIENT_ID");
  const googleClientSecret = requiredValue(env, "GOOGLE_CLIENT_SECRET");

  try {
    const databaseUrlObject = new URL(databaseUrl);
    if (
      databaseUrlObject.protocol !== "postgres:" &&
      databaseUrlObject.protocol !== "postgresql:"
    ) {
      throw new Error("must use a PostgreSQL connection URL");
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "is invalid";
    throw new Error(`DATABASE_URL ${reason}`);
  }

  try {
    const parsedUrl = new URL(betterAuthUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("must use HTTP or HTTPS");
    }
    const isProductionRuntime =
      env.NODE_ENV === "production" &&
      env.NEXT_PHASE !== "phase-production-build";
    if (isProductionRuntime && parsedUrl.protocol !== "https:") {
      throw new Error("must use HTTPS in production");
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "is invalid";
    throw new Error(`NEXT_PUBLIC_BETTER_AUTH_URL ${reason}: ${betterAuthUrl}`);
  }

  if (betterAuthSecret.length < MIN_AUTH_SECRET_LENGTH) {
    throw new Error(
      `BETTER_AUTH_SECRET must be at least ${MIN_AUTH_SECRET_LENGTH} characters long`,
    );
  }

  return {
    databaseUrl,
    betterAuthSecret,
    betterAuthUrl,
    googleClientId,
    googleClientSecret,
  };
}
