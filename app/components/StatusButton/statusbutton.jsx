export default class StatusButton {
    constructor(text, color) {
        this.color = color;
        this.button = <button class={`${color}-text wide primary fix-bottom`} />;
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
        this.button.classList.remove(`${this.color}-text`);
        this.button.classList.add(`${this.color}`);
    }
    
    debold() {
        this.button.classList.add(`${this.color}-text`);
        this.button.classList.remove(`${this.color}`);
    }
    
    render () {
        return this.button;
    }

    onClick() { console.log("No Click Handler Set"); }
}