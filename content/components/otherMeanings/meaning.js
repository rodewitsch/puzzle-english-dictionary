class Meaning extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line no-undef
    this.store = StoreInstance;
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host{
              font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
            }
          </style>
          <span>${this.getAttribute('translation')}</span>
      `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      this.store.translation.Word.translation = this.getAttribute('translation');
      this.store.translation.Word.partOfSpeech = this.getAttribute('partofspeech');
      this.store.translation.Word.article = this.getAttribute('article');
      this.dispatchEvent(
        new CustomEvent('changeviewtype', { bubbles: true, composed: true, detail: 'show-translation' })
      );
    });
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('meaning-word', Meaning);
