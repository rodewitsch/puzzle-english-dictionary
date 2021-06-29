class TranslatePanel extends HTMLElement {
  constructor() {
    super();
    // eslint-disable-next-line no-undef
    this.store = StoreInstance;
    this.attachShadow({ mode: 'open' });
    this.addEventListener('click', () => {});
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
        <style>
            :host {
              display: block;
              width: 360px;
              padding: 15px 10px;
            }
            .base-word-row {
              display: flex;
              justify-content: space-between;
              height: 50px;
            }
            .disabled {
              cursor: not-allowed;
              filter: grayscale(100%);
            }
        </style>

        ${
          this.store.translation.Word.id !== this.store.translation.Word.base_word_id
            ? '<current-meaning></current-meaning>'
            : ''
        }
        <div class="base-word-row">
          <base-word></base-word>
          <pronunciation-button></pronunciation-button>
        </div>
        <pronunciation-slider></pronunciation-slider>
        ${this.store.authorization ? '<add-word></add-word>' : ''}
        ${this.store.authorization ? '<dictionary-info></dictionary-info>' : ''}
    `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  disconnectedCallback() {}
}

customElements.define('translate-panel', TranslatePanel);
