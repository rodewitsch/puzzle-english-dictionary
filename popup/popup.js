/* eslint-disable no-undef */
document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const WORK_AREA = document.querySelector(".work-area"),
      NEED_AUTH_AREA = document.querySelector(".need-auth-area"),
      SUBMIT_BUTTON = document.querySelector(".button"),
      GO_TO_SITE_BUTTON = document.querySelector("#go-to-site"),
      WORDS_AREA = document.querySelector("#words-area"),
      OPTIONS_BUTTON = document.querySelector("#options"),
      SEARCH_WORD_INPUT = document.querySelector('#seach-word-input'),
      OPEN_LIST = document.querySelector('#open-list'),
      OPEN_SEARCH = document.querySelector('#open-search'),
      CLEAN_INPUT_BUTTON = document.querySelector('.clean-input__button'),
      SEARCH_LIST = document.querySelector('#search-list');


    openTab({ currentTarget: OPEN_SEARCH }, 'search');
    setTimeout(() => SEARCH_WORD_INPUT.focus(), 200);

    OPEN_LIST.onclick = (event) => {
      openTab(event, 'list');
      setTimeout(() => WORDS_AREA.focus(), 200);
    };

    OPEN_SEARCH.onclick = (event) => {
      openTab(event, 'search');
      setTimeout(() => SEARCH_WORD_INPUT.focus(), 200);
    }

    CLEAN_INPUT_BUTTON.onclick = () => {
      SEARCH_LIST.innerHTML = '';
      SEARCH_WORD_INPUT.value = '';
      CLEAN_INPUT_BUTTON.classList.remove('dirty');
    };

    SEARCH_WORD_INPUT.onkeypress = () => {
      if (SEARCH_WORD_INPUT.value.length > 0) {
        CLEAN_INPUT_BUTTON.classList.add('dirty');
      } else {
        CLEAN_INPUT_BUTTON.classList.remove('dirty');
      }
    };

    SEARCH_WORD_INPUT.oninput = CorePuzzleEnglishDictionaryModule.debounce(async () => {
      if (SEARCH_WORD_INPUT.value.length > 0) {
        const result = await CorePuzzleEnglishDictionaryModule.globalSearch(SEARCH_WORD_INPUT.value);
        const words = parseGlobalSearchResult(result);
        SEARCH_LIST.innerHTML = words.map(word => word.saved
          ? `<div><span><strong>${word.word}</strong> - ${word.translation}</span></div>`
          : `<div><span><strong>${word.word}</strong> - ${word.translation}</span><div class="global_search_add_word" data-word="${word.word}" data-translation="${word.translation}">Добавить</div></div>`).join('')
        SEARCH_LIST.querySelectorAll("div.global_search_add_word").forEach(button => {
          button.addEventListener('click', async (event) => {
            await CorePuzzleEnglishDictionaryModule.addWordFromSearch(
              event.target.dataset['word'],
              event.target.dataset['translation']
            );
            event.target.remove();
          }, { once: true });
        })
      } else {
        SEARCH_LIST.innerHTML = '';
        CLEAN_INPUT_BUTTON.classList.remove('dirty');
      }
    }, 300);

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
  button.classList.remove("button_bg_green");
  button.classList.add("button_bg-disabled");
}

function enableButton(button) {
  button.classList.remove("button_bg-disabled");
  button.classList.add("button_bg_green");
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
