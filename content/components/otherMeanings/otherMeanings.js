class OtherMeanings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.WORD = ExtStore.translation.Word.word;
    this.MEANINGS = Object.values({
      ...ExtStore.translation.Word.base_forms,
      ...ExtStore.translation.Word.parts_of_speech
    });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
            <style>
              :host{
                font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
                display: block;
                padding: 15px 10px;
                width: 360px;
                background-color: #f7f8f8;
                color: #777;
                font-size: 13px;
                line-height: 1.5em;
                border-radius: 5px;
              }
              .back {
                cursor: pointer;
                display: block;
                margin-bottom: 10px;
                font-weight: bold;
              }
              .meaning-phrase-header {
                background-color: white;
                padding: 15px 10px;
                font-size: 15px;
                margin-left: -10px;
                margin-right: -10px;
             }
             .meaning-header {
              font-size: 15px;
             }
              ul{
                list-style: none;
                padding-left: 20px;
              }
              li::before{
                content: "–";
                position: absolute;
                left: 20px;
                line-height: 1.5;
              }
              .meanings-part{
                text-transform: capitalize;
              }
              other-meaning{
                cursor: pointer;
              }
              other-meaning:hover{
                color: #309cca;
              }
            </style>
            <div class="back">← Назад</div>
            <p class="meaning-phrase-header">Значение слова <b>${this.WORD}</b> в данной фразе</p>
            <p class="meaning-header"><b>Другие значения</b></p>

            ${this.MEANINGS.filter((meaning) => meaning.values)
              .map((meaning) => {
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
                            `<other-meaning article="${meaning.article}" translation="${word.value}" partofspeech="${meaning.part_of_speech}"></other-meaning>`
                        )
                        .join(', ')}</li>`
                  )
                  .join('')}
              </ul>
            `;
              })
              .join('')}
        `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    this.shadowRoot.querySelector('.back').addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('changeviewtype', { bubbles: true, composed: true, detail: 'show-translation' })
      );
    });
    return true;
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('other-meanings', OtherMeanings);
