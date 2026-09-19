import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

const isProduction = process.env.NODE_ENV === "production";

function getContentSecurityPolicy(nonce: string) {
  const scriptSources = isProduction
    ? ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"].join(" ")
    : ["'self'", "'unsafe-inline'", "'unsafe-eval'"].join(" ");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "frame-ancestors 'self'",
    "img-src 'self' data: blob: https://*.googleusercontent.com",
    "object-src 'none'",
    `script-src ${scriptSources}`,
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
  ].join("; ");
}

function applySecurityHeaders(response: NextResponse, nonce: string) {
  response.headers.set(
    "Content-Security-Policy",
    getContentSecurityPolicy(nonce),
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    getContentSecurityPolicy(nonce),
  );

  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!session;

  // If user is logged in and tries to access /login, redirect to home
  if (isLoggedIn && pathname.startsWith("/login")) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/", request.url)),
      nonce,
    );
  }

  // All non-public pages require an authenticated session.
  if (!isLoggedIn && !pathname.startsWith("/login")) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/login", request.url)),
      nonce,
    );
  }

  return applySecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    nonce,
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
