/**
 * Custom element for displaying a pronunciation slider.
 * @element pronunciation-slider
 */
class PronunciationSlider extends HTMLElement {
  /**
   * Creates an instance of PronunciationSlider.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /**
     * The speakers for the current word.
     * @type {Array}
     */
    this.speakers = ExtStore.translation.word_speakers.slice(0, 8);

    /**
     * The subscriptions to external events.
     * @type {Array}
     */
    this.subscriptions = [
      ExtStore.subscribe('currentSpeaker', (number) => {
        const ACTORS = this.shadowRoot.querySelectorAll('pronunciation-actor');
        ACTORS.forEach((actor) => actor.classList.remove('active'));
        ACTORS[number].classList.add('active');
      })
    ];

    /**
     * Renders the pronunciation slider.
     * @returns {Promise<boolean>} A promise that resolves to true when the pronunciation slider is rendered.
     */
    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/pronunciationSlider/pronunciationSlider.css');
      TEMPLATE.innerHTML = `<style>${STYLE}</style>`;

      this.speakers.forEach((speaker, actorNumber) => {
        TEMPLATE.innerHTML += `<pronunciation-actor speaker="${speaker}" actorNumber="${actorNumber}"></pronunciation-actor>`;
      });

      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    }
  }

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }

  /**
   * Called when the element is removed from the document.
   */
  disconnectedCallback() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => ExtStore.unsubscribe(subscription));
    }
  }
}

customElements.define('pronunciation-slider', PronunciationSlider);