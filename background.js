// eslint-disable-next-line no-undef
importScripts("core.js");

chrome.contextMenus.removeAll()
chrome.contextMenus.create({
  title: "Добавить '%s' в словарь",
  id: 'puzzlecontextmenu',
  contexts: ['selection'],
  visible: true
});
chrome.contextMenus.onClicked.addListener((info) => addWord(info.selectionText));

async function syncConfig() {
  const items = (await chrome.storage.sync.get(['bubble', 'fastAdd', 'showTranslate', 'closeButton', 'contextMenu']) || {})
  await chrome.storage.sync.set(
    {
      bubble: items.bubble === undefined ? true : items.bubble,
      fastAdd: items.fastAdd === undefined ? true : items.fastAdd,
      showTranslate: items.showTranslate === undefined ? true : items.showTranslate,
      closeButton: items.closeButton === undefined ? true : items.closeButton,
      contextMenu: items.contextMenu === undefined ? true : items.contextMenu
    }
  );
  const { contextMenu } = await chrome.storage.sync.get(['contextMenu']);
  chrome.contextMenus.update('puzzlecontextmenu', { visible: !!contextMenu });
}

/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {object} options - playback options
 * @param {number} options.volume - volume level
 * @param {number} options.speed - playback speed
 */
async function playSound(source = 'default.wav', options) {
  await createOffscreen();
  if (!options) options = {};
  if (options.volume === undefined) options.volume = 1;
  if (options.speed === undefined) options.speed = 1;
  await chrome.runtime.sendMessage({ type: 'play', play: { source, volume: options.volume, speed: options.speed }, offscreen: true });
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen/offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'testing' // details for using the API
  });
}

syncConfig();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
        chrome.action.setBadgeBackgroundColor({ color: '#0f6e00' });
        chrome.action.setBadgeText({ text: '+1' });
        sendResponse(RESPONSE);
      }
      catch (err) {
        chrome.action.setBadgeBackgroundColor({ color: '#a60b00' });
        chrome.action.setBadgeText({ text: '0' });
      }
      finally {
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1000);
      }
    })();
  }
  if (request.type == 'playWord' && request.options) {
    (async () => {
      playSound(`https://static.puzzle-english.com/words/${request.options.speaker}/${request.options.word}.mp3?${this.time}`, { speed: request.options.speed })
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
  if (request.type == 'deleteWord') {
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
    chrome.action.setBadgeBackgroundColor({ color: '#0f6e00' });
    chrome.action.setBadgeText({ text: '+1' });
  }
  catch (err) {
    if (err === 'Authentication required') {
      let result = confirm('Вы не авторизованы на сайте Puzzle English. Перейти к авторизации?');
      if (result) chrome.tabs.create({ url: 'https://puzzle-english.com' });
    }
    chrome.action.setBadgeBackgroundColor({ color: '#a60b00' });
    chrome.action.setBadgeText({ text: '0' });
  }
  finally {
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1000);
  }
}
