/**
 * Custom element for displaying a pronunciation actor.
 * @element pronunciation-actor
 */
class PronunciationActor extends HTMLElement {
  /**
   * Creates an instance of PronunciationActor.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /**
     * The speaker information.
     * @type {Object}
     * @property {string} audio - The audio file URL.
     * @property {string} flag - The flag image file name.
     * @property {string} face - The face image file name.
     * @property {string} name - The name of the speaker.
     */
    this.speakerInfo = CorePuzzleEnglishDictionaryModule.getSpeakerInfo(this.getAttribute('speaker'));

    /**
     * The actor number.
     * @type {string}
     */
    this.actorNumber = this.getAttribute('actorNumber');

    /**
     * The subscriptions to external events.
     * @type {Array}
     */
    this.subscriptions = [
      ExtStore.subscribe('currentSpeaker', (number) => {
        if (number === +this.actorNumber) this.playWord();
      })
    ];

    /**
     * Plays the word using the speaker's audio file.
     */
    this.playWord = () => {
      browser.runtime.sendMessage({
        type: 'playWord',
        options: { speaker: this.speakerInfo.audio, word: ExtStore.translation.Word.base_word }
      });
    }

    /**
     * Renders the pronunciation actor.
     * @returns {Promise<boolean>} A promise that resolves to true when the pronunciation actor is rendered.
     */
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

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    this.addEventListener('click', () => (ExtStore.currentSpeaker = +this.actorNumber));
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

customElements.define('pronunciation-actor', PronunciationActor);