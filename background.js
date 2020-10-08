chrome.contextMenus.create({
  title: "Добавить '%s' в словарь",
  id: "MY_CONTEXT_MENU",
  contexts: ["all"],
  onclick: async (info) => addWord(info.selectionText)
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == 'simpleAddWord' && request.options && request.options.word) {
    (async () => {
      await addWord(request.options.word);
      sendResponse({ message: 'ok' });
    })();
  }
  if (request.type == 'checkWord' && request.options && request.options.word) {
    (async () => {
      const WORD_INFO = await CorePuzzleEnglishDictionaryModule.checkWordBaloon(request.options.word);
      sendResponse(WORD_INFO);
    })();
  }
  if (request.type == 'addWord' && request.options) {
    (async () => {
      const RESPONSE = await CorePuzzleEnglishDictionaryModule.addWordBaloon(request.options);
      sendResponse(RESPONSE);
    })();
  }
  if (request.type == 'playWord' && request.options) {
    (async () => {
      CorePuzzleEnglishDictionaryModule.playAudio(request.options.speaker, request.options.word);
    })();
  }
  if (request.type == 'checkAuth') {
    (async () => {
      try {
        await CorePuzzleEnglishDictionaryModule.checkWords('test auth');
        sendResponse({ auth: true })
      }
      catch (err) {
        sendResponse({ auth: false })
      }
    })();
  }
  return true;
});

async function addWord(word) {
  const PREVIEW_OBJECT = await CorePuzzleEnglishDictionaryModule.checkWords(word);
  await CorePuzzleEnglishDictionaryModule.addWords(PREVIEW_OBJECT.previewWords);
}
