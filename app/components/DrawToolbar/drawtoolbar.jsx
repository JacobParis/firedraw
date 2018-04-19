export default class DrawToolbar {
    constructor(optionSelected) {
        this.onOptionSelected = optionSelected;

        const blackInk = <span class="ink black" />;
        blackInk.addEventListener('click', () => {
            this.onOptionSelected('#252525');
        });

        this.palette = <panel>{blackInk}</panel>;

        this.paletteElements = [];
        for (let colorName of ["red", "yellow", "green", "cyan", "blue", "magenta"]) {
            const colorInk = <span class={colorName + " ink"} />
            colorInk.addEventListener('click', () => {
                this.onOptionSelected(document.defaultView.getComputedStyle(colorInk, null).getPropertyValue('background-color'));
                this.hideRestOfPalette(colorInk);
            });
            this.paletteElements.push(colorInk);
            this.palette.appendChild(colorInk);
        }

        this.toolbar = (
            <div class="game-toolbar hide">
                {this.palette}
            </div>
        );
    }

    hideRestOfPalette(colorInk) {
        for (let paletteElement of this.paletteElements) {
            if (paletteElement == colorInk) continue;

            paletteElement.classList.add("hide");
        }
    }

    showFullPalette() {
        for (let paletteElement of this.paletteElements) {
            paletteElement.classList.remove("hide");
        }
    }

    hide() {
        this.toolbar.classList.add('hide');
    }

    show() {
        this.toolbar.classList.remove('hide');
    }
    render() {
        return this.toolbar;
    }

    onOptionSelected() { console.log( "No Option Selected Callback Set"); }
}