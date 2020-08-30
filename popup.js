document.addEventListener('DOMContentLoaded', async () => {
    const WORK_AREA = document.querySelector('.work-area'),
        NEED_AUTH_AREA = document.querySelector('.need-auth-area');

    const COOKIES = getAuthCookies();
    try { await checkWords(COOKIES, 'test auth'); }
    catch (err) {
        WORK_AREA.classList.add("hide-area");
        NEED_AUTH_AREA.classList.remove("hide-area");
    }


    formValidation();

    const SUBMIT_BUTTON = document.querySelector('.redesign-button');

    const GO_TO_SITE_BUTTON = document.querySelector('#go-to-site');

    GO_TO_SITE_BUTTON.onclick = (event) => {
        var newURL = "https://puzzle-english.com";
        chrome.tabs.create({ url: newURL });
    }

    SUBMIT_BUTTON.onclick = async (event) => {
        const WORDS_AREA = document.querySelector('#words-area');
        if (!WORDS_AREA.value) return;
        const PREVIEW_OBJECT = await checkWords(COOKIES, WORDS_AREA.value);
        const ADDING_RESULT = await addWords(COOKIES, PREVIEW_OBJECT.previewWords);
        WORDS_AREA.value = '';
        disableButton(SUBMIT_BUTTON);
        event.target.innerText = `Добавлено слов ${ADDING_RESULT.addCount}`;
        setTimeout(() => event.target.innerText = `Добавить слова`, 1000);
    };
}, false);

function formValidation() {
    const WORDS_AREA = document.querySelector('#words-area');
    const SUBMIT_BUTTON = document.querySelector('.redesign-button');
    WORDS_AREA.oninput = (event) => {
        if (event.target.value) return enableButton(SUBMIT_BUTTON);
        disableButton(SUBMIT_BUTTON);
    }
}

function disableButton(button) {
    button.classList.remove("redesign-button_bg_green");
    button.classList.add("redesign-button_bg-disabled");
}

function enableButton(button) {
    button.classList.remove("redesign-button_bg-disabled");
    button.classList.add("redesign-button_bg_green");
}

