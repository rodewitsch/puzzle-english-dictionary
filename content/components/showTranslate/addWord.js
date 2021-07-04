class AddWord extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.store = StoreInstance;
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host{
              font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
              display: block;
              margin-top: 5px;
            }
            .button {
              cursor: pointer;
              padding: 0 20px;
              width: 100px;
              height: 40px;
              border-radius: 3px;
              color: white;
              display: flex;
              justify-content: space-around;
              align-items: center;
              font-size: 15px;
            }
            .button .plus {
              font-size: 30px;
            }
            .success{
              background-color: #85d360;
            }
          </style>
          <div class="button success">
            <span class="plus">+</span>
            <span>в словарь</span>
          </div>
      `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      chrome.runtime.sendMessage(
        {
          type: 'addWord',
          options: {
            word: this.store.translation.Word.word,
            translation: this.store.translation.Word.translation,
            partOfSpeech: this.store.translation.Word.part_of_speech
          }
        },
        () => {
          this.store.translation = {
            ...this.store.translation,
            allAddedTranslations: [
              ...this.store.translation.allAddedTranslations,
              {
                word: this.store.translation.Word.word,
                translate: this.store.translation.Word.translation
              }
            ]
          };
        }
      );
    });
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('add-word', AddWord);
