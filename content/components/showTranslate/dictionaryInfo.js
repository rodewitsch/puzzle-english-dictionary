class DictionaryInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    ExtStore.translation.dictionaryWordsCount =
      +(ExtStore.translation.dictionaryWordsCount ||
        (ExtStore.translation.html.match(/<span>В вашем словаре.*?(\d+).*?<\/span>/) || [])[1]);

    this.render = () => {
      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = `
              <style>
                :host{
                  font-size: 15px;
                  font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
                  color: #777;
                }
              </style>
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
