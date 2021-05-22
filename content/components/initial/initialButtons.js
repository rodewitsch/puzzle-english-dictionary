class InitialButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    // eslint-disable-next-line no-undef
    chrome.storage.sync.get(['fastAdd', 'showTranslate', 'closeButton'], (items) => {
      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = `
        ${items.fastAdd ? '<bubble-button cast-event="fast-add" background-image="add"></bubble-button>' : ''}
        ${
          items.showTranslate
            ? '<bubble-button cast-event="show-translate" background-image="show"></bubble-button>'
            : ''
        }
        ${items.closeButton ? '<bubble-button cast-event="close-button" background-image="close"></bubble-button>' : ''}
        `;
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

