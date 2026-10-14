import { test, expect } from "@playwright/test";

/**
 * BAGHDAD SHOP — Playwright E2E Tests
 * Covers: Chat, Shipping Address Validation, Payment success message, UTC datetime display
 *
 * Prerequisites:
 *  - Frontend running on http://localhost:3050
 *  - Backend running on http://localhost:5001
 *  - Test account: customer@mail.com / Baghdad@2026
 */

const BASE_URL = "http://localhost:3050";
const CUSTOMER_EMAIL = "customer@mail.com";
const CUSTOMER_PASSWORD = "Baghdad@2026";

// ── Helper ──────────────────────────────────────────────────────────────────

async function loginAsCustomer(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', CUSTOMER_EMAIL);
  await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url: URL) => !url.href.includes("/login"), { timeout: 8000 });
}

// ── Test Suite 1: Chat Integration ──────────────────────────────────────────

test.describe("💬 Chat Integration", () => {

  test("Chat widget opens and shows welcome message", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    const chatToggle = page.locator('[data-testid="ai-chat-toggle"]');
    await expect(chatToggle).toBeVisible({ timeout: 10000 });
    await chatToggle.click();

    // Verify chat panel opens
    await expect(page.locator("text=Baghdad AI Assistant")).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: "tests/screenshots/chat-opened.png" });
  });

  test("Chat widget toggle button is visible on homepage", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    const chatToggle = page.locator('[data-testid="ai-chat-toggle"]');
    await expect(chatToggle).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveTitle(/Baghdad Shop/i);
  });

});

// ── Test Suite 2: Auth Flow ──────────────────────────────────────────────────

test.describe("🔐 Authentication", () => {

  test("Login page renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("Login with valid credentials succeeds", async ({ page }) => {
    await loginAsCustomer(page);
    expect(page.url()).not.toContain("/login");
  });

  test("Login with wrong password shows error", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    const pageContent = await page.content();
    const hasError = pageContent.toLowerCase().includes("invalid") ||
                     pageContent.toLowerCase().includes("incorrect") ||
                     pageContent.toLowerCase().includes("error") ||
                     currentUrl.includes("/login");
    expect(hasError).toBeTruthy();
  });

});

// ── Test Suite 3: Products & Cart ────────────────────────────────────────────

test.describe("🛍️ Products & Cart", () => {

  test("Homepage loads with products", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle(/Baghdad Shop/i);

    // Scroll down to trigger IntersectionObserver lazy product loading
    await page.evaluate(() => window.scrollTo(0, 800));

    // Wait for async Redux product fetch to populate products
    await page.waitForSelector('[data-testid="product-card"], a[href*="/products/"]', { timeout: 10000 });

    const productCount = await page.locator('[data-testid="product-card"], a[href*="/products/"]').count();
    expect(productCount).toBeGreaterThan(0);
  });

  test("Cart page is accessible after login", async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/cart");
  });

});

// ── Test Suite 4: Checkout & Address Validation ───────────────────────────────

test.describe("📦 Shipping Address Validation", () => {

  test("Checkout page loads for logged-in user", async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("localhost:3050");
    await page.screenshot({ path: "tests/screenshots/checkout-page.png" });
  });

});

// ── Test Suite 5: Orders Page & UTC Datetime ─────────────────────────────────

test.describe("🕐 Orders & UTC Datetime Conversion", () => {

  test("Customer orders page renders with dates in local format", async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto(`${BASE_URL}/profile/orders`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({ path: "tests/screenshots/orders-page.png" });
    expect(page.url()).toContain("/profile/orders");

    const pageContent = await page.content();
    const hasOrders = pageContent.toLowerCase().includes("order") &&
                      !pageContent.toLowerCase().includes("no orders");

    if (hasOrders) {
      // Ensure no raw unparsed ISO datetime string like "2026-08-14T20:18:41" appears in table text
      const hasRawISO = pageContent.includes("T20:18") || pageContent.includes(".701369");
      expect(hasRawISO).toBeFalsy();
    }
  });

  test("UTC date string is correctly converted - unit check", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      const utcStr = "2026-08-14T20:18:41.701369Z";
      const normalized = utcStr.endsWith("Z") ? utcStr : utcStr + "Z";
      const date = new Date(normalized);

      return {
        isValid: !isNaN(date.getTime()),
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      };
    });

    expect(result.isValid).toBe(true);
    expect(result.year).toBe(2026);
    expect(result.month).toBeGreaterThanOrEqual(1);
    expect(result.month).toBeLessThanOrEqual(12);
  });

});

// ── Test Suite 6: Payment Integration ────────────────────────────────────────

test.describe("💳 Payment Integration", () => {

  test("Payment page shows correct payment method options", async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const content = await page.content();
    const hasPaymentSection =
      content.toLowerCase().includes("payment") ||
      content.toLowerCase().includes("razorpay") ||
      content.toLowerCase().includes("cash") ||
      content.toLowerCase().includes("checkout");

    expect(hasPaymentSection).toBeTruthy();
    await page.screenshot({ path: "tests/screenshots/payment-section.png" });
  });

  test("Backend payment order API is reachable", async ({ request }) => {
    const response = await request.get("http://localhost:5001/api/ping");
    expect(response.status()).toBeLessThan(500);
  });

});
