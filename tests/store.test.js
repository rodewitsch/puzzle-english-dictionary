import { describe, it, expect, beforeEach } from 'vitest';

const Store = globalThis.Store;

describe('Store defaults', () => {
  it('initializes all values to defaults', () => {
    const store = new Store();
    expect(store.authorization).toBeNull();
    expect(store.selectedWord).toBeNull();
    expect(store.translation).toBeNull();
    expect(store.currentSpeakerIndex).toBe(-1);
    expect(store.speakers).toEqual([]);
  });
});

describe('Store getters/setters', () => {
  let store;
  beforeEach(() => {
    store = new Store();
  });

  it('sets and gets selectedWord', () => {
    store.selectedWord = 'apple';
    expect(store.selectedWord).toBe('apple');
  });

  it('sets and gets translation', () => {
    store.translation = { word: 'apple', translate: 'яблоко' };
    expect(store.translation).toEqual({ word: 'apple', translate: 'яблоко' });
  });

  it('sets and gets speakers', () => {
    const speakers = ['a', 'b'];
    store.speakers = speakers;
    expect(store.speakers).toEqual(speakers);
  });

  it('sets and gets authorization', () => {
    store.authorization = { auth: true };
    expect(store.authorization).toEqual({ auth: true });
  });
});

describe('Store subscription model', () => {
  let store;
  beforeEach(() => {
    store = new Store();
  });

  it('notifies subscribers on set', () => {
    const calls = [];
    store.subscribe('selectedWord', (val) => calls.push(val));
    store.selectedWord = 'apple';
    expect(calls).toEqual(['apple']);
  });

  it('returns a subscription object from subscribe', () => {
    const sub = store.subscribe('selectedWord', () => {});
    expect(sub).toHaveProperty('key', 'selectedWord');
    expect(sub).toHaveProperty('listenerIdentifier');
  });

  it('stops notifying after unsubscribe', () => {
    const calls = [];
    const sub = store.subscribe('translation', (val) => calls.push(val));
    store.unsubscribe(sub);
    store.translation = { a: 1 };
    expect(calls).toEqual([]);
  });

  it('throws when subscribing to an unknown key', () => {
    expect(() => store.subscribe('bogus', () => {})).toThrow(/Cannot subscribe/);
  });

  it('throws when unsubscribing an unknown key', () => {
    const sub = store.subscribe('selectedWord', () => {});
    expect(() => store.unsubscribe({ key: 'bogus', listenerIdentifier: sub.listenerIdentifier })).toThrow(/Cannot subscribe/);
  });
});

describe('Store cleanStore', () => {
  it('resets values and drops subscriptions', () => {
    const store = new Store();
    const calls = [];
    store.subscribe('selectedWord', (val) => calls.push(val));
    store.selectedWord = 'apple';
    store.cleanStore();
    expect(store.selectedWord).toBeNull();
    expect(store.currentSpeakerIndex).toBe(-1);
    expect(store.speakers).toEqual([]);
    // old subscriptions dropped
    store.selectedWord = 'pear';
    expect(calls).toEqual(['apple']);
  });
});
