class PuzzleEnglishDictionaryHost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    this.positionX = this.getAttribute('positionX');
    this.positionY = this.getAttribute('positionY');
    this.viewType = this.getAttribute('type');
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML += `
      <style>
        :host {
          position: absolute;
          left: ${this.positionX}px; 
          top: ${this.positionY}px; 
          z-index: 2147483647;
          height: 30px;
          background-color: white;
          border-radius: 5px;
          padding-left: 3px;
          padding-right: 8px;
          box-shadow: 0 5px 20px 0 rgb(0 0 0 / 30%);
        }
      </style>
    `;

    while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    switch (this.viewType) {
      case 'initial': {
        TEMPLATE.innerHTML += `<initial-buttons></initial-buttons>`;
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        const INITIAL_BUTTONS = this.shadowRoot.querySelector('initial-buttons');
        INITIAL_BUTTONS.addEventListener('bubble-button-add', (event) => console.log('fast-add', event));
        INITIAL_BUTTONS.addEventListener('bubble-button-show', () => this.setAttribute('type', 'show-translate'));
        INITIAL_BUTTONS.addEventListener('bubble-button-close', (event) => console.log('close-button', event));
        break;
      }
      case 'show-translate': {
        TEMPLATE.innerHTML += `<translate-panel></translate-panel>`;
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        break;
      }
    }
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  static get observedAttributes() {
    return ['type'];
  }

  attributeChangedCallback() {
    this.render();
  }
}

customElements.define('puzzle-english-dictionary-host', PuzzleEnglishDictionaryHost);
