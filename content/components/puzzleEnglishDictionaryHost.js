class PuzzleEnglishDictionaryHost extends HTMLElement {
  constructor() {
    super();
    // eslint-disable-next-line no-undef
    this.store = StoreInstance;
    this.attachShadow({ mode: 'open' });
  }

  async render() {
    this.positionX = this.getAttribute('position-x');
    this.positionY = this.getAttribute('position-y');
    this.viewType = this.getAttribute('type');
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML += `
      <style>
        :host {
          position: absolute;
          left: ${this.positionX}px; 
          top: ${this.positionY}px; 
          z-index: 2147483647;
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
        INITIAL_BUTTONS.addEventListener('bubble-button-show', () => this.setAttribute('type', 'show-translation'));
        INITIAL_BUTTONS.addEventListener('bubble-button-close', (event) => console.log('close-button', event));
        break;
      }
      case 'show-translation': {
        this.store.translation = await this.getTranslation();
        TEMPLATE.innerHTML += `<translate-panel></translate-panel>`;
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        break;
      }
      case 'other-meanings': {
        TEMPLATE.innerHTML += `<div>Другие значения</div>`;
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        break;
      }
    }

    this.shadowRoot.addEventListener('changeviewtype', () => this.setAttribute('type', 'other-meanings'));
    // TODO: отписаться от событий при разрушении компонента
  }

  getTranslation() {
    return new Promise((resolve) => {
      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(
        { type: 'checkWord', options: { word: this.store.selectedWord } },
        async (response) => {
          if (!response.Word.id) {
            // TODO: отрисовать компонент не найденого перевода
            console.log('Перевод не найден');
            return resolve();
          }
          return resolve(response);
        }
      );
    });
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
