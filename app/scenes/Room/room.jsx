import Surface from '../components/surface.js';
import DrawToolbar from '../components/drawtoolbar.js';
import StatusButton from '../components/statusbutton.js';
import Card from '../components/card.js';
import UserList from '../components/userlist.js';
import LetterButtons from '../components/letterbuttons.js';

import API from '../utilities/apiservice.js';
const api = new API();

import { getCookie, setCookie } from '../utilities/cookiemonster.js';

export default class RoomScene {
    constructor(router, params) {

        this.router = router;
        this.room = {
            name: sanitizeString(params.room, 4),
            round: {
                type: "PAUSE"
            }
        }

        let nameCookie = getCookie('firedraw-name');
        const colourCookie = getCookie('firedraw-colour');

        if (!this.room.name || !nameCookie || !colourCookie) {
            return this.ABORT = true;
        } else {
            console.log('Name', nameCookie);
            this.playerName = nameCookie;
            this.playerColour = colourCookie;
        }

    }

    load() { 
        let host = 'http://firedraw.ca/';
        if (document.baseURI.endsWith("?dev")) {
            host = 'http://localhost:8000/';
        }
        this.socket = io.connect(host, {
            query: `room=${this.room.name}&user=${this.playerName}&colour=${this.playerColour}`,
            path: '/io'
        });
        
        this.socket.on('connect', () => this.onReady());

        this.userList = new UserList();

        this.socket.on('queue-updated', playerQueue => {
            console.log('on: queue-updated', playerQueue);
            this.userList.setUsers(playerQueue);
        });

        this.socket.on('change-player', currentPlayer => {
            console.log('on: change-player', currentPlayer);
            // This way we can only change the current player between rounds
            if (this.room.round.type === "PAUSE") {
                this.room.currentPlayer = currentPlayer;
                this.userList.setCurrentPlayer(currentPlayer);

                this.resetTimer();
                if (currentPlayer === this.playerName) {
                    this.setMyTurn();
                }
            } else {
                console.log("can't change while round in progress");
            }
        })
        
    }
    
    onReady() {
        console.log("You have entered room " + this.room.name);
        
        this.title = <h2>{this.room.name}</h2>;
        this.title.addEventListener('click', () => console.log(this.room));

        this.socket.on('message', msg => {
            console.log(msg);
            this.userList.displayMessageFromName(msg.name, msg.text);
        });

        this.socket.on('end-turn', () => {
            console.log("on: end-turn");
            this.room.round = { type: "PAUSE" };

            this.resetTimer();
        });

        this.card = new Card();

        this.statusButton = new StatusButton("WAIT YOUR TURN", this.playerColour);

        this.surface = new Surface();
        this.socket.on('DRAW-draw', (line, clearBuffer) => this.surface.draw(line, clearBuffer));
        this.socket.on('startDrawing', (word) => this.beginDrawing(word));
        
        /**
         * msg
         * --> name: name of person drawing
         */
        this.socket.on('DRAW-someoneIsDrawing', (msg) => {
            this.room.round.type = "DRAW";

            console.log('Someone Is Drawing', msg);
            this.surface.canvas.classList.add("raised");
            this.surface.context.clearRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);
            
            if(this.room.currentPlayer !== this.playerName) {
                console.log("Not you draw");
                this.title.innerText = this.room.name + ': ' + msg.name + '\'s drawing';
                this.statusButton.hide();
                this.card.setGameCard(this.surfaceContainer);
                this.chatElement.classList.remove("hide");
                this.chat.loadLetters(msg.letters);
            } else {
                this.drawingTimer = setInterval(() => this.timerTick(), 1000);
            }
            
            // turn on drawing timer
            // Modal or chat notify someone is drawing?
        });
        
        this.socket.on('DRAW-wordGuessed', (msg) => {
            console.log("CORRECT", msg);
        });
        
        this.socket.on('DRAW-wordNotGuessed', (msg) => {
            console.log("LOSE", msg);
        });
        
        this.toolbar = new DrawToolbar(selectedColour => {
            this.surface.selectedColour = selectedColour;
        });
        
        this.chat = new LetterButtons(this.socket);
        this.chat.colour = this.playerColour;
        //this.chat.messageInput.disabled = false;
        //this.chat.messageInput.focus();
        this.chatElement = this.chat.render();
        this.chatElement.classList.add("fix-bottom");
        this.chatElement.classList.add("hide");
        
        this.cardContainer = this.card.card;
        this.surfaceContainer = this.surface.render();

        this.gameSection = (
            <section class="section-game">
                {this.userList.render()}
                {this.cardContainer}
            </section>
        );

        this.resetTimer();
        this.onRender();
    }
    
    setMyTurn() {
        console.log("Set my turn");
        //this.isMyTurn = true;


        clearInterval(this.drawingTimer);
        this.drawingTimer = null;


        this.statusButton.show();
        this.statusButton.setText("SKIP TURN");
        this.statusButton.onClick = () => {
            this.socket.emit('end-turn', {reason: "SKIP"});
            this.resetTimer();
            //this.card.hide();
            //this.card.resetClick();
            //this.statusButton.onClick = () => console.log("No click handler set");
        };
      
        // Hide the game toolbar
        this.toolbar.hide();
        this.chatElement.classList.add("hide");
        
        // Show the card that starts the round
        this.card.becomeTextCard('START DRAWING');
        this.card.onClick = () => {
            this.socket.emit('DRAW-ready');
            this.card.becomeGameCard(this.surfaceContainer);
        }
    }
    
    beginDrawing(word) {
        // Change turn button to skip turn
        this.statusButton.bold();
        
        // Maximize the cards
        // TODO consolidate to a single element
        this.surfaceContainer.classList.add("maximise");
        this.cardContainer.classList.add("maximise");
        this.userList.list.classList.add("hide-small");

        this.surface.unlock();
        this.surface.onDraw = (point, clearBuffer) => this.socket.emit('DRAW-draw', point, clearBuffer);
        
        this.surface.selectedColour = '#252525';
        this.surface.context.clearRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);
        
        this.title.innerText = this.room.name + ': ' + word;
        //this.drawNow.innerText = 'GIVE UP DRAWING (' + this.timeLeft + ')';
        
        this.toolbar.show();
        this.toolbar.showFullPalette();
    }

    resetTimer() {
        console.log("Reset Timer");
        this.timeLeft = 120;
        clearInterval(this.drawingTimer);
        this.drawingTimer = null;

        // Minimize the cards
        // TODO consolidate to a single element
        this.surfaceContainer.classList.remove("maximise");
        this.cardContainer.classList.remove("maximise");
        this.userList.list.classList.remove("hide-small");


        this.title.innerText = this.room.name;
        this.statusButton.setText("WAIT YOUR TURN");
        this.statusButton.show();
        
        this.toolbar.hide();
        //this.isMyTurn = false;

        // DRAW
        //this.surface.isMyTurn = false;
        this.surface.lock();
        this.surface.onDraw = () => console.log("Surface not emitting");
        this.surface.canvas.classList.remove('raised');
        this.chatElement.classList.add("hide");
        
    }

    timerTick() {
        //if(this.isMyTurn) {
        if (this.timeLeft <= 0) {
            this.socket.emit('end-turn', {reason: "TIME"});
            return this.resetTimer();
        }
        this.timeLeft -= 1;
        this.statusButton.setText(`END TURN (${this.timeLeft})`);
        //}
    }

    render() {
        //console.log("RENDERING", this.data);
        return (
            <main class={this.playerColour}>
                <div class={this.playerColour + "-dark-text sunburst"}>
                    <b /><b /><b /><b /><b /><b /><b /><b /><b />
                </div>
                <header class="toolbar">
                    {this.title}
                </header>
                {this.gameSection}
                <section class="bottom">
                    {this.toolbar.render()}
                    {this.statusButton.render()}
                    {this.chatElement}
                </section>
            </main>
        );
    }
    
    onRender() { console.log("Scene Improperly Loaded"); }
    postRender() { console.log("Render completed") }
}

function sanitizeString(string, maxLength) {
    return string.replace(/[^a-z ]/gim, "").trim().substring(0, maxLength);
}