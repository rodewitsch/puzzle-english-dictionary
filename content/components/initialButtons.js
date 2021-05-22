class InitialButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  render() {
    const TEMPLATE = document.createElement("template");
    TEMPLATE.innerHTML = `
        <style>
            
        </style>
        <button></button>
        <button></button>
        <button></button>
        `;
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define("initial-buttons", InitialButtons);
