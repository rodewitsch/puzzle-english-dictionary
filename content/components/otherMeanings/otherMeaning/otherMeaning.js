/**
 * Custom element for an other meaning of a word.
 * @element other-meaning
 */
class OtherMeaning extends HTMLElement {
  /**
   * Creates an instance of OtherMeaning.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /**
     * Renders the other meaning.
     * @returns {Promise<boolean>} A promise that resolves to true when the other meaning is rendered.
     */
    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/otherMeanings/otherMeaning/otherMeaning.css');
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
        <span>${this.getAttribute('translation')}</span>
      `;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    }
  }

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    this.addEventListener('click', () => {
      ExtStore.translation.Word.translation = this.getAttribute('translation');
      ExtStore.translation.Word.part_of_speech = this.getAttribute('partofspeech');
      ExtStore.translation.Word.article = this.getAttribute('article');
      this.dispatchEvent(
        new CustomEvent('changeviewtype', { bubbles: true, composed: true, detail: 'show-translation' })
      );
    });
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('other-meaning', OtherMeaning);