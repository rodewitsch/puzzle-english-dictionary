/**
 * Shared helpers for E2E tests.
 */

/**
 * Type text into a field by id.
 */
export async function typeText(page, id, text) {
  const el = page.locator(`#${id}`);
  await el.waitFor({ state: 'visible' });
  await el.click();
  await el.fill('');
  await page.keyboard.type(text, { delay: 5 });
}

/**
 * Click an element by CSS selector.
 */
export async function click(page, selector) {
  const el = page.locator(selector);
  await el.waitFor({ state: 'visible' });
  await el.click({ force: true });
}

/**
 * Get inner text of an element by selector.
 */
export async function getText(page, selector) {
  const el = page.locator(selector);
  await el.waitFor({ state: 'visible' });
  return el.innerText();
}
