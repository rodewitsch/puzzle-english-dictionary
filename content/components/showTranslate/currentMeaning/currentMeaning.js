class CurrentMeaning extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentMeaning = ExtStore.translation.Word.word;
    this.partOfSpeech = {
      ...ExtStore.translation.Word.base_forms,
      ...ExtStore.translation.Word.parts_of_speech
    }[ExtStore.translation.Word.part_of_speech].description;

    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/showTranslate/currentMeaning/currentMeaning.css');
      TEMPLATE.innerHTML = `
            <style>${STYLE}</style>
            <p><b>${this.currentMeaning}</b> <span>${this.partOfSpeech || ''}</span></p>
        `;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    }
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('current-meaning', CurrentMeaning);
