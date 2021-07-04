class PuzzleEnglishDictionaryHost extends HTMLElement {
  constructor() {
    super();
    this.store = StoreInstance;
    this.attachShadow({ mode: 'open' });
    if (!this.store.authorization) {
      chrome.runtime.sendMessage({ type: 'checkAuth' }, null, ({ auth }) => (this.store.authorization = auth));
    }
  }

  async render() {
    const positionX =
      this.getAttribute('type') !== 'initial' && +this.getAttribute('position-x') + 360 > window.innerWidth
        ? +this.getAttribute('position-x') + (window.innerWidth - +this.getAttribute('position-x') - 420)
        : this.getAttribute('position-x');
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML += `
      <style>
        :host {
          all: initial;
          position: absolute;
          left: ${positionX}px; 
          top: ${this.getAttribute('position-y')}px; 
          z-index: 2147483647;
          background-color: white;
          border-radius: 5px;
          box-shadow: 0 5px 20px 0 rgb(0 0 0 / 30%);
        }
      </style>
    `;

    while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    switch (this.getAttribute('type')) {
      case 'initial': {
        TEMPLATE.innerHTML += '<initial-buttons></initial-buttons>';
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        const INITIAL_BUTTONS = this.shadowRoot.querySelector('initial-buttons');
        if (this.store.authorization) {
          INITIAL_BUTTONS.addEventListener('initial-button-add', (event) => console.log('fast-add', event), {
            once: true
          });
        }
        INITIAL_BUTTONS.addEventListener('initial-button-show', async () => {
          this.store.translation = await this.getTranslation();
          this.setAttribute('type', 'show-translation'), { once: true };
        });
        INITIAL_BUTTONS.addEventListener('initial-button-close', () => this.remove(), {
          once: true
        });
        break;
      }
      case 'show-translation': {
        TEMPLATE.innerHTML += this.store.translation
          ? '<translate-panel></translate-panel>'
          : '<no-translation></no-translation>';
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        break;
      }
      case 'other-meanings': {
        TEMPLATE.innerHTML += '<other-meanings></other-meanings>';
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        break;
      }
    }

    this.shadowRoot.addEventListener('changeviewtype', (event) => this.setAttribute('type', event.detail), {
      once: true
    });
  }

  getTranslation() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'checkWord', options: { word: this.store.selectedWord } },
        async (response) => {
          if (!response.Word.id) return resolve(null);
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

  disconnectedCallback() {
    this.store.cleanStore();
  }

  static get observedAttributes() {
    return ['type'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this.render();
  }
}

customElements.define('puzzle-english-dictionary-host', PuzzleEnglishDictionaryHost);
