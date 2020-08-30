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
        .then(data => data.error || !data.status ? Promise.reject(data.error) : Promise.resolve(data));
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