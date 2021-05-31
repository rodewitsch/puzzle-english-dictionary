class CurrentMeaning extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host {
              font-size: 13px;
              font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
              color: #777;
            }
          </style>
          <p>
            <b>frustrated</b> <span>past simple</span>
          </p>
      `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent(this.getAttribute('cast-event'), { bubbles: true, composed: true }));
    });
    
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define('current-meaning', CurrentMeaning);
