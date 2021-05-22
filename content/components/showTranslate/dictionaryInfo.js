class DictionaryInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
  
          </style>
          <div>DictionaryInfo</div>
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
