/**
 * Custom element for displaying the translation panel.
 * @element translate-panel
 */
class TranslatePanel extends HTMLElement {
  /**
   * Creates an instance of TranslatePanel.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /**
     * The subscriptions to external events.
     * @type {Array}
     */
    this.subscriptions = [ExtStore.subscribe('translation', () => this.render())];

    /**
     * Renders the translation panel.
     * @returns {Promise<boolean>} A promise that resolves to true when the translation panel is rendered.
     */
    this.render = async () => {
      while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/translatePanel/translatePanel.css');

      TEMPLATE.innerHTML = `<style>${STYLE}</style>`;

      if (ExtStore.translation.Word.id !== ExtStore.translation.Word.base_word_id) {
        TEMPLATE.innerHTML += '<current-meaning></current-meaning>';
      }

      TEMPLATE.innerHTML += `
        <div class="base-word-row">
          <base-word></base-word>
          <pronunciation-button></pronunciation-button>
        </div>
        <pronunciation-slider></pronunciation-slider>
      `;

      if (ExtStore.authorization && !this.checkWordVocabularyExisting()) {
        TEMPLATE.innerHTML += '<add-word></add-word>';
      }

      if (this.checkWordVocabularyExisting()) {
        const SUCCESS_SVG = await CorePuzzleEnglishDictionaryModule.getTextAsset(`/assets/images/success.svg`);
        TEMPLATE.innerHTML += `
          <div class="already-exists">
            ${SUCCESS_SVG} <span>Добавлено в словарь с этим переводом</span>
          </div>
          <div class="additional-buttons">
            <span class="button">Отменить</span>    
            <a class="link" href="https://puzzle-english.com/dictionary" target="blank">Перейти в словарь</a>
          </div>
        `;
      }

      if (ExtStore.authorization) {
        TEMPLATE.innerHTML += '<dictionary-info></dictionary-info>';
      } else {
        TEMPLATE.innerHTML += '<need-auth></need-auth>';
      }

      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

      const CANCEL_BUTTON = this.shadowRoot.querySelector('.additional-buttons .button');
      if (!CANCEL_BUTTON) return true;
      CANCEL_BUTTON.addEventListener('click', async () => {
        await browser.runtime.sendMessage(
          {
            type: 'deleteWord',
            options: {
              id: ExtStore.translation.Word.id,
              translation: ExtStore.translation.Word.translation
            }
          }
        );
        ExtStore.translation.dictionaryWordsCount -= 1;
        ExtStore.translation = {
          ...ExtStore.translation,
          allAddedTranslations: ExtStore.translation.allAddedTranslations.filter(
            (addedTranslations) =>
              `${addedTranslations.word}.${addedTranslations.translate} ` !==
              `${ExtStore.translation.Word.word}.${ExtStore.translation.Word.translation} `
          )
        };
      });
      return true;
    }

    /**
     * Checks if the word exists in the user's vocabulary.
     * @returns {boolean} True if the word exists in the user's vocabulary, false otherwise.
     */
    this.checkWordVocabularyExisting = () => {
      return !!ExtStore.translation.allAddedTranslations.find(
        (addedTranslations) =>
          `${addedTranslations.word}.${addedTranslations.translate} ` ===
          `${ExtStore.translation.Word.word}.${ExtStore.translation.Word.translation} `
      );
    }
  }

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }

  /**
   * Called when the element is removed from the document.
   */
  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => ExtStore.unsubscribe(subscription));
    }
  }
}

customElements.define('translate-panel', TranslatePanel);