document.addEventListener('DOMContentLoaded', async () => {
    const COOKIES = getAuthCookies();

    formValidation();

    const SUBMIT_BUTTON = document.querySelector('.redesign-button');

    SUBMIT_BUTTON.onclick = async (event) => {
        const WORDS_AREA = document.querySelector('#wordsArea');
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
    const WORDS_AREA = document.querySelector('#wordsArea');
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

function getAuthCookies() {
    const HOST = 'https://puzzle-english.com',
        COOKIES_KEYS = [
            '_fbp',
            '_ym_uid',
            '__exponea_etc__',
            '_ga',
            'dbl',
            'fco2r34',
            'wp_logged_in_cookie',
            '_ym_d',
            'sort_dictionary',
            'tg_landing_aug2020',
            'teacher-board-mode',
            '_gid',
            'PHPSESSID',
            '_ym_isad',
            '_ym_wasSynced',
            '__exponea_time2__',
            '_ym_visorc_21951133',
            '_ym_hostIndex',
            '_dc_gtm_UA-816465-6'
        ];

    return Promise.all(COOKIES_KEYS.map(KEY => getCookie(HOST, KEY)))
        .then(COOKIES => {
            return Promise.resolve(COOKIES.reduce((acc, cookie, index) => acc += `${COOKIES_KEYS[index]}=${cookie};`, ''));
        })
}

function checkWords(cookies, words) {
    const formData = new FormData();
    formData.append('words', words);
    return fetch('https://puzzle-english.com/api2/dictionary/checkWordsFromMassImport', {
        method: 'POST',
        headers: { cookies },
        body: formData
    })
        .then(response => response.json())
}

function addWords(cookies, words) {
    const formData = new FormData();
    formData.append('words', JSON.stringify(words));
    formData.append('idSet', '0');
    return fetch('https://puzzle-english.com/api2/dictionary/addWordsFromMassImport', {
        method: 'POST',
        headers: { cookies },
        body: formData
    })
        .then(response => response.json())
}

function getCookie(url, name) {
    return new Promise((resolve, reject) => {
        chrome.cookies.get({ url, name }, cookie => resolve(cookie ? cookie.value : ''));
    })
}