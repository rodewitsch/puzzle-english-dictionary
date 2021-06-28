class OtherMeanings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line no-undef
    this.store = StoreInstance;

    this.WORD = this.store.translation.Word.word;
    this.MEANINGS = Object.values({
      ...this.store.translation.Word.base_forms,
      ...this.store.translation.Word.parts_of_speech
    });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
            <style>
              :host{
                font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
                display: block;
                padding: 15px;
                width: 360px;
                background-color: #f7f8f8;
              }
              .back {
                  cursor: pointer;
              }
              ul{
                list-style: none;
              }
              li::before{
                content: "–";
                position: absolute;
                left: 40px;
                line-height: 1.5;
              }
              .meanings-part{
                text-transform: capitalize;
              }
              meaning-word{
                cursor: pointer;
              }
              meaning-word:hover{
                color: #309cca;
              }
            </style>
            <div class="back">← Назад</div>
            <p>Значение слова <b>${this.WORD}</b> в данной фразе</p>
            <p><b>Другие значения</b></p>

            ${this.MEANINGS.map((meaning) => {
              const MEANINGS_GROUPS = meaning.values.reduce((acc, value) => {
                if (!acc[value.synonym_group]) {
                  acc[value.synonym_group] = [value];
                } else {
                  acc[value.synonym_group] = [...acc[value.synonym_group], value];
                }
                return acc;
              }, {});
              return `
              <p class="meanings-part">${meaning.part_of_speech_ru}</p>
              ${meaning.article} <b>${meaning.word}</b>
              <ul>
                ${Object.values(MEANINGS_GROUPS)
                  .map(
                    (meaningGroup) =>
                      `<li>${meaningGroup
                        .map(
                          (word) =>
                            `<meaning-word article="${meaning.article}" translation="${word.value}" partofspeech="${meaning.part_of_speech}"></meaning-word>`
                        )
                        .join(', ')}</li>`
                  )
                  .join('')}
              </ul>
            `;
            }).join('')}
        `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    this.shadowRoot.querySelector('.back').addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('changeviewtype', { bubbles: true, composed: true, detail: 'show-translation' })
      );
    });
  }

  changeMeaning(value) {
    console.log(value);
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('other-meanings', OtherMeanings);
