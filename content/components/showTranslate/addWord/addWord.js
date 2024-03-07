/**
 * Custom element for adding a word to the dictionary.
 * @element add-word
 */
class AddWord extends HTMLElement {
  /**
   * Creates an instance of AddWord.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /**
     * Renders the add word button.
     * @returns {Promise<boolean>} A promise that resolves to true when the add word button is rendered.
     */
    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/addWord/addWord.css');
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
        <div class="button success">
          <span class="plus">+</span>
          <span>в словарь</span>
        </div>
      `;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    }
  }

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    this.addEventListener('click', async () => {
      await browser.runtime.sendMessage(
        {
          type: 'addWord',
          options: {
            word: ExtStore.translation.Word.word,
            translation: ExtStore.translation.Word.translation,
            partOfSpeech: ExtStore.translation.Word.part_of_speech
          }
        }
      );
      ExtStore.translation.dictionaryWordsCount += 1;
      ExtStore.translation = {
        ...ExtStore.translation,
        allAddedTranslations: [
          ...ExtStore.translation.allAddedTranslations,
          {
            word: ExtStore.translation.Word.word,
            translate: ExtStore.translation.Word.translation
          }
        ]
      };
    });
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('add-word', AddWord);