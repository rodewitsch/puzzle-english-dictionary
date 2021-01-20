class PuzzleEnglishBubbleButtons extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        this.classList.add('puzzle-english-dictionary-host', 'ped-bubble')
        this.setAttribute('style', `position: absolute; left: ${this.attributes.positionX}px; top: ${this.attributes.positionY}px; z-index: 2147483647;`)
        const shadow = this.attachShadow({ mode: 'open' });

        this.innerHTML = `
            <style>
                .ped-bubble-button {
                    cursor: pointer;
                    padding: 0 20px;
                    width: 110px;
                    height: 40px;
                    border-radius: 3px;
                    color: white;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    font-size: 15px;
                }
            </style>
            <bubble-button class="ped-bubble-button" background-image="add"></bubble-button>
        `;
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return [/* массив имён атрибутов для отслеживания их изменений */];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // вызывается при изменении одного из перечисленных выше атрибутов
    }
}

customElements.define("puzzle-english-bubble-buttons", PuzzleEnglishBubbleButtons);