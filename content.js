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
            CorePuzzleEnglishDictionaryModule.wrapElem(elem);
        }
        for (const elem of document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, span, em')) {
            if (elem.querySelector('svg')) continue;
            CorePuzzleEnglishDictionaryModule.wrapElem(elem);
        }
    }

    async function initTranslation(id_user) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `$(function () {
            PE_Balloon.init({
                wrap_words: true, id_user: '${id_user}', our_helper: false});
            });`
        document.head.appendChild(script);
    }

    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.message == 'startTranslate') {
            await injectDependencies();
            prepareDocument();
            initTranslation(request.id_user);
            sendResponse('ok');
        }
    });
})();

