class TranslatePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.subscriptions = [ExtStore.subscribe('translation', () => this.render())];

    this.render = async () => {
      while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
      const TEMPLATE = document.createElement('template');

      TEMPLATE.innerHTML = `
          <style>
              :host {
                display: block;
                width: 360px;
                padding: 15px 10px;
                min-height: 230px;
              }
              .base-word-row {
                display: flex;
                justify-content: space-between;
                min-height: 50px;
              }
              .disabled {
                cursor: not-allowed;
                filter: grayscale(100%);
              }
              .already-exists {
                font-size: 15px;
                font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
                display: flex;
                margin-top: 10px;
                color: #74b071;
                margin-right: 10px;
                align-items: center;
              }
              .already-exists svg {
                width: 28px;
                height: 28px;
                margin-right: 10px;
              }
              .button {
                color: #818181;
                font-size: 14px;
                border-bottom: 1px dotted #818181;
                cursor: pointer;
                font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;
              }
              .link {
                color: #4594d1;
                font-size: 14px;
                cursor: pointer;
                font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;
              }
              .link:hover {
                text-decoration: none;
              }
              .additional-buttons {
                margin-top: 10px;
              }
              .additional-buttons span {
                margin-right: 10px;
              }
          </style>
  
          ${ExtStore.translation.Word.id !== ExtStore.translation.Word.base_word_id
          ? '<current-meaning></current-meaning>'
          : ''
        }
          <div class="base-word-row">
            <base-word></base-word>
            <pronunciation-button></pronunciation-button>
          </div>
          <pronunciation-slider></pronunciation-slider>
          ${ExtStore.authorization && !this.checkWordVocabularyExisting() ? '<add-word></add-word>' : ''}
          ${this.checkWordVocabularyExisting()
          ? `<div class="already-exists">${await CorePuzzleEnglishDictionaryModule.getTextAsset(`/assets/images/success.svg`)} <span>Добавлено в словарь с этим переводом</span></div>`
          : ''}
          ${this.checkWordVocabularyExisting()
            ? '<div class="additional-buttons"><span class="button">Отменить</span>    <a class="link" href="https://puzzle-english.com/dictionary" target="blank">Перейти в словарь</a></div>'
            : ''}
          ${ExtStore.authorization ? '<dictionary-info></dictionary-info>' : '<need-auth></need-auth>'}
      `;


      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

      const CANCEL_BUTTON = this.shadowRoot.querySelector('.additional-buttons .button');
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
              `${addedTranslations.word}.${addedTranslations.translate}` !==
              `${ExtStore.translation.Word.word}.${ExtStore.translation.Word.translation}`
          )
        };
      });
      return true;
    }

    /**
     * Check the existence of the selected word in the user's dictionary
     * @returns {Boolean}
     */
    this.checkWordVocabularyExisting = () => {
      return !!ExtStore.translation.allAddedTranslations.find(
        (addedTranslations) =>
          `${addedTranslations.word}.${addedTranslations.translate}` ===
          `${ExtStore.translation.Word.word}.${ExtStore.translation.Word.translation}`
      );
    }
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

customElements.define('translate-panel', TranslatePanel);
