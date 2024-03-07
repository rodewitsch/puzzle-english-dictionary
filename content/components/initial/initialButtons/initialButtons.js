/**
 * Custom element for initial buttons.
 * @element initial-buttons
 */
class InitialButtons extends HTMLElement {
  /**
   * Creates an instance of InitialButtons.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.subscriptions = [ExtStore.subscribe('authorization', () => this.render())];

    /**
     * Renders the initial buttons.
     * @returns {Promise<boolean>} A promise that resolves to true when the buttons are rendered.
     */
    this.render = async () => {
      const { fastAdd, showTranslate, closeButton } = await chrome.storage.sync.get(['fastAdd', 'showTranslate', 'closeButton']);
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('content/components/initial/initialButtons/initialButtons.css');
      TEMPLATE.innerHTML = `<style>${STYLE}</style>`;
      if (fastAdd) {
        TEMPLATE.innerHTML += `<initial-button class="${ExtStore.authorization || 'disabled'}" type="add"></initial-button>`;
      }
      if (showTranslate) TEMPLATE.innerHTML += '<initial-button type="show"></initial-button>';
      if (closeButton) TEMPLATE.innerHTML += '<initial-button type="close"></initial-button>';
      while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
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

  /**
   * Called when the element is removed from the document.
   */
  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => ExtStore.unsubscribe(subscription));
    }
  }
}

customElements.define('initial-buttons', InitialButtons);