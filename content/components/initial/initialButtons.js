class InitialButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.subscriptions = [ExtStore.subscribe('authorization', () => this.render())];
  }

  render() {
    while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    chrome.storage.sync.get(['fastAdd', 'showTranslate', 'closeButton'], ({ fastAdd, showTranslate, closeButton }) => {
      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML += `
      <style>
        :host{
          display: flex;
          padding-right: 5px;
          padding-left: 3px;
        }
        .disabled {
          cursor: not-allowed;
          filter: grayscale(100%);
        }
      </style>
    `;
      if (fastAdd) {
        TEMPLATE.innerHTML += `<initial-button class="${
          ExtStore.authorization || 'disabled'
        }" type="add"></initial-button>`;
      }
      if (showTranslate) TEMPLATE.innerHTML += '<initial-button type="show"></initial-button>';
      if (closeButton) TEMPLATE.innerHTML += '<initial-button type="close"></initial-button>';
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    });
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }

  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => ExtStore.unsubscribe(subscription));
    }
  }
}

customElements.define('initial-buttons', InitialButtons);
