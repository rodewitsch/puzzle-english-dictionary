class PuzzleEnglishDictionaryHost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  render() {
    this.classList.add("puzzle-english-dictionary-host", "ped-bubble");
    while (this.shadowRoot.lastChild)
      this.shadowRoot.removeChild(this.shadowRoot.lastChild);

    switch (this.getAttribute("type")) {
      case "initial": {
        this.setAttribute(
          "style",
          `position: absolute; left: ${this.getAttribute(
            "positionX"
          )}px; top: ${this.getAttribute("positionY")}px; z-index: 2147483647;`
        );
        const TEMPLATE = document.createElement("template");
        TEMPLATE.innerHTML = `
                    <style>
                        .ped-bubble-button {
                            cursor: pointer;
                            padding: 0 20px;
                            width: 110px;
                            height: 40px;
                            border-radius: 3px;
                            color: white;
                            display: flex;
                            justify-content: space-around;
                            align-items: center;
                            font-size: 15px;
                        }
                    </style>
                    <initial-buttons></initial-buttons>
                `;
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        // this.shadowRoot.querySelector('bubble-button').addEventListener('test-event', event => {
        //     this.setAttribute('positionX', +this.getAttribute('positionX') + 100);
        // });
        break;
      }
    }
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback() {
    this.render();
  }
}

customElements.define(
  "puzzle-english-dictionary-host",
  PuzzleEnglishDictionaryHost
);
