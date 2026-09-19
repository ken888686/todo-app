import { expect, test } from "@playwright/test";

test("renders the login shell with accessible Google sign-in control", async ({
  page,
}) => {
  const response = await page.goto("/login");
  const headers = response?.headers() ?? {};

  expect(headers["content-security-policy"]).toContain("script-src");
  if (process.env.E2E_PRODUCTION === "true") {
    expect(headers["strict-transport-security"]).toContain("max-age=");
  }

  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Google Login" }),
  ).toBeVisible();
});

test("redirects unauthenticated users from the todo page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
});

test("serves the Better Auth session endpoint", async ({ request }) => {
  const response = await request.get("/api/auth/get-session");

  expect(response.ok()).toBeTruthy();
});
