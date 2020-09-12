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
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "startTranslate", function (response) {
        console.log("event has been casted", response);
      });
    });
  }
});