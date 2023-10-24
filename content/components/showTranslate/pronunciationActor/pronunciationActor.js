class PronunciationActor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.speakerInfo = CorePuzzleEnglishDictionaryModule.getSpeakerInfo(this.getAttribute('speaker'));
    this.actorNumber = this.getAttribute('actorNumber');
    this.subscriptions = [
      ExtStore.subscribe('currentSpeaker', (number) => {
        if (number === +this.actorNumber) this.playWord();
      })
    ];

    this.playWord = () => {
      browser.runtime.sendMessage({
        type: 'playWord',
        options: { speaker: this.speakerInfo.audio, word: ExtStore.translation.Word.base_word }
      });
    }

    this.render = async () => {
      while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
      const TEMPLATE = document.createElement('template');
      const [STYLE, FLAG_SVG, FACE_SVG] = await Promise.all([
        CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/pronunciationActor/pronunciationActor.css'),
        CorePuzzleEnglishDictionaryModule.getTextAsset(`/assets/flags/${this.speakerInfo.flag}`),
        CorePuzzleEnglishDictionaryModule.getTextAsset(`/assets/faces/${this.speakerInfo.face}`)
      ]);
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
        <div class="flag">${FLAG_SVG}</div>
        <div class="face">${FACE_SVG}</div>
        <div class="name">${this.speakerInfo.name}</div>
      `;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    }
  }

  connectedCallback() {
    this.addEventListener('click', () => (ExtStore.currentSpeaker = +this.actorNumber));
    if (!this.rendered) this.rendered = this.render();
  }

  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => ExtStore.unsubscribe(subscription));
    }
  }
}

customElements.define('pronunciation-actor', PronunciationActor);
