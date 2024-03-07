// eslint-disable-next-line no-undef
importScripts("node_modules/webextension-polyfill/dist/browser-polyfill.js", "core.js");

browser.contextMenus.removeAll().then(() => {
  browser.contextMenus.create({
    title: "Добавить '%s' в словарь",
    id: 'puzzlecontextmenu',
    contexts: ['selection'],
    onclick: async (info) => addWord(info.selectionText),
    visible: true
  });
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
  browser.contextMenus.update('puzzlecontextmenu', { visible: !!contextMenu });
}

syncConfig();

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == 'changeOptions') syncConfig();
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
      try {
        const RESPONSE = await CorePuzzleEnglishDictionaryModule.addWordBaloon(request.options);
        browser.browserAction.setBadgeBackgroundColor({ color: '#0f6e00' });
        browser.browserAction.setBadgeText({ text: '+1' });
        sendResponse(RESPONSE);
      }
      catch (err) {
        browser.browserAction.setBadgeBackgroundColor({ color: '#a60b00' });
        browser.browserAction.setBadgeText({ text: '0' });
      }
      finally {
        setTimeout(() => browser.browserAction.setBadgeText({ text: '' }), 1000);
      }
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
  if(request.type == 'deleteWord') {
    (async () => {
      try {
        await CorePuzzleEnglishDictionaryModule.deleteWord(request.options.id, request.options.translation);
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false });
      }
    })();
  }
  return true;
});

async function addWord(word) {
  try {
    const PREVIEW_OBJECT = await CorePuzzleEnglishDictionaryModule.checkWords(word);
    await CorePuzzleEnglishDictionaryModule.addWords(PREVIEW_OBJECT.previewWords);
    browser.browserAction.setBadgeBackgroundColor({ color: '#0f6e00' });
    browser.browserAction.setBadgeText({ text: '+1' });
  }
  catch (err) {
    if (err === 'Authentication required') {
      let result = confirm('Вы не авторизованы на сайте Puzzle English. Перейти к авторизации?');
      if (result) browser.tabs.create({ url: 'https://puzzle-english.com' });
    }
    browser.browserAction.setBadgeBackgroundColor({ color: '#a60b00' });
    browser.browserAction.setBadgeText({ text: '0' });
  }
  finally {
    setTimeout(() => browser.browserAction.setBadgeText({ text: '' }), 1000);
  }
}
