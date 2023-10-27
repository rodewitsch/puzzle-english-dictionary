/**
 * Custom element for displaying a message that authentication is required.
 * @element need-auth
 */
class NeedAuth extends HTMLElement {
  /**
   * Creates an instance of NeedAuth.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /**
     * Renders the authentication message.
     * @returns {Promise<boolean>} A promise that resolves to true when the authentication message is rendered.
     */
    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/needAuth/needAuth.css');
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
        <div>
          Для добавления слов в словарь необходимо <a href="https://puzzle-english.com/" target="blank">авторизоваться</a>
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
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('need-auth', NeedAuth);