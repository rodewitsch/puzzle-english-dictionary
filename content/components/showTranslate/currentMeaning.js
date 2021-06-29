class CurrentMeaning extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line no-undef
    this.store = StoreInstance;
    this.currentMeaning = this.store.translation.Word.word;
    this.partOfSpeech = {
      ...this.store.translation.Word.base_forms,
      ...this.store.translation.Word.parts_of_speech
    }[this.store.translation.Word.part_of_speech].description;
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
            <b>${this.currentMeaning}</b> <span>${this.partOfSpeech}</span>
          </p>
      `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent(this.getAttribute('cast-event'), { bubbles: true, composed: true }));
    });
    
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('current-meaning', CurrentMeaning);
