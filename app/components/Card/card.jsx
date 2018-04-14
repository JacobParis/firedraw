export default class Card {
    constructor() {
        this.face = <div class="card-face" />;
        this.face.addEventListener('click', () => this.onClick());
        this.card = <div class="card"> {this.face} </div>;
    }

    setElements(elements) {
        console.log("SET ELEMENTS");
        this.resetClick();

        this.face.innerHTML = "";

        if(!elements) return;
        if(!elements.length) elements = [elements];

        for(let element of elements) {
            this.face.appendChild(element);
        }
    }

    show() {
        this.card.classList.remove('hide');
    }

    hide() {
        this.card.classList.add('hide');
    }
    render() {
        return this.card;
    }

    resetClick() {
        this.onClick = () => {
            console.log("No click handler set");
        }
    }
    onClick() { console.log("No click handler set"); }
}