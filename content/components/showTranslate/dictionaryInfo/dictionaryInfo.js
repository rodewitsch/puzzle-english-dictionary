class DictionaryInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    ExtStore.translation.dictionaryWordsCount =
      +(ExtStore.translation.dictionaryWordsCount ||
        (ExtStore.translation.html.match(/<span>В вашем словаре.*?(\d+).*?<\/span>/) || [])[1]);

    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/dictionaryInfo/dictionaryInfo.css');
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
        <p>В вашем словаре слов: ${ExtStore.translation.dictionaryWordsCount}</p>
      `;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    }
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('dictionary-info', DictionaryInfo);
