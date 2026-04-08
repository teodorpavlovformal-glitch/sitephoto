import { expect, test } from "@playwright/test";

test("service tabs switch visible panels", async ({ page }) => {
  await page.goto("/");

  const autoTab = page.getByRole("tab", { name: "Автомобили" });
  await autoTab.click();

  await expect(autoTab).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#panel-auto")).toBeVisible();
  await expect(page.locator("#panel-re")).toHaveCount(0);
});

test("testimonial navigation responds to interaction", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Следващ отзив" }).click();
  await expect(page.getByRole("button", { name: "Отзив 2" })).toHaveAttribute(
    "aria-current",
    "true",
  );
});

test("faq accordion opens the answer content", async ({ page }) => {
  await page.goto("/");

  const secondQuestion = page.getByRole("button", { name: /Работите ли извън София/i });
  await secondQuestion.click();
  await expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#faq-a-2")).toBeVisible();
});

test("contact form validates required fields and handles successful submission", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Изпрати запитване" }).click();
  await expect(page.locator("#form-feedback")).toContainText("Моля");

  await page.route("https://formspree.io/f/mnjoooke", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.fill("#fname", "Тестов клиент");
  await page.fill("#femail", "test@example.com");
  await page.fill("#fmsg", "Искам ново заснемане за продуктовата линия.");
  await page.getByRole("button", { name: "Изпрати запитване" }).click();

  await expect(page.locator("#form-feedback")).toContainText("Благодаря");
});

test("mobile menu opens and closes on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const hamburger = page.locator("#hamburger");
  await hamburger.click();
  await expect(hamburger).toHaveAttribute("aria-expanded", "true");

  await page.locator("#nav-mobile a").first().click();
  await expect(hamburger).toHaveAttribute("aria-expanded", "false");
});
