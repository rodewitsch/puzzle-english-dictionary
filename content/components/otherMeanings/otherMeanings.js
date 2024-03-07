/**
 * Custom element for displaying other meanings of a word.
 * @element other-meanings
 */
class OtherMeanings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.WORD = ExtStore.translation.Word.word;
    this.MEANINGS = Object.values({
      ...ExtStore.translation.Word.base_forms,
      ...ExtStore.translation.Word.parts_of_speech
    });

    /**
     * Renders the other meanings of the word.
     * @returns {Promise<boolean>} A promise that resolves to true when the other meanings are rendered.
     */
    this.render = async () => {
      let TEMPLATE_CONTENT;
      const STYLE = await CorePuzzleEnglishDictionaryModule.getTextAsset('/content/components/otherMeanings/otherMeanings.css');
      TEMPLATE_CONTENT = `
        <style>${STYLE}</style>
        <div class="back">← Назад</div>
        <p class="meaning-phrase-header">Значение слова <b>${this.WORD}</b> в данной фразе</p>
        <p class="meaning-header"><b>Другие значения</b></p>
      `;

      this.MEANINGS
        .filter((meaning) => meaning.values)
        .forEach((PART_OF_SPEECH_GROUP) => {
          // group meanings by synonym_group
          const GROUPED_MEANINGS = PART_OF_SPEECH_GROUP.values.reduce((acc, value) => {
            if (!acc[value.synonym_group]) acc[value.synonym_group] = [];
            acc[value.synonym_group].push(value);
            return acc;
          }, {});

          const MEANING_GROUPS = Object.values(GROUPED_MEANINGS);

          TEMPLATE_CONTENT += `
          <p class="meanings-part">${PART_OF_SPEECH_GROUP.part_of_speech_ru}</p>
          ${PART_OF_SPEECH_GROUP.article} <b>${PART_OF_SPEECH_GROUP.word}</b>
        `;

          TEMPLATE_CONTENT += '<ul>'
          MEANING_GROUPS
            .forEach((MEANING_GROUP) => {
              TEMPLATE_CONTENT += '<li>';

              TEMPLATE_CONTENT += MEANING_GROUP
                .map((MEANING) => `<other-meaning article="${PART_OF_SPEECH_GROUP.article}" translation="${MEANING.value}" partofspeech="${PART_OF_SPEECH_GROUP.part_of_speech}"></other-meaning>`)
                .join(', ');

              TEMPLATE_CONTENT += '</li>';
            });
          TEMPLATE_CONTENT += '</ul>';
        });

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      this.shadowRoot.querySelector('.back').addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('changeviewtype', { bubbles: true, composed: true, detail: 'show-translation' })
        );
      });
      return true;
    }
  }

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('other-meanings', OtherMeanings);
