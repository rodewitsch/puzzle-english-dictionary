import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const Core = globalThis.CorePuzzleEnglishDictionaryModule;

function mockFetchResponse({ json, text }) {
  const res = {};
  if (json !== undefined) res.json = async () => json;
  if (text !== undefined) res.text = async () => text;
  const fn = vi.fn().mockResolvedValue(res);
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('CorePuzzleEnglishDictionaryModule basics', () => {
  it('exposes expected properties', () => {
    expect(Core.url).toBe('https://puzzle-english.com');
    expect(Core.domain).toBe('puzzle-english.com');
    expect(typeof Core.checkWords).toBe('function');
    expect(typeof Core.addWords).toBe('function');
    expect(typeof Core.getSpeakerInfo).toBe('function');
    expect(typeof Core.debounce).toBe('function');
    expect(typeof Core.getTextAsset).toBe('function');
  });
});

describe('getSpeakerInfo', () => {
  it('returns known speakers with correct metadata', () => {
    expect(Core.getSpeakerInfo('vocabulary_US')).toEqual({
      name: 'Mel', flag: 'us.svg', face: 'mel.svg', audio: 'vocabulary_US'
    });
    expect(Core.getSpeakerInfo('collins_UK')).toEqual({
      name: 'Fran', flag: 'uk.svg', face: 'fran.svg', audio: 'collins_UK'
    });
    expect(Core.getSpeakerInfo('collins_US')).toEqual({
      name: 'David', flag: 'us.svg', face: 'david.svg', audio: 'collins_US'
    });
  });

  it('returns undefined for unknown speaker', () => {
    expect(Core.getSpeakerInfo('unknown_speaker')).toBeUndefined();
  });
});

describe('delay', () => {
  it('resolves after the given time', async () => {
    vi.useFakeTimers();
    try {
      const promise = Core.delay(100).then(() => 'done');
      vi.advanceTimersByTime(100);
      await expect(promise).resolves.toBe('done');
    } finally {
      vi.useRealTimers();
    }
  });

  it('can be awaited without throwing', async () => {
    await expect(Core.delay(0)).resolves.toBeUndefined();
  });
});

describe('debounce', () => {
  it('calls the underlying function once after trailing edge', async () => {
    vi.useFakeTimers();
    try {
      const fn = vi.fn();
      const debounced = Core.debounce(fn, 300);
      debounced('a');
      debounced('b');
      debounced('c');
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(300);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('c');
    } finally {
      vi.useRealTimers();
    }
  });

  it('resets the timer on further calls', async () => {
    vi.useFakeTimers();
    try {
      const fn = vi.fn();
      const debounced = Core.debounce(fn, 300);
      debounced('a');
      vi.advanceTimersByTime(200);
      debounced('b'); // restarts timer
      vi.advanceTimersByTime(200);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('getTextAsset', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Core.assetsCache = {}; // reset cache between tests
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches the URL and returns text', async () => {
    const fetchFn = mockFetchResponse({ text: 'file-content' });
    const result = await Core.getTextAsset('assets/foo.txt');
    expect(result).toBe('file-content');
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0][0]).toContain('chrome-extension://test/');
    expect(fetchFn.mock.calls[0][0]).toContain('assets/foo.txt');
  });

  it('caches the result and does not re-fetch', async () => {
    const fetchFn = mockFetchResponse({ text: 'file-content' });
    await Core.getTextAsset('assets/foo.txt');
    const second = await Core.getTextAsset('assets/foo.txt');
    expect(second).toBe('file-content');
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});

describe('checkWords', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('appends words to FormData and resolves with data', async () => {
    const fetchFn = mockFetchResponse({ json: { previewWords: ['apple'] } });
    await expect(Core.checkWords('apple')).resolves.toEqual({ previewWords: ['apple'] });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('rejects when data.error is truthy', async () => {
    mockFetchResponse({ json: { error: 'Authentication required' } });
    await expect(Core.checkWords('apple')).rejects.toBe('Authentication required');
  });
});

describe('addWords', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('resolves when data has a status', async () => {
    mockFetchResponse({ json: { status: 'ok', addCount: 2 } });
    await expect(Core.addWords({ previewWords: [] })).resolves.toEqual({ status: 'ok', addCount: 2 });
  });

  it('rejects when data lacks status', async () => {
    mockFetchResponse({ json: { error: 'boom' } });
    await expect(Core.addWords({})).rejects.toBe('boom');
  });
});

describe('globalSearch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('posts term and returns text result', async () => {
    const fetchFn = mockFetchResponse({ text: '<html>results</html>' });
    await expect(Core.globalSearch('apple')).resolves.toBe('<html>results</html>');
    const [url, opts] = fetchFn.mock.calls[0];
    expect(url).toBe('https://puzzle-english.com/');
    expect(opts.method).toBe('POST');
    const body = opts.body;
    expect(body.get('term')).toBe('apple');
    expect(body.get('ajax_action')).toBe('ajax_global_search_suggest');
  });
});

describe('addWordFromSearch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('posts word/translation and resolves with data', async () => {
    const fetchFn = mockFetchResponse({ json: { ok: true } });
    await expect(Core.addWordFromSearch('apple', 'яблоко')).resolves.toEqual({ ok: true });
    const [url, opts] = fetchFn.mock.calls[0];
    expect(url).toBe('https://puzzle-english.com/');
    expect(opts.method).toBe('POST');
    const body = opts.body;
    expect(body.get('word')).toBe('apple');
    expect(body.get('translation')).toBe('яблоко');
    expect(body.get('ajax_action')).toBe('ajax_dictionary_addWord');
  });
});
