import { test, expect } from '@playwright/test';
import { createExtensionContext, openPage, syncStorageFromPage, registerMock } from './setup.mjs';

test.describe('Options page (options/options.html)', () => {
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
    page = await openPage(context, baseUrl, 'options/options.html');
  });

  test.afterEach(async () => {
    if (page) await page.close().catch(() => {});
  });

  test('1. Options page loads with all checkboxes and buttons', async () => {
    for (const id of ['bubble', 'fast-add', 'show-translate', 'close-button', 'auto-show-translate', 'auto-pronunciation', 'context-menu']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    await expect(page.locator('#save')).toBeVisible();
    await expect(page.locator('#reset')).toBeVisible();
  });

  test('2. Saving options writes to storage and sends changeOptions message', async () => {
    // change some options
    await page.locator('#context-menu').check();
    await page.locator('#auto-show-translate').check();
    await page.locator('#save').click();

    // changeOptions message sent
    const messages = await page.evaluate(() => window.__messages.filter(m => m && m.type === 'changeOptions'));
    expect(messages.length).toBeGreaterThan(0);

    // values persisted in shared storage
    const stored = await page.evaluate(() => window.__storageData);
    expect(stored.contextMenu).toBe(true);
    expect(stored.autoShowTranslation).toBe(true);
  });

  test('3. Restore loads previously saved options', async () => {
    // seed storage on the live page, then sync into Node so a reload keeps it
    await page.evaluate(() => window.__storageSet({ bubble: false, contextMenu: true, autoPronunciation: true }));
    await syncStorageFromPage(page);
    // re-register the mock so the reload seed reflects the updated snapshot
    await registerMock(page);
    // reload triggers restore_options which reads from the seeded storage
    await page.reload({ waitUntil: 'load' });
    await expect(page.locator('#bubble')).not.toBeChecked();
    await expect(page.locator('#context-menu')).toBeChecked();
    await expect(page.locator('#auto-pronunciation')).toBeChecked();
  });

  test('4. Toggling bubble global option cascades to nested options', async () => {
    await page.locator('#bubble').check();
    await expect(page.locator('#fast-add')).toBeChecked();
    await expect(page.locator('#show-translate')).toBeChecked();
    await expect(page.locator('#close-button')).toBeChecked();
  });

  test('5. Unchecking all nested options unchecks the bubble global option', async () => {
    // ensure bubble is checked and nested unchecked
    await page.locator('#bubble').check();
    await page.locator('#fast-add').uncheck();
    await page.locator('#show-translate').uncheck();
    await page.locator('#close-button').uncheck();
    // setBubbleGlobalOptionState triggers on nested changes
    await expect(page.locator('#bubble')).not.toBeChecked();
  });
});
