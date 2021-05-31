class BaseWord extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host {
              color: #777;
              font-size: 18px;
              font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
            }
            p {
              margin: 0;
            }
            .other-meanings {
              margin: 0;
              color: #45a7dd;
              text-decoration: underline;
              text-decoration-style: dashed;
              font-size: 13px;
              cursor: pointer;
            }
          </style>
          <p>
            <span>to</span> <b>frustrate</b> - <span>срывать</span>
          </p>
          <p class="other-meanings">
            Другие значения
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

customElements.define('base-word', BaseWord);
