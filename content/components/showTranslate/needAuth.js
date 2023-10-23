class NeedAuth extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.render = () => {
      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = `
              <style>
                :host{
                  font-family: "Open Sans",Arial,"Lucida Grande",sans-serif;
                  display: block;
                  margin-top: 20px;
                  text-align: center;
                }
                ::selection {
                  background-color: #FF5E6B;
                  color: white;
                }
              </style>
              <div>Для добавления слов в словарь необходимо 
              <a href="https://puzzle-english.com/" target="blank">авторизоваться</a></div>
          `;
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      return true;
    }
  }

  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
};

customElements.define('need-auth', NeedAuth);
