class InitialButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    // eslint-disable-next-line no-undef
    chrome.storage.sync.get(['fastAdd', 'showTranslate', 'closeButton'], ({ fastAdd, showTranslate, closeButton }) => {
      const TEMPLATE = document.createElement('template');
      if (fastAdd) TEMPLATE.innerHTML += '<bubble-button type="add"></bubble-button>';
      if (showTranslate) TEMPLATE.innerHTML += '<bubble-button type="show"></bubble-button>';
      if (closeButton) TEMPLATE.innerHTML += '<bubble-button type="close"></bubble-button>';
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
