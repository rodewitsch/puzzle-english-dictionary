class BubbleButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  render() {
    // if (this.getAttribute('background-image')) {
    //     const ICON_URL = chrome.extension.getURL(`/assets/images/icons/${this.getAttribute('background-image')}.png`)
    //     this.style.backgroundImage = `url(${ICON_URL})`;
    // }

    this.shadowRoot.innerHTML = `
        <button id="but">button</button>
        <style>
            
        </style>
        `;
    // if (this.clickHandler) this.component.addEventListener('click', this.clickHandler);
  }

  connectedCallback() {
    this.addEventListener("click", (event) => {
      console.log("here");
      this.onClick();
      event.stopPropagation();
      event.preventDefault();
    });
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  onClick() {
    // This should trigger a setter which updates the DOM
    this.dispatchEvent(new CustomEvent("test-event"));
  }
}

customElements.define("bubble-button", BubbleButton);
