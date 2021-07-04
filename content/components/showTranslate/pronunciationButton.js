class PronunciationButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.store = StoreInstance;
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
    CorePuzzleEnglishDictionaryModule.getTextAsset(`/assets/audio-button.svg`).then((svg) => {
      TEMPLATE.innerHTML += svg;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    });
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      const speakers = this.store.translation.word_speakers.slice(0, 8);
      this.store.currentSpeaker = this.store.currentSpeaker === speakers.length - 1 ? 0 : this.store.currentSpeaker + 1;
    });
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('pronunciation-button', PronunciationButton);
