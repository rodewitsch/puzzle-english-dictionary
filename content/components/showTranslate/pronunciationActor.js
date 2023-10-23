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

    this.render = () => {
      while (this.shadowRoot.lastChild) this.shadowRoot.removeChild(this.shadowRoot.lastChild);
      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = `
            <style>
                :host{
                  height: 80px;
                  width: 30px;
                  margin: 5px 10px 5px 5px;
                  opacity: 0.5;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  cursor: pointer;
                  justify-content: space-between;
                }
                ::selection {
                  background-color: #FF5E6B;
                  color: white;
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
        CorePuzzleEnglishDictionaryModule.getTextAsset(`/assets/flags/${this.speakerInfo.flag}`),
        CorePuzzleEnglishDictionaryModule.getTextAsset(`/assets/faces/${this.speakerInfo.face}`)
      ]).then(([FLAG_SVG, FACE_SVG]) => {
        TEMPLATE.innerHTML += `<div class="flag">${FLAG_SVG}</div><div class="face">${FACE_SVG}</div><div class="name">${this.speakerInfo.name}</div>`;
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      });
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
