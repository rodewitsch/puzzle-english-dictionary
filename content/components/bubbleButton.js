class BubbleButton extends HTMLElement {

    constructor() {
        super();
    }

    render() {
        if (this.getAttribute('background-image')) {
            const ICON_URL = chrome.extension.getURL(`/assets/images/icons/${this.getAttribute('background-image')}.png`)
            this.style.backgroundImage = `url(${ICON_URL})`;
        }
        if (this.clickHandler) this.component.addEventListener('click', this.clickHandler);
        return this.component;
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("bubble-button", BubbleButton);