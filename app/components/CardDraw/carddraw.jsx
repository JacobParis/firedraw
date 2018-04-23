import Surface from '../components/surface.js';
import LetterButtons from '../components/letterbuttons.js';
import DrawToolbar from '../components/drawtoolbar.js';

export default class CardDraw {

    constructor(config) {
        this.socket = config.socket;

        this.surface = new Surface();
        this.container = this.surface.render();
        
        this.letterToolbar = new LetterButtons(this.socket);

        this.drawToolbar = new DrawToolbar(selectedColor => {
            this.surface.selectedColor = selectedColor;
        });

        this.socket.on('DRAW-draw', (array) => {
            console.log('remote draw');
            this.surface.draw(array[0], array[1])
        });
        
        if(config.color) this.setColor(config.color);
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
        this.surface.onDraw = (point, clearBuffer) => { console.log(this.socket); this.socket.emit('DRAW-draw', point, clearBuffer)};

        this.surface.selectedColor = '#252525';
        this.surface.context.clearRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);

        this.toolbar = this.drawToolbar.container;
        this.drawToolbar.show();
        this.drawToolbar.showFullPalette();

        console.log(this);
    }

    betaMode(letters) {
        this.surface.context.clearRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);
        this.surface.lock();
        this.toolbar = this.letterToolbar.container;
        this.letterToolbar.loadLetters(letters);
        this.letterToolbar.show();
        console.log(this);
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
        this.letterToolbar.hide();
    }

    setColor(color) {
        this.letterToolbar.color = color;
    }
}