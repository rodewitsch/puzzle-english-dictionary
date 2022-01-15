browser.contextMenus.create({
  title: "Добавить '%s' в словарь",
  id: 'MY_CONTEXT_MENU',
  contexts: ['selection'],
  onclick: async (info) => addWord(info.selectionText),
  visible: true
});

async function syncConfig() {
  const items = (await browser.storage.sync.get(['bubble', 'fastAdd', 'showTranslate', 'closeButton', 'contextMenu']) || {})
  await browser.storage.sync.set(
    {
      bubble: items.bubble === undefined ? true : items.bubble,
      fastAdd: items.fastAdd === undefined ? true : items.fastAdd,
      showTranslate: items.showTranslate === undefined ? true : items.showTranslate,
      closeButton: items.closeButton === undefined ? true : items.closeButton,
      contextMenu: items.contextMenu === undefined ? true : items.contextMenu
    }
  );
  const { contextMenu } = await browser.storage.sync.get(['contextMenu']);
  browser.contextMenus.update('MY_CONTEXT_MENU', { visible: !!contextMenu });
}

syncConfig();

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == 'changeOptions') syncConfig();
  if (request.type == 'simpleAddWord' && request.options && request.options.word) {
    (async () => {
      await addWord(request.options.word);
      browser.browserAction.setBadgeText({ text: '+1' });
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
      browser.browserAction.setBadgeText({ text: '+1' });
      setTimeout(() => browser.browserAction.setBadgeText({ text: '' }), 1000);
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
        await CorePuzzleEnglishDictionaryModule.checkWords((request.options || {}).word || 'test auth');
        sendResponse({ auth: true });
      } catch (err) {
        sendResponse({ auth: false });
      }
    })();
  }
  return true;
});

async function addWord(word) {
  const PREVIEW_OBJECT = await CorePuzzleEnglishDictionaryModule.checkWords(word);
  await CorePuzzleEnglishDictionaryModule.addWords(PREVIEW_OBJECT.previewWords);
  browser.browserAction.setBadgeText({ text: '+1' });
  setTimeout(() => browser.browserAction.setBadgeText({ text: '' }), 1000);
}
