'use strict';

document.onkeyup = (e) => {
  if (e.key.toLowerCase() === 'escape') {
    document.querySelectorAll('puzzle-english-dictionary-host').forEach((popup) => popup.remove());
  }
}

document.onmousedown = (downEvent) => {
  document.onmouseup = async (upEvent) => {
    const SELECTION = CorePuzzleEnglishDictionaryModule.getSelected().toString();
    document.querySelectorAll('puzzle-english-dictionary-host').forEach((popup) => popup.remove());
    if (!SELECTION) return;
    const items = await chrome.storage.sync.get([
      'bubble', 'fastAdd', 'showTranslate', 'closeButton', 'contextMenu',
      'autoShowTranslation', 'autoPronunciation'
    ]);
    if (items.bubble === undefined) {
      items.bubble = true;
      await chrome.storage.sync.set(
        {
          bubble: true,
          fastAdd: items.fastAdd === undefined ? true : items.fastAdd,
          showTranslate: items.showTranslate === undefined ? true : items.showTranslate,
          closeButton: items.closeButton === undefined ? true : items.closeButton,
          contextMenu: items.contextMenu === undefined ? true : items.contextMenu,
          autoShowTranslation: items.autoShowTranslation === undefined ? false : items.autoShowTranslation,
          autoPronunciation: items.autoPronunciation === undefined ? false : items.autoPronunciation
        }
      );
    }
    if (items && (items.bubble || items.autoShowTranslation)) {
      if (
        downEvent.target.nodeName == 'INPUT' ||
        upEvent.target.nodeName == 'INPUT' ||
        upEvent.target.nodeName == 'TEXTAREA'
      ) return;
      const WORD = SELECTION.trim();
      if (WORD && /[a-zA-Z'-]/.test(WORD) && !/[а-яА-Я0-9{}<>()\s]/.test(WORD)) {
        setTimeout(() => {
          ExtStore.selectedWord = WORD;
          const BUBBLE_HOST = document.createElement('puzzle-english-dictionary-host');
          BUBBLE_HOST.addEventListener('mousedown', (event) => event.stopPropagation());
          BUBBLE_HOST.addEventListener('mouseup', (event) => event.stopPropagation());
          BUBBLE_HOST.setAttribute('type', items.autoShowTranslation ? 'loading' : 'initial');
          BUBBLE_HOST.setAttribute('position-x', upEvent.pageX);
          BUBBLE_HOST.setAttribute('position-y', upEvent.pageY + 15);
          document.body.appendChild(BUBBLE_HOST);
          if (items.autoShowTranslation) BUBBLE_HOST.showTranslationsListener();
        }, 150);
      }
    }
  };
};
