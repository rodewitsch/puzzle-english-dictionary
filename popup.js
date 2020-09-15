document.addEventListener('DOMContentLoaded', async () => {
    const WORK_AREA = document.querySelector('.work-area'),
        NEED_AUTH_AREA = document.querySelector('.need-auth-area'),
        SUBMIT_BUTTON = document.querySelector('.redesign-button'),
        GO_TO_SITE_BUTTON = document.querySelector('#go-to-site'),
        WORDS_AREA = document.querySelector('#words-area'),
        COOKIES = CorePuzzleEnglishDictionaryModule.getAuthCookies();

    // check auth
    try { await CorePuzzleEnglishDictionaryModule.checkWords(COOKIES, 'test auth'); }
    catch (err) {
        WORK_AREA.classList.add("hide-area");
        NEED_AUTH_AREA.classList.remove("hide-area");
    }

    // registering a form validation handler
    WORDS_AREA.oninput = (event) => {
        if (event.target.value) return enableButton(SUBMIT_BUTTON);
        disableButton(SUBMIT_BUTTON);
    }

    // go to site handler
    GO_TO_SITE_BUTTON.onclick = () => chrome.tabs.create({ url: 'https://puzzle-english.com' });

    // send words 
    SUBMIT_BUTTON.onclick = async (event) => {
        if (!WORDS_AREA.value) return;
        disableButton(SUBMIT_BUTTON);
        const PREVIEW_OBJECT = await CorePuzzleEnglishDictionaryModule.checkWords(COOKIES, WORDS_AREA.value);
        try {
            const ADDING_RESULT = await CorePuzzleEnglishDictionaryModule.addWords(COOKIES, PREVIEW_OBJECT.previewWords);
            event.target.innerText = `Добавлено слов ${ADDING_RESULT.addCount}`;
        }
        catch (err) { event.target.innerText = `Слова не добавлены`; }
        finally {
            WORDS_AREA.value = '';
            setTimeout(() => event.target.innerText = `Добавить слова`, 1000);
        }
    };
}, false);

function disableButton(button) {
    button.classList.remove("redesign-button_bg_green");
    button.classList.add("redesign-button_bg-disabled");
}

function enableButton(button) {
    button.classList.remove("redesign-button_bg-disabled");
    button.classList.add("redesign-button_bg_green");
}

