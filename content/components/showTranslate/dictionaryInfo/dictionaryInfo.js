/**
 * Custom element for displaying dictionary information.
 * @element dictionary-info
 */
class DictionaryInfo extends HTMLElement {
  /**
   * Creates an instance of DictionaryInfo.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    ExtStore.translation.dictionaryWordsCount =
      +(ExtStore.translation.dictionaryWordsCount ||
        (ExtStore.translation.html.match(/<span>В вашем словаре.*?(\d+).*?<\/span>/) || [])[1]);

    /**
     * Renders the dictionary information.
     * @returns {Promise<boolean>} A promise that resolves to true when the dictionary information is rendered.
     */
    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/dictionaryInfo/dictionaryInfo.css');
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
        <p>В вашем словаре слов: ${ExtStore.translation.dictionaryWordsCount}</p>
      `;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    }
  }

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('dictionary-info', DictionaryInfo);