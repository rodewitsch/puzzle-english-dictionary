/**
 * Custom element for an initial button.
 * @element initial-button
 */
class InitialButton extends HTMLElement {
  /**
   * Creates an instance of InitialButton.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.type = this.getAttribute('type');

    /**
     * Renders the button.
     * @returns {Promise<boolean>} A promise that resolves to true when the button is rendered.
     */
    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('content/components/initial/initialButton/initialButton.css');
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
        <img src="${browser.extension.getURL(`/assets/images/icons/${this.type}.png`)}"></img>
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
      if (this.type === 'add' && !ExtStore.authorization) return;
      this.dispatchEvent(new CustomEvent(`initial-button-${this.type}`, { bubbles: true, composed: true }));
    });
    if (!this.rendered) this.rendered = this.render();
  }

  /**
   * Called when the element is removed from the document.
   */
  disconnectedCallback() { }
}

customElements.define('initial-button', InitialButton);