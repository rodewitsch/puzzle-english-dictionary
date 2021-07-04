class DictionaryInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.store = StoreInstance;
    this.store.translation.dictionaryWordsCount =
      +(this.store.translation.dictionaryWordsCount ||
      (this.store.translation.html.match(/<span>В вашем словаре.*?(\d+).*?<\/span>/) || [])[1]);
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host{
              font-size: 15px;
              font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
              color: #777;
            }
          </style>
          <p>В вашем словаре слов: ${this.store.translation.dictionaryWordsCount}</p>
      `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent(this.getAttribute('cast-event'), { bubbles: true, composed: true }));
    });
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('dictionary-info', DictionaryInfo);
