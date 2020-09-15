const CorePuzzleEnglishDictionaryModule = (() => {
    return {
        getAuthCookies: () => {
            const HOST = 'https://puzzle-english.com',
                COOKIES_KEYS = ['PHPSESSID'];

            return Promise
                .all(COOKIES_KEYS.map(KEY => this.getPECookie(HOST, KEY)))
                .then(COOKIES =>
                    Promise.resolve(
                        COOKIES.reduce((acc, cookie, index) => acc += `${COOKIES_KEYS[index]}=${cookie};`, '')
                    )
                )
        },
        checkWords: (cookies, words) => {
            const formData = new FormData();
            formData.append('words', words);
            return fetch('https://puzzle-english.com/api2/dictionary/checkWordsFromMassImport', {
                method: 'POST',
                headers: { cookies },
                body: formData
            })
                .then(response => response.json())
                .then(data => data.error ? Promise.reject(data.error) : Promise.resolve(data));
        },
        addWords: (cookies, words) => {
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
        },
        getPECookie: (url, name) => {
            return new Promise(resolve => {
                chrome.cookies.get({ url, name }, cookie => resolve(cookie ? cookie.value : ''));
            })
        },
        injectScript: (document, url) => {
            return new Promise((resolved, rejected) => {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.onload = () => resolved();
                script.onerror = () => rejected();
                script.src = url;
                document.head.appendChild(script);
            })
        },
        injectStyle: (document, url) => {
            return new Promise((resolved, rejected) => {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                link.onload = () => resolved();
                link.onerror = () => rejected();
                document.head.appendChild(link);
            })
        },
        wrapElem: (elem) => {
            let div = document.createElement('div');
            div.setAttribute('class', 'balloon-row');
            div.setAttribute('style', 'display: inline;');
            div.innerHTML = elem.innerHTML;
            elem.innerHTML = null;
            elem.appendChild(div);
        },
        disableLink: (link) => {
            link.parentElement.classList.add('isDisabled');
            link.setAttribute('data-href', link.href);
            link.href = '';
            link.setAttribute('aria-disabled', 'true');
        },
        enableLink: (link) => {
            link.parentElement.classList.remove('isDisabled');
            link.href = link.getAttribute('data-href');
            link.removeAttribute('aria-disabled');
        }
    }
})();

