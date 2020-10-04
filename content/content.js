
// TODO: depracated
(() => {
    async function injectDependencies() {
        await CorePuzzleEnglishDictionaryModule.injectScript(document, 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.js');
        await Promise.all([
            CorePuzzleEnglishDictionaryModule.injectScript(document, 'https://puzzle-english.com/wp-content/plugins/pe-balloon/jBox.min.js'),
            CorePuzzleEnglishDictionaryModule.injectScript(document, 'https://puzzle-english.com/wp-content/plugins/pe-balloon/pe_balloon.min.js'),
            CorePuzzleEnglishDictionaryModule.injectStyle(document, 'https://puzzle-english.com/wp-content/themes/english/extensions/dictionary/js/jBox.css'),
            CorePuzzleEnglishDictionaryModule.injectStyle(document, 'https://puzzle-english.com/wp-content/themes/english/assets/css/balloon.css')
        ]);
    }

    function prepareDocument() {
        for (const elem of document.querySelectorAll('div, yt-formatted-string')) {
            if (elem.children.length != 0) continue;
            CorePuzzleEnglishDictionaryModule.wrapElem(document, elem);
        }
        for (const elem of document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, span, em')) {
            if (elem.querySelector('svg')) continue;
            CorePuzzleEnglishDictionaryModule.wrapElem(document, elem);
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



(async () => {

    let currentSelection;

    document.addEventListener('mouseup', function (event) {
        const selection = CorePuzzleEnglishDictionaryModule.getSelected().toString();
        if (selection && selection != currentSelection) {
            currentSelection = selection;
            setTimeout(() => insertPopup(event), 150);
        } else {
            currentSelection = null;
            removePopup();
        }
    });

    function addInitialButtons(popup, options) {
        const BUTTON = document.createElement('div');
        BUTTON.classList.add('ped-bubble-button');
        if (options.backgroundImage) {
            const ICON_URL = chrome.extension.getURL(`/assets/images/icons/${options.backgroundImage}.png`)
            BUTTON.style.backgroundImage = `url(${ICON_URL})`;
            if (options.backgroundPosition) BUTTON.style.backgroundPosition = options.backgroundPosition;
        }

        popup.appendChild(BUTTON);
        return BUTTON;
    }

    function removePopup() {
        const popups = document.querySelectorAll('div.puzzle-english-dictionary-host');
        if (popups.length) popups.forEach(popup => popup.remove());
    }

    function insertPopup(event) {

        let currentSpeakerIndex = 0;

        function setCurrentSpeakerIndex(value) {
            currentSpeakerIndex = value;
            const AUDIO_ITEMS = POPUP.querySelectorAll('.audio-item');
            const ACTIVE_ITEM = POPUP.querySelector('.audio-item.active');
            if (ACTIVE_ITEM) ACTIVE_ITEM.classList.remove('active');
            Array.from(AUDIO_ITEMS)[currentSpeakerIndex].classList.add('active');
        }

        // initial popup
        const HOST = document.createElement('div');
        HOST.attachShadow({ mode: 'open' });

        HOST.classList.add('puzzle-english-dictionary-host');
        HOST.style.position = 'absolute';
        HOST.style.left = `${event.pageX}px`;
        HOST.style.top = `${event.pageY}px`;

        HOST.addEventListener('mousedown', (event) => event.stopPropagation())
        HOST.addEventListener('mouseup', (event) => event.stopPropagation())

        const SHADOW_ROOT = HOST.shadowRoot;
        const POPUP = document.createElement('div');
        POPUP.classList.add('ped-bubble');
        POPUP.classList.add('initial');
        SHADOW_ROOT.appendChild(POPUP);

        const STYLE = document.createElement('link');
        STYLE.rel = 'stylesheet';
        STYLE.href = chrome.extension.getURL(`/content/content.css`);
        SHADOW_ROOT.appendChild(STYLE);

        const ADD_WORD_BUTTON = addInitialButtons(POPUP, { backgroundImage: 'buttons', backgroundPosition: 'left' });
        const SHOW_WORD_PREVIEW_BUTTON = addInitialButtons(POPUP, { backgroundImage: 'buttons', backgroundPosition: 'center' });
        const CLOSE_PREVIEW_BUTTON = addInitialButtons(POPUP, { backgroundImage: 'buttons', backgroundPosition: 'right' });

        ADD_WORD_BUTTON.addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: "simpleAddWord", options: { word: currentSelection } });
            removePopup();
        })

        CLOSE_PREVIEW_BUTTON.addEventListener('click', () => {
            currentSelection = null;
            removePopup();
        });

        function addCurrentWordValuePart(popup, info) {
            const CURRENT_WORD_VALUE_PART = document.createElement('div');
            CURRENT_WORD_VALUE_PART.classList.add('ped-current-word');

            CURRENT_WORD_VALUE_PART.innerHTML = `
                <span class="word">${info.word} </span>
                <span>${info.partOfSpeech}</span>
            `;

            popup.appendChild(CURRENT_WORD_VALUE_PART);
        }

        function addBaseWordValuePart(popup, info) {
            const BASE_WORD_VALUE_PART = document.createElement('div');
            BASE_WORD_VALUE_PART.classList.add('ped-base-word');

            const WORD_PART = document.createElement('div');
            WORD_PART.classList.add('word-part');
            WORD_PART.innerHTML = `
                <span>${info.article}</span>
                <span class="word">${info.word}</span>
                <span> - ${info.translation}</span>
                <br>
                <span class="other-meanings">Другие значения</span>
            `;

            const AUDIO_BUTTON = document.createElement('div');
            AUDIO_BUTTON.classList.add('audio-button');
            AUDIO_BUTTON.innerHTML = `
                <svg width="34" height="34" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.9 16.9">
                    <g fill="#53AB6A">
                    <path clip-path="url(#svgkajhsdfk2222)" d="M10.9 8.4c0-.8-.7-1.5-1.5-1.5v1c.3 0 .5.2.5.5s-.2.5-.5.5v1c.8 0 1.5-.6 1.5-1.5M7.8 5.5C7.5 5.5 6.3 7 6.3 7h-1c-.3-.1-.6.2-.6.4v2c0 .3.2.5.5.5h1s1.2 1.5 1.5 1.5c.5 0 .5-.2.5-.5v-5c.1-.2.1-.4-.4-.4"></path>
                    <path clip-path="url(#svgkajhsdfk2222)" d="M10.4 5.5v1c.9.2 1.5 1 1.5 1.9 0 .9-.7 1.7-1.5 1.9v1c1.4-.2 2.6-1.5 2.6-2.9-.1-1.4-1.2-2.7-2.6-2.9"></path>
                    <path clip-path="url(#svgkajhsdfk2222)" d="M8.4 0C3.8 0 0 3.8 0 8.4c0 4.7 3.8 8.4 8.4 8.4s8.4-3.8 8.4-8.4C16.9 3.8 13.1 0 8.4 0m0 15.9C4.3 15.9.9 12.5.9 8.4S4.3.9 8.4.9s7.5 3.4 7.5 7.5-3.3 7.5-7.5 7.5"></path>
                    </g>
                </svg>
            `;

            AUDIO_BUTTON.addEventListener('click', event => {
                const SPEAKER_INFO = getSpeakerInfo(info.speakers[currentSpeakerIndex]);
                playAudio(SPEAKER_INFO.audio, info.word);
                setCurrentSpeakerIndex(currentSpeakerIndex == info.speakers.length - 1 ? 0 : currentSpeakerIndex + 1);

                const AUDIO_ITEMS = popup.querySelectorAll('.audio-item');
                if (currentSpeakerIndex > 5) {
                    Array.from(AUDIO_ITEMS)
                        .splice(0, currentSpeakerIndex - 5)
                        .forEach(item => item.classList.add('hidden'));
                } else {
                    Array.from(AUDIO_ITEMS)
                        .forEach(item => item.classList.remove('hidden'));
                }
            })

            BASE_WORD_VALUE_PART.appendChild(WORD_PART);
            BASE_WORD_VALUE_PART.appendChild(AUDIO_BUTTON);

            popup.appendChild(BASE_WORD_VALUE_PART);
        }

        function addWordActionPart(popup, info) {
            const WORD_ACTION_PART = document.createElement('div');
            WORD_ACTION_PART.classList.add('ped-word-actions');

            const BUBBLE_BUTTON = document.createElement('div');
            BUBBLE_BUTTON.classList.add('ped-bubble-button');
            BUBBLE_BUTTON.classList.add('ped-bubble-success-button');
            BUBBLE_BUTTON.innerHTML = `
                <span class="plus">+</span>
                <span>в словарь</span>
            `;

            BUBBLE_BUTTON.addEventListener('click', (event) => {
                chrome.runtime.sendMessage({ type: "addWord", options: info }, (response) => {
                });
            })

            WORD_ACTION_PART.append(BUBBLE_BUTTON);
            popup.appendChild(WORD_ACTION_PART);
        }

        function addDictionaryInfo(popup, info) {
            const DICTIONARY_INFO = document.createElement('div');
            DICTIONARY_INFO.classList.add('puzzle-english-dictionary-info');
            DICTIONARY_INFO.innerHTML = `<span>В вашем словаре слов: ${info.dictionarySize}</span>`;
            popup.appendChild(DICTIONARY_INFO);
        }

        function addPopupFooter(popup, info) {
            const FOOTER = document.createElement('div');
            FOOTER.classList.add('ped-bubble-footer');
            popup.appendChild(FOOTER);
        }

        async function addAudioItem(index, audioPart, speaker, word) {
            const AUDIO_ITEM = document.createElement('div');

            AUDIO_ITEM.classList.add('audio-item');

            const SPEAKER_INFO = getSpeakerInfo(speaker);
            AUDIO_ITEM.id = SPEAKER_INFO.audio;

            AUDIO_ITEM.addEventListener('click', event => {
                setCurrentSpeakerIndex(index);
                playAudio(SPEAKER_INFO.audio, word)
            });

            const FLAG_URL = chrome.extension.getURL(`/assets/flags/${SPEAKER_INFO.flag}`);
            const FACE_IMAGE = chrome.extension.getURL(`/assets/faces/${SPEAKER_INFO.face}`);

            const FLAG_RAW_RESPONSE = await fetch(FLAG_URL);
            const FLAG_SVG = await FLAG_RAW_RESPONSE.text();

            const FACE_RAW_RESPONSE = await fetch(FACE_IMAGE);
            const FACE_SVG = await FACE_RAW_RESPONSE.text();

            AUDIO_ITEM.innerHTML = `
                <div class="flag">${FLAG_SVG}</div>
                <div class="face">${FACE_SVG}</div>
                <div class="name">${SPEAKER_INFO.name}</div>
            `;

            audioPart.appendChild(AUDIO_ITEM);
        }

        function playAudio(speaker, word) {
            var audio = new Audio(`https://static.puzzle-english.com/words/${speaker}/${word}.mp3?1601716979483`);
            audio.play();
        }

        function getSpeakerInfo(name) {
            switch (name) {
                case 'vocabulary_US': return {
                    name: 'Mel',
                    flag: 'us.svg',
                    face: 'mel.svg',
                    audio: 'vocabulary_US'
                };
                case 'campbridge_UK': return {
                    name: 'Tony',
                    flag: 'uk.svg',
                    face: 'tony.svg',
                    audio: 'campbridge_UK'
                };
                case 'collins_UK': return {
                    name: 'Fran',
                    flag: 'uk.svg',
                    face: 'fran.svg',
                    audio: 'collins_UK'
                };
                case 'freedictionary_UK': return {
                    name: 'John',
                    flag: 'uk.svg',
                    face: 'john.svg',
                    audio: 'freedictionary_UK'
                };
                case 'howjsay_UK': return {
                    name: 'Paul',
                    flag: 'uk.svg',
                    face: 'paul.svg',
                    audio: 'howjsay_UK'
                };
                case 'vocalware_hugh_UK': return {
                    name: 'Robot',
                    flag: 'uk.svg',
                    face: 'robot.svg',
                    audio: 'vocalware_hugh_UK'
                };
                case 'SteveCampen_UK': return {
                    name: 'Campen',
                    flag: 'uk.svg',
                    face: 'campen.svg',
                    audio: 'SteveCampen_UK'
                };
                case 'Tamara_US': return {
                    name: 'Tamara',
                    flag: 'us.svg',
                    face: 'tamara.svg',
                    audio: 'Tamara_US'
                };
                case 'macquarie_AU': return {
                    name: 'Kit',
                    flag: 'us.svg',
                    face: 'kit.svg',
                    audio: 'macquarie_AU'
                };
                case 'freedictionary_US': return {
                    name: 'Lisa',
                    flag: 'us.svg',
                    face: 'lisa.svg',
                    audio: 'freedictionary_US'
                };
                case 'macmillan_UK': return {
                    name: 'Cory',
                    flag: 'uk.svg',
                    face: 'cory.svg',
                    audio: 'macmillan_UK'
                };
                case 'peterBaker_UK': return {
                    name: 'Peter',
                    flag: 'uk.svg',
                    face: 'peter.svg',
                    audio: 'peterBaker_UK'
                };
                case 'campbridge_US': return {
                    name: 'Noel',
                    flag: 'us.svg',
                    face: 'noel.svg',
                    audio: 'campbridge_US'
                };
                case 'yandex_UK': return {
                    name: 'Nancy',
                    flag: 'uk.svg',
                    face: 'nancy.svg',
                    audio: 'yandex_UK'
                };
                case 'collins_US': return {
                    name: 'David',
                    flag: 'us.svg',
                    face: 'david.svg',
                    audio: 'collins_US'
                };
                case 'SteveElliott_UK': return {
                    name: 'Steve',
                    flag: 'uk.svg',
                    face: 'steve.svg',
                    audio: 'SteveElliott_UK'
                };
                case 'HughMcEnaney_UK': return {
                    name: 'Steve',
                    flag: 'uk.svg',
                    face: 'steve.svg',
                    audio: 'HughMcEnaney_UK'
                };
            }
        }

        function addAudioPart(popup, speakers, word) {
            const AUDIO_PART = document.createElement('div');
            AUDIO_PART.classList.add('ped-audio-part');
            speakers.forEach((speaker, index) => addAudioItem(index, AUDIO_PART, speaker, word));
            popup.appendChild(AUDIO_PART);
        }

        SHOW_WORD_PREVIEW_BUTTON.addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: "checkWord", options: { word: currentSelection } }, (response) => {
                POPUP.classList.remove('initial');
                POPUP.classList.add('check');
                if (response.Word.id != response.Word.base_word_id) {
                    const PART_OF_SPEECH = response.Word.base_forms[response.Word.part_of_speech].description;
                    addCurrentWordValuePart(POPUP, { word: response.Word.word, partOfSpeech: PART_OF_SPEECH });
                }
                addBaseWordValuePart(POPUP, {
                    article: response.Word.article,
                    word: response.Word.base_word,
                    speakers: response.word_speakers,
                    translation: response.Word.translation
                });
                if (response.word_speakers && response.word_speakers.length > 1) {
                    addAudioPart(POPUP, response.word_speakers, response.Word.base_word);
                }
                addWordActionPart(POPUP, {
                    word: response.Word.base_word,
                    translation: response.Word.translation,
                    partOfSpeech: response.Word.part_of_speech
                });
                if (response.html) {
                    const DICTIONARY_SIZE = (response.html.match(/<span>В вашем словаре.*?(\d+).*?<\/span>/) || [])[1];
                    if (Number(DICTIONARY_SIZE)) addDictionaryInfo(POPUP, { dictionarySize: DICTIONARY_SIZE });
                }
            });
        })

        document.body.appendChild(HOST);
    }

})();
