class TranslatePanel extends HTMLElement {
  constructor() {
    super();
    // eslint-disable-next-line no-undef
    this.store = StoreInstance;
    this.attachShadow({ mode: 'open' });
    this.addEventListener('click', () => {
      if (!this.subscribeTestSubscription) {
        this.subscribeTestSubscription = this.store.subscribe('subscribeTest', (data) =>
          console.log('TranslatePanel', 'subscription', data)
        );
      }
      this.store.subscribeTest = 2;
      // this.dispatchEvent(new CustomEvent(this.getAttribute('cast-event'), { bubbles: true, composed: true }));
    });
  }

  render() {
    const TEMPLATE = document.createElement('template');
    TEMPLATE.innerHTML = `
        <style>
            :host {
              display: block;
              width: 280px;
              padding: 0px 15px;
            }
            .base-word-row {
              display: flex;
              justify-content: space-between;
            }
        </style>
        <current-meaning></current-meaning>
        <div class="base-word-row">
          <base-word></base-word>
          <pronunciation-button></pronunciation-button>
        </div>
        <pronunciation-slider></pronunciation-slider>
        <add-word></add-word>
        <dictionary-info></dictionary-info>
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

customElements.define('translate-panel', TranslatePanel);
