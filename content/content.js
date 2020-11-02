"use strict";
/** CorePuzzleEnglishDictionaryModule alias */
const CPEDM = CorePuzzleEnglishDictionaryModule;
let authorization = false;
class Host {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.component = document.createElement('div');
        this.component.attachShadow({ mode: 'open' })
    }

    render() {
        this.component.classList.add('puzzle-english-dictionary-host')
        this.component.setAttribute('style', `position: absolute; left: ${this.x}px; top: ${this.y}px; z-index: 2147483647;`)
        this.component.addEventListener('mousedown', (event) => event.stopPropagation())
        this.component.addEventListener('mouseup', (event) => event.stopPropagation())
        CPEDM.injectStyle(this.component.shadowRoot, chrome.extension.getURL(`/content/content.css`))
        return this.component
    };

    destroy() {
        this.component.remove();
    }

    add(elem) { this.component.shadowRoot.appendChild(elem); }
}
class Bubble {
    constructor(parent, selection) {
        this.parent = parent;
        this.currentSpeakerIndex = -1;
        this.currentSelection = selection;
        this.component = document.createElement('div');
        this.word;
        this.translation;
        this.partOfSpeech;
        this.children = {};
    }

    render() {
        this.component.classList.add('ped-bubble', 'initial');
        if (!authorization) {
            chrome.runtime.sendMessage({ type: "checkAuth" }, null, ({ auth }) => {
                if (!auth) this.component.classList.add('disabled');
                authorization = auth;
            });
        }
        this.children.ADD_WORD_BUTTON = new InitialButtonComponent(
            { backgroundImage: 'buttons', backgroundPosition: 'left' },
            () => {
                chrome.runtime.sendMessage({ type: "simpleAddWord", options: { word: this.currentSelection } });
                this.destroy();
            }
        );
        this.add(this.children.ADD_WORD_BUTTON.render());

        this.children.SHOW_WORD_PREVIEW_BUTTON = new InitialButtonComponent(
            { backgroundImage: 'buttons', backgroundPosition: 'center' },
            () => {
                this.component.classList.remove('initial');
                this.component.classList.add('check');
                chrome.runtime.sendMessage({ type: "checkWord", options: { word: this.currentSelection } }, async (response) => {
                    if (!response.Word.id) {
                        this.children.CURRENT_WORD_VALUE_COMPONENT = new CurrentWordComponent('Перевод не найден');
                        this.add(this.children.CURRENT_WORD_VALUE_COMPONENT.render());
                        return;
                    }
                    const WORD_INFO = response.Word,
                        CURRENT_WORD = response.Word.word,
                        BASE_WORD = response.Word.base_word,
                        ARTICLE = response.Word.article,
                        TRANSLATION = response.Word.translation,
                        SPEAKERS = response.word_speakers.splice(0, 8),
                        PART_OF_SPEECH = response.Word.part_of_speech,
                        PART_OF_SPEECH_DESCR = { ...response.Word.base_forms, ...response.Word.parts_of_speech }[response.Word.part_of_speech].description;

                    this.word = CURRENT_WORD;
                    this.translation = TRANSLATION;
                    this.partOfSpeech = PART_OF_SPEECH;

                    if (response.Word.id != response.Word.base_word_id) {
                        this.children.CURRENT_WORD_VALUE_COMPONENT = new CurrentWordComponent(CURRENT_WORD, PART_OF_SPEECH_DESCR);
                        this.add(this.children.CURRENT_WORD_VALUE_COMPONENT.render());
                    }

                    this.children.BASE_WORD_VALUE_COMPONENT = new BaseWordComponent(this, BASE_WORD, TRANSLATION, SPEAKERS, ARTICLE);
                    this.add(this.children.BASE_WORD_VALUE_COMPONENT.render());

                    this.children.OTHER_MEANINGS_COMPONENT = new OtherMeaningsComponent(this, WORD_INFO);
                    this.add(this.children.OTHER_MEANINGS_COMPONENT.render());

                    if (SPEAKERS && SPEAKERS.length > 1) {
                        this.children.AUDIO_PART_COMPONENT = new WordPronunciationComponent(this, BASE_WORD, SPEAKERS);
                        this.add(this.children.AUDIO_PART_COMPONENT.render());
                    }

                    this.children.WORD_ACTION_COMPONENT = new WordActionsComponent(this, BASE_WORD, TRANSLATION, PART_OF_SPEECH)
                    this.add(this.children.WORD_ACTION_COMPONENT.render());

                    if (response.html) {
                        const DICTIONARY_SIZE = (response.html.match(/<span>В вашем словаре.*?(\d+).*?<\/span>/) || [])[1];
                        if (Number(DICTIONARY_SIZE)) {
                            this.children.DICTIONARY_INFO_COMPONENT = new DictionaryInfoComponent(DICTIONARY_SIZE);
                            this.add(this.children.DICTIONARY_INFO_COMPONENT.render());
                        }
                    }
                });
            }
        );
        this.add(this.children.SHOW_WORD_PREVIEW_BUTTON.render());

        this.children.CLOSE_PREVIEW_BUTTON = new InitialButtonComponent(
            { backgroundImage: 'buttons', backgroundPosition: 'right' },
            () => this.destroy()
        );
        this.add(this.children.CLOSE_PREVIEW_BUTTON.render());
        return this.component;
    }

    add(elem) { this.component.appendChild(elem); }

    changeTranslation(info) {
        this.translation = info.translation;
        this.partOfSpeech = info.partOfSpeech
        this.children.BASE_WORD_VALUE_COMPONENT.changeTranslation(this.translation);
    }

    saveWord() {
        chrome.runtime.sendMessage({ type: "addWord", options: { word: this.word, translation: this.translation, partOfSpeech: this.partOfSpeech } }, (response) => { });
    }

    setCurrentSpeakerIndex(value = 0) {
        this.currentSpeakerIndex = value;
        const AUDIO_ITEMS = this.component.querySelectorAll('.audio-item');
        const ACTIVE_ITEM = this.component.querySelector('.audio-item.active');
        if (ACTIVE_ITEM) ACTIVE_ITEM.classList.remove('active');
        AUDIO_ITEMS.item(this.currentSpeakerIndex).classList.add('active');
    }

    destroy() {
        this.currentSelection = null;
        this.parent.component.remove();
    }
}
class OtherMeaningsComponent {
    constructor(parent, wordInfo) {
        this.parent = parent;
        this.wordInfo = wordInfo;
        this.component = document.createElement('div');
    }

    render() {
        this.component.classList.add('other-meanings');

        const BACK_BUTTON = document.createElement('span');
        BACK_BUTTON.classList.add('meaning-back-button');
        BACK_BUTTON.innerText = '← Назад';
        BACK_BUTTON.addEventListener('click', () => {
            this.parent.component.classList.remove('pick');
            this.parent.component.classList.add('check');
        })
        this.component.appendChild(BACK_BUTTON);

        const MEANING_PHRASE_HEADER = document.createElement('div');
        MEANING_PHRASE_HEADER.classList.add('meaning-phrase-header');
        MEANING_PHRASE_HEADER.innerHTML = `Значение слова <b>${this.wordInfo.word}</b> в данной фразе`;
        this.component.appendChild(MEANING_PHRASE_HEADER);

        const BASE_FORMS = this.wordInfo.base_forms,
            PARTS_OF_SPEECH = this.wordInfo.parts_of_speech,
            MEANINGS = Object.values({ ...BASE_FORMS, ...PARTS_OF_SPEECH });

        const OTHER_MEANINGS_HEADER = document.createElement('p');
        OTHER_MEANINGS_HEADER.classList.add('meanings-header');
        OTHER_MEANINGS_HEADER.innerText = 'Другие значения'

        this.component.appendChild(OTHER_MEANINGS_HEADER);

        for (const MEANING of MEANINGS) {
            const MEANING_VALUE = document.createElement('p');
            MEANING_VALUE.innerText = MEANING.part_of_speech_ru;
            MEANING_VALUE.classList.add('meanings-part');
            this.component.appendChild(MEANING_VALUE);

            const MEANING_VALUE_PART_OF_SPEECH = document.createElement('p');
            MEANING_VALUE_PART_OF_SPEECH.innerHTML = `${MEANING.article} <b>${MEANING.word}<b>`;
            MEANING_VALUE_PART_OF_SPEECH.classList.add('meanings-part-of-speech');
            this.component.appendChild(MEANING_VALUE_PART_OF_SPEECH);

            const MEANINGS_LIST = document.createElement('ul');

            const MEANING_GROUPS = MEANING.values
                .reduce((acc, value) => {
                    if (!acc[value.synonym_group]) {
                        acc[value.synonym_group] = [value];
                    } else {
                        acc[value.synonym_group] = [...acc[value.synonym_group], value];
                    }
                    return acc;
                }, {})

            for (const MEANING_GROUP_KEY in MEANING_GROUPS) {
                const MEANING_GROUP = MEANING_GROUPS[MEANING_GROUP_KEY];
                const MEANING_LIST_ITEM = document.createElement('li');
                MEANING_GROUP.forEach((meaningGroupItem, index) => {
                    const MEANING_GROUP_ITEM_COMPONENT = document.createElement('span');
                    MEANING_GROUP_ITEM_COMPONENT.classList.add('meaning-word');
                    MEANING_GROUP_ITEM_COMPONENT.innerText = (!index ? '' : ', ') + meaningGroupItem.value;
                    MEANING_GROUP_ITEM_COMPONENT.addEventListener('click', () => {
                        this.parent.component.classList.remove('pick');
                        this.parent.component.classList.add('check');
                        this.parent.changeTranslation({
                            translation: meaningGroupItem.value,
                            partOfSpeech: MEANING.part_of_speech
                        });
                    })
                    MEANING_LIST_ITEM.appendChild(MEANING_GROUP_ITEM_COMPONENT);
                })
                MEANINGS_LIST.appendChild(MEANING_LIST_ITEM)
            }

            this.component.appendChild(MEANINGS_LIST);
        }

        return this.component;
    }
}
class CurrentWordComponent {
    constructor(word, partOfSpeech = '') {
        this.word = word;
        this.partOfSpeech = partOfSpeech;
        this.component = document.createElement('div');
    }

    render() {
        this.component.classList.add('ped-current-word');
        this.component.innerHTML = `<span class="word">${this.word} </span><span>${this.partOfSpeech}</span>`;
        return this.component;
    }
}
class BaseWordComponent {
    constructor(parent, word, translation, speakers, article = '') {
        this.parent = parent;
        this.word = word;
        this.translation = translation;
        this.speakers = speakers;
        this.article = article;
        this.component = document.createElement('div');
    }

    render() {
        this.component.classList.add('ped-base-word');
        const WORD_PART = document.createElement('div');
        WORD_PART.classList.add('word-part');
        WORD_PART.innerHTML = `<span>${this.article} </span><span class="word">${this.word}</span><span class="translation"> - ${this.translation}</span><br><span class="other-meanings-button">Другие значения</span>`;
        this.component.appendChild(WORD_PART);

        const OTHER_MEANINGS_BUTTON = this.component.querySelector('.other-meanings-button');
        OTHER_MEANINGS_BUTTON.addEventListener('click', () => {
            this.parent.component.classList.add('pick');
            this.parent.component.classList.remove('check');
        });

        const AUDIO_BUTTON = document.createElement('div');
        AUDIO_BUTTON.classList.add('audio-button');

        CPEDM.getTextAsset(`/assets/audio-button.svg`).then(svg => AUDIO_BUTTON.innerHTML = svg)

        AUDIO_BUTTON.addEventListener('click', event => {
            this.parent.setCurrentSpeakerIndex(this.parent.currentSpeakerIndex == this.speakers.length - 1 ? 0 : this.parent.currentSpeakerIndex + 1);
            const SPEAKER_INFO = CPEDM.getSpeakerInfo(this.speakers[this.parent.currentSpeakerIndex]);
            chrome.runtime.sendMessage({ type: "playWord", options: { speaker: SPEAKER_INFO.audio, word: this.word } });

        })
        this.component.appendChild(AUDIO_BUTTON);
        return this.component;
    }

    changeTranslation(translation) {
        const TRANSLATION_COMPONENT = this.component.querySelector('.translation');
        TRANSLATION_COMPONENT.innerText = `- ${translation}`;
    }
}
class WordPronunciationComponent {
    constructor(parent, word, speakers) {
        this.parent = parent;
        this.word = word;
        this.speakers = speakers;
        this.component = document.createElement('div');
    }

    render() {
        this.component.classList.add('ped-audio-part');

        this.component.addEventListener('mou', (event) => {
            console.log(event);
            event.preventDefault();
            event.stopPropagation();
        })
        for (let index = 0; index < this.speakers.length; index++) {
            let speaker = this.speakers[index];
            const AUDIO_ITEM = document.createElement('div');
            AUDIO_ITEM.classList.add('audio-item', speaker);
            const SPEAKER_INFO = CPEDM.getSpeakerInfo(speaker);
            AUDIO_ITEM.addEventListener('click', () => {
                this.parent.setCurrentSpeakerIndex(index);
                chrome.runtime.sendMessage({ type: "playWord", options: { speaker: SPEAKER_INFO.audio, word: this.word } });
            });
            Promise
                .all([
                    CPEDM.getTextAsset(`/assets/flags/${SPEAKER_INFO.flag}`),
                    CPEDM.getTextAsset(`/assets/faces/${SPEAKER_INFO.face}`),
                ])
                .then(([FLAG_SVG, FACE_SVG]) => {
                    AUDIO_ITEM.innerHTML = `<div class="flag">${FLAG_SVG}</div><div class="face">${FACE_SVG}</div><div class="name">${SPEAKER_INFO.name}</div>`;
                })
            this.component.appendChild(AUDIO_ITEM);
        }
        return this.component;
    }
}
class WordActionsComponent {
    constructor(parent, word, translation, partOfSpeech) {
        this.parent = parent;
        this.word = word;
        this.translation = translation;
        this.partOfSpeech = partOfSpeech;
        this.component = document.createElement('div');
    }

    render() {
        this.component.classList.add('ped-word-actions');
        const BUBBLE_BUTTON = document.createElement('div');
        BUBBLE_BUTTON.classList.add('ped-bubble-button', 'ped-bubble-success-button');
        BUBBLE_BUTTON.innerHTML = `<span class="plus">+</span><span>в словарь</span>`;

        BUBBLE_BUTTON.addEventListener('click', (event) => {
            this.parent.saveWord();
            BUBBLE_BUTTON.innerHTML = `<span>Добавлено</span>`;
        },
            { once: true }
        )

        this.component.append(BUBBLE_BUTTON);
        return this.component;
    }
}
class DictionaryInfoComponent {
    constructor(dictionarySize) {
        this.dictionarySize = dictionarySize;
        this.component = document.createElement('div');
    }

    render() {
        this.component.classList.add('puzzle-english-dictionary-info');
        this.component.innerHTML = `<span>В вашем словаре слов: ${this.dictionarySize}</span>`;
        return this.component;
    }
}
class InitialButtonComponent {
    constructor(options = {}, clickHandler) {
        this.options = options;
        this.clickHandler = clickHandler;
        this.component = document.createElement('div');
    }

    render() {
        this.component.classList.add('ped-bubble-button');
        if (this.options.backgroundImage) {
            const ICON_URL = chrome.extension.getURL(`/assets/images/icons/${this.options.backgroundImage}.png`)
            this.component.style.backgroundImage = `url(${ICON_URL})`;
            if (this.options.backgroundPosition) this.component.style.backgroundPosition = this.options.backgroundPosition;
        }

        if (this.clickHandler) this.component.addEventListener('click', this.clickHandler);
        return this.component;
    }
}

document.addEventListener('mouseup', (event) => {
    if (event.target.nodeName == 'INPUT' || event.target.nodeName == 'TEXTAREA') return;
    const selection = CPEDM.getSelected().toString();
    document.querySelectorAll('div.puzzle-english-dictionary-host').forEach(popup => popup.remove())
    if (selection && selection.trim() && !/[^a-zA-Z’'\- ]/.test(selection)) {
        setTimeout(() => {
            // initial popup
            const HOST = new Host(event.pageX, event.pageY);
            const POPUP = new Bubble(HOST, selection.trim());
            HOST.add(POPUP.render());
            document.body.appendChild(HOST.render());
        }, 150);
    }
});
