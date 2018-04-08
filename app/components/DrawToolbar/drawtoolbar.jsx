export default class DrawToolbar {
    constructor(optionSelected) {
        this.onOptionSelected = optionSelected;

        const blackInk = <span class="ink black" />;
        blackInk.addEventListener('click', () => {
            this.onOptionSelected('#252525');
        });

        this.palette = <panel>{blackInk}</panel>;

        this.paletteElements = [];
        for (let colourName of ["red", "yellow", "green", "cyan", "blue", "magenta"]) {
            const colourInk = <span class={colourName + " ink"} />
            colourInk.addEventListener('click', () => {
                this.onOptionSelected(document.defaultView.getComputedStyle(colourInk, null).getPropertyValue('background-color'));
                this.hideRestOfPalette(colourInk);
            });
            this.paletteElements.push(colourInk);
            this.palette.appendChild(colourInk);
        }

        this.toolbar = (
            <div class="game-toolbar hide">
                {this.palette}
            </div>
        );
    }

    hideRestOfPalette(colourInk) {
        for (let paletteElement of this.paletteElements) {
            if (paletteElement == colourInk) continue;

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