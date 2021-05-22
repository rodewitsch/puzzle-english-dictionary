class TranslatePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
        <style>

        </style>
        <current-meaning></current-meaning>
        <pronunciation-button></pronunciation-button>
        <pronunciation-slider></pronunciation-slider>
        <add-word></add-word>
        <dictionary-info></dictionary-info>
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

customElements.define('translate-panel', TranslatePanel);
