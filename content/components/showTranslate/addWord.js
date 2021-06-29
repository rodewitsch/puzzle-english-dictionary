class AddWord extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
          <style>
            :host{
              font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
              display: block;
              margin-top: 5px;
            }
            .button {
              cursor: pointer;
              padding: 0 20px;
              width: 100px;
              height: 40px;
              border-radius: 3px;
              color: white;
              display: flex;
              justify-content: space-around;
              align-items: center;
              font-size: 15px;
            }
            .button .plus {
              font-size: 30px;
            }
            .success{
              background-color: #85d360;
            }
          </style>
          <div class="button success">
            <span class="plus">+</span>
            <span>в словарь</span>
          </div>
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

customElements.define('add-word', AddWord);
