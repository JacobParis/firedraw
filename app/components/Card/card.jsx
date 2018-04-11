export default class Card {
    constructor() {
        this.centerText = <p class="card-center-text" />;
        this.face = <div class="card-face" />;
        this.face.addEventListener('click', () => this.onClick());
        this.card = <div class="card"> {this.face} </div>;
    }
    
    becomeTextCard(text) {
        console.log("Become Text", text);
        if(text) this.setText(text);

        if(this.element) {
            this.face.removeChild(this.element);
            this.element = null;
        }
        this.face.appendChild(this.centerText);

        console.log(this.face);
    }

    setText(text) {
        //this.card.innerText = text;
        this.centerText.innerText = text;
    }

    becomeGameCard(element) {
        this.resetClick();
        this.element = element;
        if(this.centerText) {
            this.face.removeChild(this.centerText);
        }
        this.face.appendChild(this.element);
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