class PronunciationSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line no-undef
    this.store = StoreInstance;
    this.speakers = this.store.translation.word_speakers.splice(0, 8);

    this.store.subscribe('currentSpeaker', (number) => {
      const ACTORS = this.shadowRoot.querySelectorAll('pronunciation-actor');
      ACTORS.forEach((actor) => actor.classList.remove('active'));
      ACTORS[number].classList.add('active');
    });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host {
              display: flex;
              justify-content: left;
              align-items: center;
            }
            pronunciation-actor{
              opacity: 0.5;
            }
            pronunciation-actor:hover,pronunciation-actor.active{
              opacity: 1;
            }
          </style>
          ${this.speakers
            .map(
              (speaker, actorNumber) =>
                `<pronunciation-actor speaker="${speaker}" actorNumber="${actorNumber}"></pronunciation-actor>`
            )
            .join('')}
      `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('pronunciation-slider', PronunciationSlider);
