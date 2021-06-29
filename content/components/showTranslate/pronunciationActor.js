class PronunciationActor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line no-undef
    this.speakerInfo = CPEDM.getSpeakerInfo(this.getAttribute('speaker'));
    this.actorNumber = this.getAttribute('actorNumber');
    // eslint-disable-next-line no-undef
    this.store = StoreInstance;
    this.subscriptions = [
      this.store.subscribe('currentSpeaker', (number) => {
        if (number === +this.actorNumber) this.playWord();
      })
    ];
  }

  playWord() {
    // eslint-disable-next-line no-undef
    chrome.runtime.sendMessage({
      type: 'playWord',
      options: { speaker: this.speakerInfo.audio, word: this.store.translation.Word.base_word }
    });
  }

  render() {
    while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
              :host{
                height: 75px;
                width: 30px;
                margin: 5px 10px 5px 5px;
                opacity: 0.5;
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                justify-content: space-between;
              }
              .face {
                width: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .name {
                text-align: center;
                font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
                font-size: 13px;
                color: #777;
              }
          </style>
      `;
    Promise.all([
      // eslint-disable-next-line no-undef
      CPEDM.getTextAsset(`/assets/flags/${this.speakerInfo.flag}`),
      // eslint-disable-next-line no-undef
      CPEDM.getTextAsset(`/assets/faces/${this.speakerInfo.face}`)
    ]).then(([FLAG_SVG, FACE_SVG]) => {
      TEMPLATE.innerHTML += `<div class="flag">${FLAG_SVG}</div><div class="face">${FACE_SVG}</div><div class="name">${this.speakerInfo.name}</div>`;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    });
  }

  connectedCallback() {
    this.addEventListener('click', () => (this.store.currentSpeaker = +this.actorNumber));
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => this.store.unsubscribe('currentSpeaker', subscription));
    }
  }
}

customElements.define('pronunciation-actor', PronunciationActor);
