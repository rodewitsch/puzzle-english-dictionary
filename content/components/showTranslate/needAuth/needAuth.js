class NeedAuth extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

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

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('need-auth', NeedAuth);
