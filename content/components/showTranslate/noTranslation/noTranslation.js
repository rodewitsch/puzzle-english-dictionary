/**
 * Custom element for displaying a message that no translation was found.
 * @element no-translation
 */
class NoTranslation extends HTMLElement {
  /**
   * Creates an instance of NoTranslation.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /**
     * Renders the no translation message.
     * @returns {Promise<boolean>} A promise that resolves to true when the no translation message is rendered.
     */
    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/noTranslation/noTranslation.css');
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
        <span>Перевод слова не найден</span>
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

customElements.define('no-translation', NoTranslation);