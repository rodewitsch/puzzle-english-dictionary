class AddWord extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

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
