"use strict";
// TODO: depracated
(() => {
    const CPEDM = CorePuzzleEnglishDictionaryModule;

    async function injectDependencies() {
        await CPEDM.injectScript(document.head, 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.js');
        await Promise.all([
            CPEDM.injectScript(document.head, 'https://puzzle-english.com/wp-content/plugins/pe-balloon/jBox.min.js'),
            CPEDM.injectScript(document.head, 'https://puzzle-english.com/wp-content/plugins/pe-balloon/pe_balloon.min.js'),
            CPEDM.injectStyle(document.head, 'https://puzzle-english.com/wp-content/themes/english/extensions/dictionary/js/jBox.css'),
            CPEDM.injectStyle(document.head, 'https://puzzle-english.com/wp-content/themes/english/assets/css/balloon.css')
        ]);
    }

    function prepareDocument() {
        for (const elem of document.querySelectorAll('div, yt-formatted-string')) {
            if (elem.children.length != 0) continue;
            CPEDM.wrapElem(document, elem);
        }
        for (const elem of document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, span, em')) {
            if (elem.querySelector('svg')) continue;
            CPEDM.wrapElem(document, elem);
        }
    }

    async function initTranslation() {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `$(function () {
            PuzzleEnglishBaloonInitted = true;
            PE_Balloon.init({
                wrap_words: true, id_user: 2676311, our_helper: false});
            });`
        document.head.appendChild(script);
    }

    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.message == 'startTranslate') {
            await injectDependencies();
            prepareDocument();
            initTranslation();
            sendResponse('ok');
        }
    });
})();

/** CorePuzzleEnglishDictionaryModule alias */
const CPEDM = CorePuzzleEnglishDictionaryModule;

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

    add(elem) { this.component.shadowRoot.appendChild(elem); }
}
class Bubble {
    constructor(selection) {
        this.currentSpeakerIndex = 0;
        this.currentSelection = selection;
        this.component = document.createElement('div');

        this.word;
        this.translation;
        this.partOfSpeech;

        this.children = {};
    }

    render() {
        this.component.classList.add('ped-bubble', 'initial');
        this.children.ADD_WORD_BUTTON = new InitialButtonComponent(
            { backgroundImage: 'buttons', backgroundPosition: 'left' },
            () => { chrome.runtime.sendMessage({ type: "simpleAddWord", options: { word: this.currentSelection } }); this.destroy; }
        );
        this.add(this.children.ADD_WORD_BUTTON.render());

        this.children.SHOW_WORD_PREVIEW_BUTTON = new InitialButtonComponent(
            { backgroundImage: 'buttons', backgroundPosition: 'center' },
            () => {
                chrome.runtime.sendMessage({ type: "checkWord", options: { word: this.currentSelection } }, async (response) => {
                    this.component.classList.remove('initial');
                    this.component.classList.add('check');

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
                        SPEAKERS = response.word_speakers,
                        PART_OF_SPEECH = response.Word.part_of_speech,
                        PART_OF_SPEECH_DESCR = (Object.keys(response.Word.base_forms).length
                            ? response.Word.base_forms
                            : response.Word.parts_of_speech)[response.Word.part_of_speech].description;

                    this.word = CURRENT_WORD;

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
        if (this.currentSpeakerIndex > 5) {
            AUDIO_ITEMS.forEach((item, index) => index > this.currentSpeakerIndex - 5 || item.classList.add('hidden'));
        } else {
            AUDIO_ITEMS.forEach(item => item.classList.remove('hidden'));
        }
    }

    destroy() {
        this.currentSelection = null;
        this.component.remove();
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
        const BASE_FORMS = this.wordInfo.base_forms,
            PARTS_OF_SPEECH = this.wordInfo.parts_of_speech,
            MEANINGS = Object.values(Object.keys(BASE_FORMS).length ? BASE_FORMS : PARTS_OF_SPEECH);

        const OTHER_MEANINGS_HEADER = document.createElement('p');
        OTHER_MEANINGS_HEADER.classList.add('meanings-header');
        OTHER_MEANINGS_HEADER.innerText = 'Другие значения'

        this.component.appendChild(OTHER_MEANINGS_HEADER);

        for (const MEANING of MEANINGS) {
            const MEANING_VALUE = document.createElement('p');
            MEANING_VALUE.innerText = MEANING.part_of_speech_ru;
            MEANING_VALUE.classList.add('meanings-part');
            this.component.appendChild(MEANING_VALUE);

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
            const SPEAKER_INFO = CPEDM.getSpeakerInfo(this.speakers[this.parent.currentSpeakerIndex]);
            CPEDM.playAudio(SPEAKER_INFO.audio, this.word);
            this.parent.setCurrentSpeakerIndex(this.parent.currentSpeakerIndex == this.speakers.length - 1 ? 0 : this.parent.currentSpeakerIndex + 1);
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
        this.speakers.forEach((speaker, index) => {
            const AUDIO_ITEM = document.createElement('div');
            AUDIO_ITEM.classList.add('audio-item', speaker);
            const SPEAKER_INFO = CPEDM.getSpeakerInfo(speaker);
            AUDIO_ITEM.addEventListener('click', () => {
                this.parent.setCurrentSpeakerIndex(index);
                CPEDM.playAudio(SPEAKER_INFO.audio, this.word)
            });
            Promise
                .all([
                    CPEDM.getTextAsset(`/assets/flags/${SPEAKER_INFO.flag}`),
                    CPEDM.getTextAsset(`/assets/faces/${SPEAKER_INFO.face}`),
                ])
                .then(([FLAG_SVG, FACE_SVG]) => {
                    AUDIO_ITEM.innerHTML = `<div class="flag">${FLAG_SVG}</div><div class="face">${FACE_SVG}</div><div class="name">${SPEAKER_INFO.name}</div>`;
                    this.component.appendChild(AUDIO_ITEM);
                })
        });
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

        BUBBLE_BUTTON.addEventListener('click', (event) => this.parent.saveWord())

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

let currentSelection = null;

document.addEventListener('mouseup', (event) => {
    const selection = CPEDM.getSelected().toString();
    if (selection && selection.trim() && selection != currentSelection) {
        currentSelection = selection;
        setTimeout(() => {
            // initial popup
            const HOST = new Host(event.pageX, event.pageY);
            const POPUP = new Bubble(selection.trim());
            HOST.add(POPUP.render());
            document.body.appendChild(HOST.render());
        }, 150);
    } else {
        currentSelection = null;
        document.querySelectorAll('div.puzzle-english-dictionary-host').forEach(popup => popup.remove())
    }
});
