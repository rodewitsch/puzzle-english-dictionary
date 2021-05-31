/** CorePuzzleEnglishDictionaryModule alias */
// eslint-disable-next-line no-undef
class PronunciationButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line no-undef
    this.CPEDM = CorePuzzleEnglishDictionaryModule;
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host {
              cursor: pointer;
            }
          </style>
      `;
    this.CPEDM.getTextAsset(`/assets/audio-button.svg`).then((svg) => {
      TEMPLATE.innerHTML += svg;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    });
  }

  connectedCallback() {
    console.log('pronunciation-button');
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('pronounce-word', { bubbles: true, composed: true }));
    });
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('pronunciation-button', PronunciationButton);
