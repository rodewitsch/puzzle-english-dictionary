class NoTranslation extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host{
              font-size: 15px;
              font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
              color: #777;
              margin: 15px;
              display: block;
            }
          </style>
          <span>Перевод слова не найден</span>
      `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    return true;
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('no-translation', NoTranslation);
