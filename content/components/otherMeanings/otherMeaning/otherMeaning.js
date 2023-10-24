class OtherMeaning extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

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
