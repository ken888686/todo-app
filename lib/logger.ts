function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { value: String(error) };
}

export function logServerError(
  event: string,
  error: unknown,
  context: Record<string, string> = {},
) {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      ...context,
      error: serializeError(error),
    }),
  );
}
