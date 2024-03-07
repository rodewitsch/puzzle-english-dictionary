/**
 * Custom element for displaying the base word and translation.
 * @element base-word
 */
class BaseWord extends HTMLElement {
  /**
   * Creates an instance of BaseWord.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /**
     * Renders the base word and translation.
     * @returns {Promise<boolean>} A promise that resolves to true when the base word and translation are rendered.
     */
    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/baseWord/baseWord.css');
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
        <p>
          <span>${ExtStore.translation.Word.article || ''}</span> <b>${ExtStore.translation.Word.base_word}</b> - <span>${ExtStore.translation.Word.translation}</span>
        </p>
        <p class="other-meanings">Другие значения</p>
        `;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      this.shadowRoot.querySelector('.other-meanings').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('changeviewtype', { bubbles: true, composed: true, detail: 'other-meanings' }));
      });
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

customElements.define('base-word', BaseWord);