export default class Card {
    constructor() {
        this.face = <div class="card-face" />;
        this.face.addEventListener('click', () => this.onClick());
        this.container = <div class="card"> {this.face} </div>;
    }

    setElements(elements) {
        console.log("SET ELEMENTS");
        this.resetClick();

        this.face.innerHTML = "";

        if(!elements) return;
        if(!elements.length) elements = [elements];

        for(const element of elements) this.addElement(element);
    }

    addElement(element) {
        if(!element) return;

        this.face.appendChild(element);
    }

    show() {
        this.container.classList.remove('hide');
    }

    hide() {
        this.container.classList.add('hide');
    }
    render() {
        return this.container;
    }

    resetClick() {
        this.onClick = () => {
            console.log("No click handler set");
        }
    }
    onClick() { console.log("No click handler set"); }
}