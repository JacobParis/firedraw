import Surface from '../components/surface.js';
import LetterButtons from '../components/letterbuttons.js';
import DrawToolbar from '../components/drawtoolbar.js';

export default class CardDraw {

    constructor(socket) {
        this.socket = socket;

        this.surface = new Surface();
        this.container = this.surface.render();
        
        this.letterToolbar = new LetterButtons(this.socket);
        //this.letterToolbar.hide();
        //this.letterToolbar.color = this.playerColor;

        this.drawToolbar = new DrawToolbar(selectedColor => {
            this.surface.selectedColor = selectedColor;
        });
        //this.drawToolbar.hide();

        this.socket.on('DRAW-draw', (line, clearBuffer) => {
            this.surface.draw(line, clearBuffer)
        });
        
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
        this.surface.onDraw = (point, clearBuffer) => this.socket.emit('DRAW-draw', point, clearBuffer);

        this.surface.selectedColor = '#252525';
        this.surface.context.clearRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);

        this.toolbar = this.drawToolbar.container;
        this.drawToolbar.show();
        this.drawToolbar.showFullPalette();

    }

    betaMode(letters) {
        this.surface.context.clearRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);
        this.toolbar = this.letterToolbar.container;
        this.letterToolbar.loadLetters(letters);
        this.letterToolbar.show();
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
}