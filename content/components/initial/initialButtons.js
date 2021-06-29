class InitialButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line no-undef
    this.store = StoreInstance;
  }

  render() {
    // eslint-disable-next-line no-undef
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
        TEMPLATE.innerHTML += `<bubble-button class="${this.store.authorization || 'disabled'}" type="add"></bubble-button>`;
      }
      if (showTranslate) TEMPLATE.innerHTML += `<bubble-button type="show"></bubble-button>`;
      if (closeButton) TEMPLATE.innerHTML += `<bubble-button type="close"></bubble-button>`;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    });
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('initial-buttons', InitialButtons);
