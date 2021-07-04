class InitialButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.type = this.getAttribute('type');
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
        <style>
          :host{
            padding: 1px;
          }
          img {
              height: 25px;
              margin-right: -8px;
              cursor: pointer;
              margin-bottom: -4px;
          }
        </style>
        <img src="${chrome.extension.getURL(`/assets/images/icons/${this.type}.png`)}"></img>
    `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent(`initial-button-${this.type}`, { bubbles: true, composed: true }))
    );
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('initial-button', InitialButton);
