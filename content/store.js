class Store {
  #store = {
    selectedWord: {
      value: null,
      subscriptions: new Map()
    },
    translate: {
      value: null,
      subscriptions: new Map()
    },
    subscribeTest: {
      value: null,
      subscriptions: new Map()
    }
  };

  get selectedWord() {
    return this.#store.selectedWord.value;
  }

  set selectedWord(value) {
    this.#store.selectedWord.value = value;
  }

  get translate() {
    return this.#store.translate.value;
  }

  set translate(value) {
    this.#store.translate.value = value;
  }

  get subscribeTest() {
    return this.#store.subscribeTest.value;
  }

  set subscribeTest(value) {
    this.#store.subscribeTest.value = value;
    if (this.#store.subscribeTest.subscriptions.size) {
      this.#store.subscribeTest.subscriptions.forEach((subscription) => subscription(value));
    }
  }

  subscribe(key, listener) {
    if (!this.#store[key]) throw new Error(`Cannot subscribe. Key "${key}" is not registered`);
    const identifier = Symbol();
    this.#store[key].subscriptions.set(identifier, listener);
    return identifier;
  }
}

const StoreInstance = new Store();
