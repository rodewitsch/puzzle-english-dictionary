class TranslatePanel extends HTMLElement {
  constructor() {
    super();
    this.store = StoreInstance;
    this.attachShadow({ mode: 'open' });
    this.subscriptions = [this.store.subscribe('translation', () => this.render())];
  }

  render() {
    while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
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
            .already-exists {
              font-size: 15px;
              font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
              color: #777;
              display: block;
              margin-top: 10px;
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
        ${this.store.authorization && !this.checkWordVocabularyExisting() ? '<add-word></add-word>' : ''}
        ${this.checkWordVocabularyExisting() ? '<div class="already-exists">Слово уже в словаре</div>' : ''}
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

  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => this.store.unsubscribe(subscription));
    }
  }

  checkWordVocabularyExisting() {
    return !!this.store.translation.allAddedTranslations.find(
      (addedTranslations) =>
        `${addedTranslations.word}.${addedTranslations.translate}` ===
        `${this.store.translation.Word.word}.${this.store.translation.Word.translation}`
    );
  }
}

customElements.define('translate-panel', TranslatePanel);
