/* eslint-disable no-redeclare */
class Store {
  constructor() {
    this._store = {
      authorization: {
        value: null,
        subscriptions: new Map()
      },
      selectedWord: {
        value: null,
        subscriptions: new Map()
      },
      translation: {
        value: null,
        subscriptions: new Map()
      },
      currentSpeaker: {
        value: -1,
        subscriptions: new Map()
      }
    };
  }

  get authorization() {
    return this._store.authorization.value;
  }

  set authorization(value) {
    this._store.authorization.value = value;
    this._executeSubscriptions('authorization', value);
  }

  get selectedWord() {
    return this._store.selectedWord.value;
  }

  set selectedWord(value) {
    this._store.selectedWord.value = value;
    this._executeSubscriptions('selectedWord', value);
  }

  get translation() {
    return this._store.translation.value;
  }

  set translation(value) {
    this._store.translation.value = value;
    this._executeSubscriptions('translation', value);
  }

  get currentSpeaker() {
    return this._store.currentSpeaker.value;
  }

  set currentSpeaker(value) {
    this._store.currentSpeaker.value = value;
    this._executeSubscriptions('currentSpeaker', value);
  }

  _executeSubscriptions(key, value) {
    if (this._store[key].subscriptions.size) {
      this._store[key].subscriptions.forEach((subscription) => subscription(value));
    }
  }

  cleanStore() {
    this._store = {
      authorization: {
        value: null,
        subscriptions: new Map()
      },
      selectedWord: {
        value: null,
        subscriptions: new Map()
      },
      translation: {
        value: null,
        subscriptions: new Map()
      },
      currentSpeaker: {
        value: -1,
        subscriptions: new Map()
      }
    };
  }

  subscribe(key, listener) {
    if (!this._store[key]) throw new Error(`Cannot subscribe. Key "${key}" is not registered`);
    const listenerIdentifier = Symbol();
    this._store[key].subscriptions.set(listenerIdentifier, listener);
    return {key, listenerIdentifier};
  }

  unsubscribe({key, listenerIdentifier}) {
    if (!this._store[key]) throw new Error(`Cannot subscribe. Key "${key}" is not registered`);
    this._store[key].subscriptions.delete(listenerIdentifier);
  }
}

// eslint-disable-next-line no-unused-vars
const ExtStore = new Store();
