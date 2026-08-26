import { test, expect } from '@playwright/test';
import { createExtensionContext, openPage } from './setup.mjs';
import { typeText, click } from './helpers.mjs';

test.describe('Popup page (popup/popup.html)', () => {
  let server;
  let browser;
  let context;
  let baseUrl;
  let page;

  test.beforeAll(async () => {
    const ctx = await createExtensionContext();
    server = ctx.server;
    browser = ctx.browser;
    context = ctx.context;
    baseUrl = ctx.baseUrl;
  });

  test.afterAll(async () => {
    if (browser) await browser.close().catch(() => {});
    if (server) await new Promise(r => server.close(r));
  });

  test.beforeEach(async () => {
    page = await openPage(context, baseUrl, 'popup/popup.html');
  });

  test.afterEach(async () => {
    if (page) await page.close().catch(() => {});
  });

  test('1. Popup loads with tabs, search input and list tab elements', async () => {
    await expect(page.locator('#open-search')).toBeVisible();
    await expect(page.locator('#open-list')).toBeVisible();
    await expect(page.locator('#seach-word-input')).toBeVisible();
    // words-area and add-words live in the hidden list tab by default
    await click(page, '#open-list');
    await expect(page.locator('#words-area')).toBeVisible();
    await expect(page.locator('#add-words')).toBeVisible();
  });

  test('2. Search tab is active by default', async () => {
    // search tabcontent is displayed (block)
    const display = await page.locator('#search').evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('block');
    await expect(page.locator('#open-search')).toHaveClass(/active/);
  });

  test('3. Switching to list tab shows the words area', async () => {
    await click(page, '#open-list');
    const display = await page.locator('#list').evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('block');
    await expect(page.locator('#open-list')).toHaveClass(/active/);
  });

  test('4. Switching back to search tab shows the search input', async () => {
    await click(page, '#open-list');
    await click(page, '#open-search');
    const display = await page.locator('#search').evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('block');
    await expect(page.locator('#open-search')).toHaveClass(/active/);
  });

  test('5. Clean input button appears on typing and clears the input', async () => {
    const input = page.locator('#seach-word-input');
    const cleanBtn = page.locator('.clean-input__button');
    // clean button hidden until the input gets typing (adds .dirty)
    await expect(cleanBtn).toHaveCSS('visibility', 'hidden');
    await input.click();
    await page.keyboard.type('hello', { delay: 5 });
    await expect(cleanBtn).toHaveCSS('visibility', 'visible');
    await cleanBtn.click();
    await expect(input).toHaveValue('');
    await expect(cleanBtn).toHaveCSS('visibility', 'hidden');
  });

  test('6. Typing in words area enables the submit button', async () => {
    await click(page, '#open-list');
    const button = page.locator('#add-words');
    const before = await button.getAttribute('class');
    expect(before).toContain('button_bg-disabled');
    await typeText(page, 'words-area', 'apple');
    const after = await button.getAttribute('class');
    expect(after).toContain('button_bg_green');
    expect(after).not.toContain('button_bg-disabled');
  });

  test('7. Needs-auth area hidden initially', async () => {
    const authHidden = await page.locator('.need-auth-area').evaluate(el => getComputedStyle(el).display);
    expect(authHidden).toBe('none');
    await expect(page.locator('#go-to-site')).toBeHidden();
  });

  test('8. Submitting words runs the add flow and clears the input', async () => {
    await click(page, '#open-list');
    await typeText(page, 'words-area', 'apple');
    await click(page, '#add-words');
    // fetch is stubbed, so the flow succeeds and the textarea is cleared
    await expect(page.locator('#words-area')).toHaveValue('');
    const btnText = await page.locator('#add-words').innerText();
    expect(btnText.toUpperCase()).toContain('ДОБАВЛЕНО СЛОВ');
  });
});
