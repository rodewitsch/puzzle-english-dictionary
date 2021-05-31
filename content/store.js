class Store {
  constructor() {
    this._store = {
      selectedWord: {
        value: null,
        subscriptions: new Map()
      },
      translation: {
        value: null,
        subscriptions: new Map()
      },
      currentSpeaker: {
        value: null,
        subscriptions: new Map()
      }
    };
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

  subscribe(key, listener) {
    if (!this._store[key]) throw new Error(`Cannot subscribe. Key "${key}" is not registered`);
    const identifier = Symbol();
    this._store[key].subscriptions.set(identifier, listener);
    return identifier;
  }
}

const StoreInstance = new Store();
