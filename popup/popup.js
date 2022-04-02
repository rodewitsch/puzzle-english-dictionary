/* eslint-disable no-undef */
document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const WORK_AREA = document.querySelector(".work-area"),
      NEED_AUTH_AREA = document.querySelector(".need-auth-area"),
      SUBMIT_BUTTON = document.querySelector(".redesign-button"),
      GO_TO_SITE_BUTTON = document.querySelector("#go-to-site"),
      WORDS_AREA = document.querySelector("#words-area"),
      OPTIONS_BUTTON = document.querySelector("#options"),
      SEARCH_WORD_INPUT = document.querySelector('#seachWordInput'),
      OPEN_LIST = document.querySelector('#openList'),
      OPEN_SEARCH = document.querySelector('#openSearch'),
      SEARCH_LIST = document.querySelector('#searchList');

    OPEN_LIST.onclick = (event) => openTab(event, 'list');

    OPEN_SEARCH.onclick = (event) => openTab(event, 'search');

    SEARCH_WORD_INPUT.onchange = async () => {
      if (SEARCH_WORD_INPUT.value.length > 0) {
        const result = await CorePuzzleEnglishDictionaryModule.globalSearch(SEARCH_WORD_INPUT.value);
        const words = parseGlobalSearchResult(result);
        SEARCH_LIST.innerHTML = words.map(word => word.saved ? `<div><span>${word.word} - ${word.translation}</span>` : `<div><span>${word.word} - ${word.translation}</span><button data-word="${word.word}" data-translation="${word.translation}">Добавить</button></div>`).join('')
        SEARCH_LIST.querySelectorAll('button').forEach(button => {
          button.addEventListener('click', async (event) => {
            const savingResult = await CorePuzzleEnglishDictionaryModule.addWordFromSearch(
              event.target.dataset['word'],
              event.target.dataset['translation']
            );
            console.log(savingResult);
          }, { once: true });
        })
      }
    }

    OPTIONS_BUTTON.onclick = () => {
      if (browser.runtime.openOptionsPage) {
        browser.runtime.openOptionsPage();
      } else {
        window.open(browser.runtime.getURL("options.html"));
      }
    };

    // check auth
    try {
      await CorePuzzleEnglishDictionaryModule.checkWords("test auth");
    } catch (err) {
      WORK_AREA.classList.add("hide-area");
      NEED_AUTH_AREA.classList.remove("hide-area");
    }

    // registering a form validation handler
    WORDS_AREA.oninput = (event) => {
      if (event.target.value) return enableButton(SUBMIT_BUTTON);
      disableButton(SUBMIT_BUTTON);
    };

    // go to site handler
    GO_TO_SITE_BUTTON.onclick = () =>
      browser.tabs.create({ url: "https://puzzle-english.com" });

    // send words
    SUBMIT_BUTTON.onclick = async (event) => {
      if (!WORDS_AREA.value) return;
      disableButton(SUBMIT_BUTTON);
      const PREVIEW_OBJECT = await CorePuzzleEnglishDictionaryModule.checkWords(
        WORDS_AREA.value
      );
      try {
        const ADDING_RESULT = await CorePuzzleEnglishDictionaryModule.addWords(
          PREVIEW_OBJECT.previewWords
        );
        event.target.innerText = `Добавлено слов ${ADDING_RESULT.addCount}`;
      } catch (err) {
        event.target.innerText = `Слова не добавлены`;
      } finally {
        WORDS_AREA.value = "";
        setTimeout(() => (event.target.innerText = `Добавить слова`), 1000);
      }
    };
  },
  false
);

function disableButton(button) {
  button.classList.remove("redesign-button_bg_green");
  button.classList.add("redesign-button_bg-disabled");
}

function enableButton(button) {
  button.classList.remove("redesign-button_bg-disabled");
  button.classList.add("redesign-button_bg_green");
}

function parseGlobalSearchResult(data) {
  const template = document.createElement('template');
  template.innerHTML = data.replace(/\\"/g, '"').replace(/\\n/g, '').replace(/<\\\//g, '</');
  return Array.from(template.content.querySelectorAll("div[data-target]")).reduce((acc, i) => {
    acc = [...acc, {
      word: i.dataset['word'],
      translation: i.dataset['translation'],
      saved: !i.parentElement.querySelector('.global_search_add_word')
    }];
    return acc;
  }, []);
}

function openTab(evt, cityName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}
