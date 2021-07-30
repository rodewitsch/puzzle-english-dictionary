class PronunciationButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
    return true;
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      const speakers = ExtStore.translation.word_speakers.slice(0, 8);
      ExtStore.currentSpeaker = ExtStore.currentSpeaker === speakers.length - 1 ? 0 : ExtStore.currentSpeaker + 1;
    });
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('pronunciation-button', PronunciationButton);
