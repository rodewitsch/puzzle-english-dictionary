class BubbleButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    // eslint-disable-next-line no-undef
    const ICON_URL = chrome.extension.getURL(`/assets/images/icons/${this.getAttribute('background-image')}.png`);

    this.shadowRoot.innerHTML = `
        <style>
            .button {
                height: 30px;
                margin-right: -8px;
                cursor: pointer;
            }
        </style>
        <img src="${ICON_URL}" class="button"></img>
        `;
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent(this.getAttribute('cast-event'), {bubbles: true, composed: true}));
    });
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('bubble-button', BubbleButton);
