class PuzzleEnglishDictionaryHost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    if (!ExtStore.authorization) this.checkAuth();
  }

  async render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML += `
      <style>
        :host {
          all: initial;
          position: absolute;
          left: ${this.calculatePositionX()}px; 
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
        INITIAL_BUTTONS.addEventListener('initial-button-add', () => this.addWordListener(), { once: true });
        INITIAL_BUTTONS.addEventListener('initial-button-show', () => this.showTranslationsListener(), { once: true });
        INITIAL_BUTTONS.addEventListener('initial-button-close', () => this.closeBubbleListener(), { once: true });
        break;
      }
      case 'show-translation': {
        TEMPLATE.innerHTML += ExtStore.translation
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

    this.shadowRoot.addEventListener('changeviewtype', (event) => this.changeViewTypeListener(event));
  }

  /**
   * Dispatch the event to check authorization
   */
  checkAuth() {
    chrome.runtime.sendMessage(
      { type: 'checkAuth', options: { word: ExtStore.selectedWord } },
      null,
      ({ auth }) => (ExtStore.authorization = auth)
    );
  }

  /**
   * Calculate offset from the right side of a window
   * @returns {Number}
   */
  calculatePositionX() {
    let positionX = this.getAttribute('position-x');
    if (this.getAttribute('type') !== 'initial' && +this.getAttribute('position-x') + 360 > window.innerWidth) {
      positionX = +this.getAttribute('position-x') + (window.innerWidth - +this.getAttribute('position-x') - 420);
    }
    if (this.getAttribute('type') === 'initial' && +this.getAttribute('position-x') + 60 > window.innerWidth) {
      positionX = +this.getAttribute('position-x') + (window.innerWidth - +this.getAttribute('position-x') - 90);
    }
    return positionX;
  }

  /**
   * Simple adding a selected word to a dictionary
   */
  addWordListener() {
    chrome.runtime.sendMessage({ type: 'simpleAddWord', options: { word: ExtStore.selectedWord } }, async () =>
      this.remove()
    );
  }

  /**
   * Get selected word translations and change the view type
   */
  async showTranslationsListener() {
    chrome.runtime.sendMessage({ type: 'checkWord', options: { word: ExtStore.selectedWord } }, async (response) => {
      ExtStore.translation = !response.Word.id ? null : response;
      this.setAttribute('type', 'show-translation');
    });
  }

  /**
   * Close the translations panel
   */
  closeBubbleListener() {
    this.remove();
  }

  /**
   * Change the view type
   * @param {HTMLEvent} event
   */
  changeViewTypeListener(event) {
    this.setAttribute('type', event.detail);
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  disconnectedCallback() {
    ExtStore.cleanStore();
  }

  static get observedAttributes() {
    return ['type'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this.render();
  }
}

customElements.define('puzzle-english-dictionary-host', PuzzleEnglishDictionaryHost);
