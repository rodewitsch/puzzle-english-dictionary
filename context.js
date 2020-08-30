const CONTEXT_MENU_ID = "MY_CONTEXT_MENU";
async function getword(info,tab) {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }
  console.log("Word " + info.selectionText + " was clicked.");
  const COOKIES = getAuthCookies();
  const PREVIEW_OBJECT = await checkWords(COOKIES, info.selectionText);
  const ADDING_RESULT = await addWords(COOKIES, PREVIEW_OBJECT.previewWords);
}
chrome.contextMenus.create({
  title: "Добавить '%s' в словарь", 
  contexts:["selection"], 
  id: CONTEXT_MENU_ID
});
chrome.contextMenus.onClicked.addListener(getword)
