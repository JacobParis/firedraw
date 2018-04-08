export default class StatusButton {
    constructor(text, colour) {
        this.colour = colour;
        this.button = <button class={`${colour}-text wide primary fix-bottom`} />;
        this.button.addEventListener('click', () => this.onClick());

        if(text) this.setText(text);
    }

    setText(text) {
        this.button.innerText = text;
    }


    hide() {
        this.button.classList.add("hide");
    }

    show() {
        this.button.classList.remove("hide");
    }

    bold() {
        this.button.classList.remove(`${this.colour}-text`);
        this.button.classList.add(`${this.colour}-dark`);
    }
    
    debold() {
        this.button.classList.add(`${this.colour}-text`);
        this.button.classList.remove(`${this.colour}-dark`);
    }
    
    render () {
        return this.button;
    }

    onClick() { console.log("No Click Handler Set"); }
}