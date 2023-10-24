class OtherMeanings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.WORD = ExtStore.translation.Word.word;
    this.MEANINGS = Object.values({
      ...ExtStore.translation.Word.base_forms,
      ...ExtStore.translation.Word.parts_of_speech
    });

    this.render = async () => {
      const TEMPLATE = document.createElement('template');
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/otherMeanings/otherMeanings.css');
      TEMPLATE.innerHTML = `
              <style>${STYLE}</style>
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
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('other-meanings', OtherMeanings);
