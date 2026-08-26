import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

// Shared in-memory storage kept in Node so it survives page reloads and
// persists across pages. Seeded into every page via addInitScript and
// synced back to Node.
let sharedStorage = {};

/**
 * The init script (function form) injected into every page. The `seed`
 * argument carries the current Node-side storage snapshot.
 */
function makeInitScript() {
  return (seed) => {
    window.__storageData = seed;
    window.__messages = [];
    window.__storageGet = (keys) => {
      const result = {};
      if (typeof keys === 'string') keys = [keys];
      if (Array.isArray(keys)) {
        keys.forEach(k => { result[k] = window.__storageData[k]; });
      } else {
        Object.assign(result, window.__storageData);
      }
      return Promise.resolve(result);
    };
    window.__storageSet = (items) => {
      Object.assign(window.__storageData, items);
      return Promise.resolve();
    };
    window.__messagesReceived = () => window.__messages;

    window.chrome = {
      runtime: {
        id: 'test-extension-id',
        getURL: (p) => '/' + p.replace(/^\//, ''),
        onMessage: { addListener: () => {} },
        sendMessage: (msg) => { window.__messages.push(msg); return Promise.resolve(); },
        openOptionsPage: () => {},
        lastError: undefined,
      },
      storage: {
        sync: {
          get(keys, cb) {
            const p = window.__storageGet(keys);
            if (cb) p.then(res => cb(res));
            return p;
          },
          set(items, cb) {
            const p = window.__storageSet(items);
            if (cb) p.then(() => cb());
            return p;
          },
        },
        onChanged: { addListener: () => {} },
      },
      action: {
        setBadgeText: () => {},
        setBadgeBackgroundColor: () => {},
        getBadgeText: () => Promise.resolve(''),
        onClicked: { addListener: () => {} },
      },
      tabs: {
        create: () => {},
        sendMessage: () => Promise.resolve(),
        query: () => Promise.resolve([]),
      },
    };

    // Stub puzzle-english API endpoints so the popup add flow is
    // deterministic without real network access.
    window.fetch = (url) => {
      const u = String(url);
      if (u.includes('checkWordsFromMassImport')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ previewWords: ['apple'] }) });
      }
      if (u.includes('addWordsFromMassImport')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'ok', addCount: 1 }) });
      }
      return Promise.reject(new Error('unmocked fetch: ' + u));
    };
  };
}

/**
 * Register the mock on a page via addInitScript, seeding the current
 * Node-side sharedStorage snapshot.
 */
export async function registerMock(page) {
  await page.addInitScript(makeInitScript(), JSON.parse(JSON.stringify(sharedStorage)));
}

/**
 * Start a simple static file server rooted at the repo.
 */
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/') urlPath = '/popup/popup.html';
      const filePath = path.join(ROOT, urlPath);
      // Security: prevent directory traversal
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
      };
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(data);
      });
    });
    server.listen(0, () => {
      const port = server.address().port;
      console.log('Test server on port', port);
      resolve({ server, url: `http://localhost:${port}` });
    });
  });
}

/**
 * Create a browser context and return server, browser, context and baseUrl.
 */
export async function createExtensionContext() {
  const { server, url } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  return { server, browser, context, baseUrl: url };
}

/**
 * Open a page with chrome API mocks injected.
 * Seed from Node-side sharedStorage snapshot (so reloads retain state).
 */
export async function openPage(context, baseUrl, pagePath) {
  const page = await context.newPage();
  await registerMock(page);
  await page.goto(`${baseUrl}/${pagePath}`, { waitUntil: 'load' });
  // capture any initial write from this page back into Node
  await syncStorageFromPage(page);
  return page;
}

/**
 * Read the current storage snapshot from a live page into Node.
 */
export async function syncStorageFromPage(page) {
  try {
    const data = await page.evaluate(() => window.__storageData);
    sharedStorage = data || {};
  } catch {
    // page possibly closed
  }
}

