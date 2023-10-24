class PronunciationSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.speakers = ExtStore.translation.word_speakers.slice(0, 8);

    this.subscriptions = [
      ExtStore.subscribe('currentSpeaker', (number) => {
        const ACTORS = this.shadowRoot.querySelectorAll('pronunciation-actor');
        ACTORS.forEach((actor) => actor.classList.remove('active'));
        ACTORS[number].classList.add('active');
      })
    ];

    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/pronunciationSlider/pronunciationSlider.css');
      TEMPLATE.innerHTML = `
        <style>${STYLE}</style>
      `;

      this.speakers.forEach((speaker, actorNumber) => {
        TEMPLATE.innerHTML += `<pronunciation-actor speaker="${speaker}" actorNumber="${actorNumber}"></pronunciation-actor>`;
      });

      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    }
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }

  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => ExtStore.unsubscribe(subscription));
    }
  }
}

customElements.define('pronunciation-slider', PronunciationSlider);
