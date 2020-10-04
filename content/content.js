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
        this.Node = document.createElement('div');
        this.Node.classList.add('puzzle-english-dictionary-host')
        this.Node.attachShadow({ mode: 'open' })
        this.Node.setAttribute('style', `position: absolute; left: ${x}px; top: ${y}px;`)
        this.Node.addEventListener('mousedown', (event) => event.stopPropagation())
        this.Node.addEventListener('mouseup', (event) => event.stopPropagation())
        CPEDM.injectStyle(this.Node.shadowRoot, chrome.extension.getURL(`/content/content.css`))
    }

    get() { return this.Node };

    add(elem) { this.Node.shadowRoot.appendChild(elem); }
}

class Popup {
    constructor(selection) {
        this.Node = document.createElement('div');
        this.Node.classList.add('ped-bubble', 'initial');
        this.currentSpeakerIndex = 0;
        this.currentSelection = selection;

        const ADD_WORD_BUTTON = this.addInitialButtons({ backgroundImage: 'buttons', backgroundPosition: 'left', });
        ADD_WORD_BUTTON.addEventListener('click', () => { chrome.runtime.sendMessage({ type: "simpleAddWord", options: { word: this.currentSelection } }); this.destroy; })
        this.add(ADD_WORD_BUTTON);

        const SHOW_WORD_PREVIEW_BUTTON = this.addInitialButtons({ backgroundImage: 'buttons', backgroundPosition: 'center' });
        SHOW_WORD_PREVIEW_BUTTON.addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: "checkWord", options: { word: this.currentSelection } }, async (response) => {
                this.Node.classList.remove('initial');
                this.Node.classList.add('check');
                if (response.Word.id) {
                    if (response.Word.id != response.Word.base_word_id) {
                        const CURRENT_WORD_VALUE_PART = this.addCurrentWordValueSection({
                            word: response.Word.word,
                            partOfSpeech: response.Word.base_forms[response.Word.part_of_speech].description
                        });
                        this.add(CURRENT_WORD_VALUE_PART);
                    }
                    const BASE_WORD_VALUE_PART = await this.addBaseWordValueSection({
                        article: response.Word.article,
                        word: response.Word.base_word,
                        speakers: response.word_speakers,
                        translation: response.Word.translation
                    });
                    this.add(BASE_WORD_VALUE_PART);

                    if (response.word_speakers && response.word_speakers.length > 1) {
                        const AUDIO_PART = this.addAudioSection(response.word_speakers, response.Word.base_word);
                        this.add(AUDIO_PART);
                    }
                    const WORD_ACTION_PART = this.addWordActionsSection({
                        word: response.Word.base_word,
                        translation: response.Word.translation,
                        partOfSpeech: response.Word.part_of_speech
                    });
                    this.add(WORD_ACTION_PART);

                    if (response.html) {
                        const DICTIONARY_SIZE = (response.html.match(/<span>В вашем словаре.*?(\d+).*?<\/span>/) || [])[1];
                        if (Number(DICTIONARY_SIZE)) {
                            const DICTIONARY_INFO = this.addDictionaryInfo(DICTIONARY_SIZE);
                            this.add(DICTIONARY_INFO);
                        }
                    }
                } else {
                    const CURRENT_WORD_VALUE_PART = this.addCurrentWordValueSection({
                        word: 'Перевод не найден',
                        partOfSpeech: ''
                    });
                    this.add(CURRENT_WORD_VALUE_PART);
                }
            });
        })
        this.add(SHOW_WORD_PREVIEW_BUTTON);

        const CLOSE_PREVIEW_BUTTON = this.addInitialButtons({ backgroundImage: 'buttons', backgroundPosition: 'right' });
        CLOSE_PREVIEW_BUTTON.addEventListener('click', () => this.destroy());
        this.add(CLOSE_PREVIEW_BUTTON);
    }

    get() { return this.Node; }

    add(elem) { this.Node.appendChild(elem); }

    setCurrentSpeakerIndex(value) {
        this.currentSpeakerIndex = value;
        const AUDIO_ITEMS = this.Node.querySelectorAll('.audio-item');
        const ACTIVE_ITEM = this.Node.querySelector('.audio-item.active');
        if (ACTIVE_ITEM) ACTIVE_ITEM.classList.remove('active');
        console.log(value);
        AUDIO_ITEMS.item(this.currentSpeakerIndex).classList.add('active');
        if (this.currentSpeakerIndex > 5) {
            AUDIO_ITEMS.forEach((item, index) => index > this.currentSpeakerIndex - 5 || item.classList.add('hidden'));
        } else {
            AUDIO_ITEMS.forEach(item => item.classList.remove('hidden'));
        }
    }

    addCurrentWordValueSection(info) {
        const CURRENT_WORD_VALUE_PART = document.createElement('div');
        CURRENT_WORD_VALUE_PART.classList.add('ped-current-word');
        CURRENT_WORD_VALUE_PART.innerHTML = `<span class="word">${info.word} </span><span>${info.partOfSpeech}</span>`;
        return CURRENT_WORD_VALUE_PART;
    }

    async addBaseWordValueSection(info) {
        const BASE_WORD_VALUE_PART = document.createElement('div');
        BASE_WORD_VALUE_PART.classList.add('ped-base-word');

        const WORD_PART = document.createElement('div');
        WORD_PART.classList.add('word-part');
        WORD_PART.innerHTML = `<span>${info.article} </span><span class="word">${info.word}</span><span> - ${info.translation}</span><br><span class="other-meanings">Другие значения</span>`;
        BASE_WORD_VALUE_PART.appendChild(WORD_PART);

        const AUDIO_BUTTON = document.createElement('div');
        AUDIO_BUTTON.classList.add('audio-button');

        AUDIO_BUTTON.innerHTML = await CPEDM.getTextAsset(`/assets/audio-button.svg`);

        AUDIO_BUTTON.addEventListener('click', event => {
            const SPEAKER_INFO = CPEDM.getSpeakerInfo(info.speakers[this.currentSpeakerIndex]);
            CPEDM.playAudio(SPEAKER_INFO.audio, info.word);
            this.setCurrentSpeakerIndex(this.currentSpeakerIndex == info.speakers.length - 1 ? 0 : this.currentSpeakerIndex + 1);
        })
        BASE_WORD_VALUE_PART.appendChild(AUDIO_BUTTON);
        return BASE_WORD_VALUE_PART;
    }

    addWordActionsSection(info) {
        const WORD_ACTION_PART = document.createElement('div');
        WORD_ACTION_PART.classList.add('ped-word-actions');

        const BUBBLE_BUTTON = document.createElement('div');
        BUBBLE_BUTTON.classList.add('ped-bubble-button', 'ped-bubble-success-button');
        BUBBLE_BUTTON.innerHTML = `<span class="plus">+</span><span>в словарь</span>`;

        BUBBLE_BUTTON.addEventListener('click', (event) => {
            chrome.runtime.sendMessage({ type: "addWord", options: info }, (response) => { });
        })

        WORD_ACTION_PART.append(BUBBLE_BUTTON);
        return WORD_ACTION_PART;
    }

    addDictionaryInfo(dictionarySize) {
        const DICTIONARY_INFO = document.createElement('div');
        DICTIONARY_INFO.classList.add('puzzle-english-dictionary-info');
        DICTIONARY_INFO.innerHTML = `<span>В вашем словаре слов: ${dictionarySize}</span>`;
        return DICTIONARY_INFO;
    }

    addAudioSection(speakers, word) {
        const AUDIO_PART = document.createElement('div');
        AUDIO_PART.classList.add('ped-audio-part');
        speakers.forEach((speaker, index) => {
            const AUDIO_ITEM = document.createElement('div');
            AUDIO_ITEM.classList.add('audio-item', speaker);
            const SPEAKER_INFO = CPEDM.getSpeakerInfo(speaker);
            AUDIO_ITEM.addEventListener('click', () => {
                this.setCurrentSpeakerIndex(index);
                CPEDM.playAudio(SPEAKER_INFO.audio, word)
            });
            Promise
                .all([
                    CPEDM.getTextAsset(`/assets/flags/${SPEAKER_INFO.flag}`),
                    CPEDM.getTextAsset(`/assets/faces/${SPEAKER_INFO.face}`),
                ])
                .then(([FLAG_SVG, FACE_SVG]) => {
                    AUDIO_ITEM.innerHTML = `<div class="flag">${FLAG_SVG}</div><div class="face">${FACE_SVG}</div><div class="name">${SPEAKER_INFO.name}</div>`;
                    AUDIO_PART.appendChild(AUDIO_ITEM);
                })
        });
        return AUDIO_PART;
    }

    addInitialButtons(options) {
        const BUTTON = document.createElement('div');
        BUTTON.classList.add('ped-bubble-button');
        if (options.backgroundImage) {
            const ICON_URL = chrome.extension.getURL(`/assets/images/icons/${options.backgroundImage}.png`)
            BUTTON.style.backgroundImage = `url(${ICON_URL})`;
            if (options.backgroundPosition) BUTTON.style.backgroundPosition = options.backgroundPosition;
        }
        return BUTTON;
    }

    destroy() {
        this.currentSelection = null;
        this.Node.remove();
    }
}

let currentSelection = null;

document.addEventListener('mouseup', (event) => {
    const selection = CPEDM.getSelected().toString();
    if (selection && selection.trim() && selection != currentSelection) {
        console.log(selection);
        currentSelection = selection;
        setTimeout(() => {
            // initial popup
            const HOST = new Host(event.pageX, event.pageY);
            const POPUP = new Popup(selection.trim());
            HOST.add(POPUP.get());
            document.body.appendChild(HOST.get());
        }, 150);
    } else {
        currentSelection = null;
        document.querySelectorAll('div.puzzle-english-dictionary-host').forEach(popup => popup.remove())
    }
});