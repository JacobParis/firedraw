export default class Card {
    constructor() {

        this.centerText = <p class="card-center-text" />;

        this.face = <div class="card-face"> {this.centerText} </div>;

        this.card = <div class="card hide"> {this.face} </div>;
        
        this.face.addEventListener('click', () => this.onClick());
    }

    setText(text) {
        //this.card.innerText = text;
        this.centerText.innerText = text;
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