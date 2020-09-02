function getAuthCookies() {
    const HOST = 'https://puzzle-english.com',
        COOKIES_KEYS = ['PHPSESSID'];

    return Promise
        .all(COOKIES_KEYS.map(KEY => getCookie(HOST, KEY)))
        .then(COOKIES =>
            Promise.resolve(
                COOKIES.reduce((acc, cookie, index) => acc += `${COOKIES_KEYS[index]}=${cookie};`, '')
            )
        )
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
        .then(data => data.error ? Promise.reject(data.error) : Promise.resolve(data));
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
        .then(data => data.error || !data.status ? Promise.reject(data.error) : Promise.resolve(data));
}

function getCookie(url, name) {
    return new Promise(resolve => {
        chrome.cookies.get({ url, name }, cookie => resolve(cookie ? cookie.value : ''));
    })
}