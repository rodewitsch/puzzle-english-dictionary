class CurrentMeaning extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentMeaning = ExtStore.translation.Word.word;
    this.partOfSpeech = {
      ...ExtStore.translation.Word.base_forms,
      ...ExtStore.translation.Word.parts_of_speech
    }[ExtStore.translation.Word.part_of_speech].description;
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host {
              font-size: 13px;
              font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
              color: #777;
              display: block;
              width: 100%;
              height: 30px;
            }
            p {
              margin: 0;
            }
          </style>
          <p>
            <b>${this.currentMeaning}</b> <span>${this.partOfSpeech || ''}</span>
          </p>
      `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    return true;
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('current-meaning', CurrentMeaning);
