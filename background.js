chrome.contextMenus.create({
  title: "Puzzle English Dictionary (Unofficial)",
  id: "MY_CONTEXT_MENU",
  contexts: ["all"]
});

chrome.contextMenus.create({
  title: "Добавить '%s' в словарь",
  contexts: ["selection"],
  parentId: "MY_CONTEXT_MENU",
  onclick: async (info) => {
    const COOKIES = await CorePuzzleEnglishDictionaryModule.getAuthCookies();
    const PREVIEW_OBJECT = await CorePuzzleEnglishDictionaryModule.checkWords(COOKIES, info.selectionText);
    await CorePuzzleEnglishDictionaryModule.addWords(COOKIES, PREVIEW_OBJECT.previewWords);
  }
});

chrome.contextMenus.create({
  title: "Включить режим перевода по клику",
  parentId: "MY_CONTEXT_MENU",
  contexts: ["all"],
  onclick: () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
      const id_user = await CorePuzzleEnglishDictionaryModule.getPECookie('https://puzzle-english.com', 'pe_user_id');
      if (!id_user) return alert('Не получен идентификатор пользователя');
      chrome.tabs.sendMessage(tabs[0].id, { message: "startTranslate", id_user }, function (response) {
        console.log("event has been casted", response);
      });
    });
  }
});