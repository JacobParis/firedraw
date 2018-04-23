export default class DrawToolbar {
    constructor(optionSelected) {
        this.onOptionSelected = optionSelected;

        const blackInk = <span class="ink black" />;
        blackInk.addEventListener('click', () => {
            this.onOptionSelected('#252525');
        });

        this.palette = <panel>{blackInk}</panel>;

        this.paletteElements = [];
        for (const colorName of ["red", "yellow", "green", "cyan", "blue", "magenta"]) {
            const colorInk = <span class={colorName + " ink"} />
            colorInk.addEventListener('click', () => {
                this.onOptionSelected(document.defaultView.getComputedStyle(colorInk, null).getPropertyValue('background-color'));
                this.hideRestOfPalette(colorInk);
            });
            this.paletteElements.push(colorInk);
            this.palette.appendChild(colorInk);
        }

        this.container = (
            <div class="game-toolbar hide">
                {this.palette}
            </div>
        );
    }

    hideRestOfPalette(colorInk) {
        for (const paletteElement of this.paletteElements) {
            if (paletteElement == colorInk) continue;

            paletteElement.classList.add("hide");
        }
    }

    showFullPalette() {
        for (const paletteElement of this.paletteElements) {
            paletteElement.classList.remove("hide");
        }
    }

    hide() {
        this.container.classList.add('hide');
    }

    show() {
        this.container.classList.remove('hide');
    }
    render() {
        return this.container;
    }

    onOptionSelected() { console.log( "No Option Selected Callback Set"); }
}