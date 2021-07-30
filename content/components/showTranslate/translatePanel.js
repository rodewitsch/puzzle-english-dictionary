class TranslatePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.subscriptions = [ExtStore.subscribe('translation', () => this.render())];
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
          ExtStore.translation.Word.id !== ExtStore.translation.Word.base_word_id
            ? '<current-meaning></current-meaning>'
            : ''
        }
        <div class="base-word-row">
          <base-word></base-word>
          <pronunciation-button></pronunciation-button>
        </div>
        <pronunciation-slider></pronunciation-slider>
        ${ExtStore.authorization && !this.checkWordVocabularyExisting() ? '<add-word></add-word>' : ''}
        ${this.checkWordVocabularyExisting() ? '<div class="already-exists">Слово уже в словаре</div>' : ''}
        ${ExtStore.authorization ? '<dictionary-info></dictionary-info>' : ''}
    `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    return true;
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }

  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => ExtStore.unsubscribe(subscription));
    }
  }

  /**
   * Check the existence of the selected word in the user's dictionary
   * @returns {Boolean}
   */
  checkWordVocabularyExisting() {
    return !!ExtStore.translation.allAddedTranslations.find(
      (addedTranslations) =>
        `${addedTranslations.word}.${addedTranslations.translate}` ===
        `${ExtStore.translation.Word.word}.${ExtStore.translation.Word.translation}`
    );
  }
}

customElements.define('translate-panel', TranslatePanel);
