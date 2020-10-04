chrome.contextMenus.create({
  title: "Puzzle English Dictionary (Unofficial)",
  id: "MY_CONTEXT_MENU",
  contexts: ["all"]
});

chrome.contextMenus.create({
  title: "Добавить '%s' в словарь",
  contexts: ["selection"],
  parentId: "MY_CONTEXT_MENU",
  onclick: async (info) => addWord(info.selectionText)
});

chrome.contextMenus.create({
  title: "Включить режим перевода по клику",
  parentId: "MY_CONTEXT_MENU",
  contexts: ["all"],
  onclick: async () => {

    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "startTranslate" }, function (response) {
        console.log("event has been casted", response);
      });
    });

    const PHPSESSID = await CorePuzzleEnglishDictionaryModule.getCookie('PHPSESSID');
    const WP_LOGGED_IN_COOKIE = await CorePuzzleEnglishDictionaryModule.getCookie('wp_logged_in_cookie');
    await Promise.all([
      CorePuzzleEnglishDictionaryModule.removeCookie('PHPSESSID'),
      CorePuzzleEnglishDictionaryModule.removeCookie('language_selected'),
      CorePuzzleEnglishDictionaryModule.removeCookie('wp_logged_in_cookie'),
      CorePuzzleEnglishDictionaryModule.removeCookie('tmp_user_id')
    ]);

    await Promise.all([
      CorePuzzleEnglishDictionaryModule.setCookie({ name: 'PHPSESSID', value: PHPSESSID.value }),
      CorePuzzleEnglishDictionaryModule.setCookie({ name: 'language_selected', value: 'ru' }),
      CorePuzzleEnglishDictionaryModule.setCookie({ name: 'tmp_user_id', value: `${Date.now()}` }),
      CorePuzzleEnglishDictionaryModule.setCookie({ name: 'wp_logged_in_cookie', value: WP_LOGGED_IN_COOKIE.value, expirationDate: WP_LOGGED_IN_COOKIE.expirationDate })
    ]);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == 'simpleAddWord' && request.options && request.options.word) {
    (async () => {
      await addWord(request.options.word);
      sendResponse({ message: 'ok' });
    })();
  }
  if (request.type == 'checkWord' && request.options && request.options.word) {
    console.log('checkWord');
    (async () => {
      const WORD_INFO = await CorePuzzleEnglishDictionaryModule.checkWordBaloon(request.options.word);
      sendResponse(WORD_INFO);
    })();
  }
  if (request.type == 'addWord' && request.options) {
    console.log('addWord');
    (async () => {
      const RESPONSE = await CorePuzzleEnglishDictionaryModule.addWordBaloon(request.options);
      sendResponse(RESPONSE);
    })();
  }
  return true;
});

async function addWord(word) {
  const COOKIES = await CorePuzzleEnglishDictionaryModule.getAuthCookies();
  const PREVIEW_OBJECT = await CorePuzzleEnglishDictionaryModule.checkWords(COOKIES, word);
  await CorePuzzleEnglishDictionaryModule.addWords(COOKIES, PREVIEW_OBJECT.previewWords);
}
