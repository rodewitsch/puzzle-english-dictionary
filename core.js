const CorePuzzleEnglishDictionaryModule = (() => {
  return {
    url: 'https://puzzle-english.com',
    domain: 'puzzle-english.com',
    partner_id: 2676311,
    time: new Date().getTime(),
    /**
     * Check words and return object for addWords function
     * @param {string} cookies - auth cookies
     * @param {string} words - string of words
     * @returns {Promise<object>}
     */
    checkWords: function (words) {
      const formData = new FormData();
      formData.append('words', words);
      return fetch(`${this.url}/api2/dictionary/checkWordsFromMassImport`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
        .then((response) => response.json())
        .then((data) => (data.error ? Promise.reject(data.error) : Promise.resolve(data)));
    },
    /**
     * Save words
     * @param {string} cookies - auth cookies
     * @param {object} words - object from checkWords function
     * @returns {Promise<object>}
     */
    addWords: function (words) {
      const formData = new FormData();
      formData.append('words', JSON.stringify(words));
      formData.append('idSet', '0');
      return fetch(`${this.url}/api2/dictionary/addWordsFromMassImport`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
        .then((response) => response.json())
        .then((data) => (data.error || !data.status ? Promise.reject(data.error) : Promise.resolve(data)));
    },
    /**
     * Inject a script to an element
     * @param {object} element - NodeElement
     * @param {string} url - src of a script
     * @return {Promise<void>}
     */
    injectScript: function (element, url) {
      return new Promise((resolved, rejected) => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => resolved();
        script.onerror = () => rejected();
        script.src = url;
        document.head.appendChild(script);
      });
    },
    /**
     * Inject a style to an element
     * @param {object} element - NodeElement
     * @param {string} url - href of a style
     * @return {Promise<void>}
     */
    injectStyle: function (element, url) {
      return new Promise((resolved, rejected) => {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = () => resolved();
        link.onerror = () => rejected();
        element.appendChild(link);
      });
    },
    getSelected: function () {
      if (window.getSelection) {
        return window.getSelection();
      } else if (document.getSelection) {
        return document.getSelection();
      } else {
        var selection = document.selection && document.selection.createRange();
        if (selection.text) {
          return selection.text;
        }
        return false;
      }
    },
    checkWordBaloon: async function (word) {
      const PARAMS = {
        ajax_action: 'ajax_balloon_Show',
        piece_index: 0,
        word,
        external: 1,
        partner_id: this.partner_id
      };
      const RAW_RESPONSE = await fetch(`${this.url}?${new URLSearchParams(PARAMS).toString()}`);
      return await RAW_RESPONSE.json();
    },
    addWordBaloon: async function (info) {
      const PARAMS = {
        ajax_action: 'ajax_dictionary_addWord',
        word: info.word,
        translation: info.translation,
        part_of_speech: info.partOfSpeech,
        is_dictionary_page: 1,
        external: 1
      };
      const RAW_RESPONSE = await fetch(`${this.url}?${new URLSearchParams(PARAMS).toString()}`);
      return await RAW_RESPONSE.json();
    },
    getSpeakerInfo: function (name) {
      switch (name) {
        case 'vocabulary_US':
          return {
            name: 'Mel',
            flag: 'us.svg',
            face: 'mel.svg',
            audio: 'vocabulary_US'
          };
        case 'campbridge_UK':
          return {
            name: 'Tony',
            flag: 'uk.svg',
            face: 'tony.svg',
            audio: 'campbridge_UK'
          };
        case 'collins_UK':
          return {
            name: 'Fran',
            flag: 'uk.svg',
            face: 'fran.svg',
            audio: 'collins_UK'
          };
        case 'freedictionary_UK':
          return {
            name: 'John',
            flag: 'uk.svg',
            face: 'john.svg',
            audio: 'freedictionary_UK'
          };
        case 'howjsay_UK':
          return {
            name: 'Paul',
            flag: 'uk.svg',
            face: 'paul.svg',
            audio: 'howjsay_UK'
          };
        case 'vocalware_hugh_UK':
          return {
            name: 'Robot',
            flag: 'uk.svg',
            face: 'robot.svg',
            audio: 'vocalware_hugh_UK'
          };
        case 'SteveCampen_UK':
          return {
            name: 'Campen',
            flag: 'uk.svg',
            face: 'campen.svg',
            audio: 'SteveCampen_UK'
          };
        case 'Tamara_US':
          return {
            name: 'Tamara',
            flag: 'us.svg',
            face: 'tamara.svg',
            audio: 'Tamara_US'
          };
        case 'macquarie_AU':
          return {
            name: 'Kit',
            flag: 'us.svg',
            face: 'kit.svg',
            audio: 'macquarie_AU'
          };
        case 'freedictionary_US':
          return {
            name: 'Lisa',
            flag: 'us.svg',
            face: 'lisa.svg',
            audio: 'freedictionary_US'
          };
        case 'macmillan_UK':
          return {
            name: 'Cory',
            flag: 'uk.svg',
            face: 'cory.svg',
            audio: 'macmillan_UK'
          };
        case 'peterBaker_UK':
          return {
            name: 'Peter',
            flag: 'uk.svg',
            face: 'peter.svg',
            audio: 'peterBaker_UK'
          };
        case 'campbridge_US':
          return {
            name: 'Noel',
            flag: 'us.svg',
            face: 'noel.svg',
            audio: 'campbridge_US'
          };
        case 'yandex_UK':
          return {
            name: 'Nancy',
            flag: 'uk.svg',
            face: 'nancy.svg',
            audio: 'yandex_UK'
          };
        case 'collins_US':
          return {
            name: 'David',
            flag: 'us.svg',
            face: 'david.svg',
            audio: 'collins_US'
          };
        case 'SteveElliott_UK':
          return {
            name: 'Steve',
            flag: 'uk.svg',
            face: 'steve.svg',
            audio: 'SteveElliott_UK'
          };
        case 'HughMcEnaney_UK':
          return {
            name: 'Steve',
            flag: 'uk.svg',
            face: 'steve.svg',
            audio: 'HughMcEnaney_UK'
          };
      }
    },
    playAudio: function (speaker, word) {
      new Audio(`https://static.puzzle-english.com/words/${speaker}/${word}.mp3?${this.time}`).play();
    },
    getTextAsset: async function (path) {
      const URL = browser.runtime.getURL(path);
      const RAW = await fetch(URL);
      return await RAW.text();
    }
  };
})();
