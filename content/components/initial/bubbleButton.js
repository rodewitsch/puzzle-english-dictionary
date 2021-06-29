class BubbleButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    this.type = this.getAttribute('type');
    // eslint-disable-next-line no-undef
    const ICON_URL = chrome.extension.getURL(`/assets/images/icons/${this.type}.png`);
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
        <style>
          :host{
            padding: 1px;
          }
          .button {
              height: 25px;
              margin-right: -8px;
              cursor: pointer;
              margin-bottom: -4px;
          }
        </style>
        <img src="${ICON_URL}" class="button"></img>
    `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent(`bubble-button-${this.type}`, { bubbles: true, composed: true }));
    });
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('bubble-button', BubbleButton);
