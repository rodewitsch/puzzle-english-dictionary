document.addEventListener('DOMContentLoaded', () => {
  const bubbleGlobalOption = document.getElementById('bubble');
  const fastAddOption = document.getElementById('fast-add');
  const showTranslateOption = document.getElementById('show-translate');
  const closeButtonOption = document.getElementById('close-button');
  const contextMenuOption = document.getElementById('context-menu');
  const saveButton = document.getElementById('save');
  const resetButton = document.getElementById('reset');
  restore_options();
  saveButton.addEventListener('click', save_options);
  resetButton.addEventListener('click', restore_options);
  bubbleGlobalOption.addEventListener('change', setBubbleGlobalOptionsState);
  fastAddOption.addEventListener('change', setBubbleGlobalOptionState);
  showTranslateOption.addEventListener('change', setBubbleGlobalOptionState);
  closeButtonOption.addEventListener('change', setBubbleGlobalOptionState);

  /**
   * Saves options to browser.storage
   */
  async function save_options() {
    await chrome.storage.sync.set(
      {
        bubble: bubbleGlobalOption.checked,
        fastAdd: fastAddOption.checked,
        showTranslate: showTranslateOption.checked,
        closeButton: closeButtonOption.checked,
        contextMenu: contextMenuOption.checked
      }
    );
    chrome.runtime.sendMessage({ type: 'changeOptions' });
  }

  /**
   * Restores select box and checkbox state using the preferences stored in chrome.storage.
   */
  async function restore_options() {
    const items = await chrome.storage.sync.get(['bubble', 'fastAdd', 'showTranslate', 'closeButton', 'contextMenu']);
    bubbleGlobalOption.checked = items.bubble;
    fastAddOption.checked = items.fastAdd;
    showTranslateOption.checked = items.showTranslate;
    closeButtonOption.checked = items.closeButton;
    contextMenuOption.checked = items.contextMenu;
  }

  /**
   * Turn on/off bubbleGlobalOption in depending to other options state
   */
  function setBubbleGlobalOptionState() {
    bubbleGlobalOption.checked = fastAddOption.checked || showTranslateOption.checked || closeButtonOption.checked;
  }

  /**
   * Turn on/off options in depending to bubbleGlobalOptions state
   */
  function setBubbleGlobalOptionsState() {
    fastAddOption.checked = showTranslateOption.checked = closeButtonOption.checked = bubbleGlobalOption.checked;
  }
});
