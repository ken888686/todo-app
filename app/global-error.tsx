"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: "error",
        event: "app.global-error-boundary",
        digest: error.digest,
        message: error.message,
      }),
    );
  }, [error]);

  return (
    <html lang="zh-Hant">
      <body>
        <main>
          <h1>Something went wrong</h1>
          <button type="button" onClick={() => reset()}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
