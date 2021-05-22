class PuzzleEnglishDictionaryHost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    this.classList.add('puzzle-english-dictionary-host', 'ped-bubble');
    while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);

    switch (this.getAttribute('type')) {
      case 'show-translate': {
        this.setAttribute(
          'style',
          `position: absolute; left: ${this.getAttribute('positionX')}px; top: ${this.getAttribute(
            'positionY'
          )}px; z-index: 2147483647;`
        );
        const TEMPLATE = document.createElement('template');
        TEMPLATE.innerHTML = `
                        <style>
                            :host {
                                height: 30px;
                                background-color: white;
                                border-radius: 5px;
                                padding-left: 3px;
                                padding-right: 8px;
                                box-shadow: 0 5px 20px 0 rgb(0 0 0 / 30%);
                            }
                        </style>
                        <translate-panel></translate-panel>
                    `;
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

        break;
      }
      case 'initial': {
        this.setAttribute(
          'style',
          `position: absolute; left: ${this.getAttribute('positionX')}px; top: ${this.getAttribute(
            'positionY'
          )}px; z-index: 2147483647;`
        );
        const TEMPLATE = document.createElement('template');
        TEMPLATE.innerHTML = `
                    <style>
                        :host {
                            height: 30px;
                            background-color: white;
                            border-radius: 5px;
                            padding-left: 3px;
                            padding-right: 8px;
                            box-shadow: 0 5px 20px 0 rgb(0 0 0 / 30%);
                        }
                    </style>
                    <initial-buttons></initial-buttons>
                `;
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

        const INITIAL_BUTTONS = this.shadowRoot.querySelector('initial-buttons');
        INITIAL_BUTTONS.addEventListener('fast-add', (event) => console.log('fast-add', event));
        INITIAL_BUTTONS.addEventListener('show-translate', (event) => {
          console.log('show-translate', event);
          this.setAttribute('type', 'show-translate');
        });
        INITIAL_BUTTONS.addEventListener('close-button', (event) => console.log('close-button', event));

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
