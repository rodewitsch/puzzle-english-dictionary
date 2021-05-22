/* eslint-disable no-undef */
// Saves options to chrome.storage
function save_options() {
  // eslint-disable-next-line no-undef
  chrome.storage.sync.set(
    {
      bubble: getOptionElem("bubble").checked,
      fastAdd: getOptionElem("fast-add").checked,
      showTranslate: getOptionElem("show-translate").checked,
      closeButton: getOptionElem("close-button").checked,
      contextMenu: getOptionElem("context-menu").checked,
    },
    () => chrome.runtime.sendMessage({ type: "changeOptions" })
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(
    ["bubble", "fastAdd", "showTranslate", "closeButton", "contextMenu"],
    (items) => {
      getOptionElem("bubble").checked = items.bubble;
      getOptionElem("fast-add").checked = items.fastAdd;
      getOptionElem("show-translate").checked = items.showTranslate;
      getOptionElem("close-button").checked = items.closeButton;
      getOptionElem("context-menu").checked = items.contextMenu;
    }
  );
}

function getOptionElem(elem) {
  return document.getElementById(elem);
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("DOMContentLoaded", restore_options);
  restore_options();
  document.getElementById("save").addEventListener("click", save_options);
  document.getElementById("reset").addEventListener("click", restore_options);
});
