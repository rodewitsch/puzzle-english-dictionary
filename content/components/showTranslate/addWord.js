class AddWord extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.render = () => {
      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = `
              <style>
                :host{
                  font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
                  display: block;
                  margin-top: 5px;
                }
                ::selection {
                  background-color: transparent;
                  color: white;
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
      return true;
    }
  }



  connectedCallback() {
    this.addEventListener('click', async () => {
      await browser.runtime.sendMessage(
        {
          type: 'addWord',
          options: {
            word: ExtStore.translation.Word.word,
            translation: ExtStore.translation.Word.translation,
            partOfSpeech: ExtStore.translation.Word.part_of_speech
          }
        }
      );
      ExtStore.translation.dictionaryWordsCount += 1;
      ExtStore.translation = {
        ...ExtStore.translation,
        allAddedTranslations: [
          ...ExtStore.translation.allAddedTranslations,
          {
            word: ExtStore.translation.Word.word,
            translate: ExtStore.translation.Word.translation
          }
        ]
      };
    });
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('add-word', AddWord);
