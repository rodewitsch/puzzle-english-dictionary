'use strict';

document.onmousedown = (downEvent) => {
  document.onmouseup = (upEvent) => {
    chrome.storage.sync.get(['bubble'], (items) => {
      if (items && items.bubble) {
        if (
          downEvent.target.nodeName == 'INPUT' ||
          upEvent.target.nodeName == 'INPUT' ||
          upEvent.target.nodeName == 'TEXTAREA'
        )
          return;
        const SELECTION = CorePuzzleEnglishDictionaryModule.getSelected().toString();
        document.querySelectorAll('puzzle-english-dictionary-host').forEach((popup) => popup.remove());
        if (
          SELECTION &&
          SELECTION.trim() &&
          !/[а-яА-Я {2}]/.test(SELECTION.trim()) &&
          !(SELECTION.trim().match(/ /g) || []).length
        ) {
          setTimeout(() => {
            StoreInstance.selectedWord = SELECTION.trim();
            const BUBBLE_HOST = document.createElement('puzzle-english-dictionary-host');
            BUBBLE_HOST.addEventListener('mousedown', (event) => event.stopPropagation());
            BUBBLE_HOST.addEventListener('mouseup', (event) => event.stopPropagation());
            BUBBLE_HOST.setAttribute('type', 'initial');
            BUBBLE_HOST.setAttribute('position-x', upEvent.pageX);
            BUBBLE_HOST.setAttribute('position-y', upEvent.pageY + 15);
            document.body.appendChild(BUBBLE_HOST);
          }, 150);
        }
      }
    });
  };
};
