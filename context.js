const CONTEXT_MENU_ID = "MY_CONTEXT_MENU";
async function getword(info) {
  if (info.menuItemId !== CONTEXT_MENU_ID) return;
  const COOKIES = await getAuthCookies();
  const PREVIEW_OBJECT = await checkWords(COOKIES, info.selectionText);
  await addWords(COOKIES, PREVIEW_OBJECT.previewWords);
}
chrome.contextMenus.create({
  title: "Добавить '%s' в словарь",
  contexts: ["selection"],
  id: CONTEXT_MENU_ID
});
chrome.contextMenus.onClicked.addListener(getword)
