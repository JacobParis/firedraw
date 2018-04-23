import Surface from '../components/surface.js';
import DrawToolbar from '../components/drawtoolbar.js';

export default class CardDrawful {

    constructor(config) {
        this.socket = config.socket;

        this.surface = new Surface();
        this.container = this.surface.render();

        this.drawToolbar = new DrawToolbar(selectedColor => {
            this.surface.selectedColor = selectedColor;
        });
   
        //if(config.color) this.setColor(config.color);
    }

    /**
     * Different modes for different situations
     * Alpha Mode when it is your turn
     * Beta Mode when it is someone else's turn
     * Gamma Mode when you are a spectator
     */
    alphaMode() {
        this.maximize();

        this.surface.unlock();

        this.surface.selectedColor = '#252525';
        this.surface.context.clearRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);

        this.toolbar = this.drawToolbar.container;
        this.drawToolbar.show();
        this.drawToolbar.showFullPalette();
    }

    betaMode() {
        this.alphaMode();
    }

    /**
     * Puts the container into focus. This will take up the full screen in 
     * a portrait mobile application
     */
    maximize() {
        this.container.classList.add("maximize");
    }

    minimize() {
        this.container.classList.remove("maximize");
    }

    disable() {
        this.minimize();
        this.surface.lock();
        this.surface.onDraw = () => console.log("Surface not emitting");

        this.drawToolbar.hide();
    }
}