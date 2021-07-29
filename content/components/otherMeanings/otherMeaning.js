class OtherMeaning extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
      ExtStore.translation.Word.translation = this.getAttribute('translation');
      ExtStore.translation.Word.part_of_speech = this.getAttribute('partofspeech');
      ExtStore.translation.Word.article = this.getAttribute('article');
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

customElements.define('other-meaning', OtherMeaning);
