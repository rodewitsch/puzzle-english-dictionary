import { vi } from 'vitest';

// In-memory storage used by the chrome.storage.sync mock
const storageMock = {
  data: {},
  get: vi.fn((keys, callback) => {
    if (typeof keys === 'string') keys = [keys];
    const result = {};
    if (Array.isArray(keys)) {
      keys.forEach(key => {
        result[key] = storageMock.data[key];
      });
    } else {
      Object.assign(result, storageMock.data);
    }
    if (callback) callback(result);
    return Promise.resolve(result);
  }),
  set: vi.fn((items, callback) => {
    Object.assign(storageMock.data, items);
    if (callback) callback();
    return Promise.resolve();
  }),
};

// chrome runtime mock
const runtimeMock = {
  id: 'test-extension-id',
  getURL: vi.fn((p) => `chrome-extension://test/${p.replace(/^\//, '')}`),
  onMessage: { addListener: vi.fn() },
  sendMessage: vi.fn(() => Promise.resolve()),
  openOptionsPage: vi.fn(() => {}),
  lastError: undefined,
};

// chrome.action mock
const actionMock = {
  setBadgeText: vi.fn(() => {}),
  setBadgeBackgroundColor: vi.fn(() => {}),
  getBadgeText: vi.fn(() => Promise.resolve('')),
};

// chrome.offscreen mock
const offscreenMock = {
  hasDocument: vi.fn(() => Promise.resolve(false)),
  createDocument: vi.fn(() => Promise.resolve()),
  closeDocument: vi.fn(() => Promise.resolve()),
};

// chrome.contextMenus mock
const contextMenusMock = {
  create: vi.fn(() => {}),
  update: vi.fn(() => {}),
  removeAll: vi.fn(() => {}),
  onClicked: { addListener: vi.fn() },
};

// chrome.tabs mock
const tabsMock = {
  create: vi.fn(() => {}),
  sendMessage: vi.fn(() => Promise.resolve()),
  query: vi.fn(() => Promise.resolve([])),
};

globalThis.chrome = {
  storage: { sync: storageMock, onChanged: { addListener: vi.fn() } },
  runtime: runtimeMock,
  action: actionMock,
  offscreen: offscreenMock,
  contextMenus: contextMenusMock,
  tabs: tabsMock,
};

// fetch mock to be stubbed per-test via vi.stubGlobal where needed
