class InitialButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.store = StoreInstance;
    this.subscriptions = [this.store.subscribe('authorization', () => this.render())];
  }

  render() {
    while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    chrome.storage.sync.get(['fastAdd', 'showTranslate', 'closeButton'], ({ fastAdd, showTranslate, closeButton }) => {
      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML += `
      <style>
        :host{
          width: 63px;
          display: block;
        }
        .disabled {
          cursor: not-allowed;
          filter: grayscale(100%);
        }
      </style>
    `;
      if (fastAdd) {
        TEMPLATE.innerHTML += `<initial-button class="${
          this.store.authorization || 'disabled'
        }" type="add"></initial-button>`;
      }
      if (showTranslate) TEMPLATE.innerHTML += '<initial-button type="show"></initial-button>';
      if (closeButton) TEMPLATE.innerHTML += '<initial-button type="close"></initial-button>';
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    });
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => this.store.unsubscribe(subscription));
    }
  }
}

customElements.define('initial-buttons', InitialButtons);
