import Sunburst from '../components/sunburst.js';
import StatusButton from '../components/statusbutton.js';
import Card from '../components/card.js';
import UserList from '../components/userlist.js';
import LetterButtons from '../components/letterbuttons.js';

import CardDraw from '../components/carddraw.js';

import API from '../utilities/apiservice.js';
const api = new API();

import { getCookie, setCookie } from '../utilities/cookiemonster.js';

export default class RoomScene {
    constructor(router, params) {

        this.router = router;
        this.room = {
            name: sanitizeString(params.room, 4),
            round: {
                type: "PAUSE",
                color: "white"
            }
        }

        let nameCookie = getCookie('firedraw-name');
        const colorCookie = getCookie('firedraw-color');

        if (!this.room.name || !nameCookie || !colorCookie) {
            return this.ABORT = true;
        } else {
            console.log('Name', nameCookie);
            this.playerName = nameCookie;
            this.playerColor = colorCookie;
        }

    }

    load() { 
        let host = 'http://firedraw.ca/';
        if (document.baseURI.endsWith("?dev")) {
            host = 'http://localhost:8000/';
        }
        this.socket = io.connect(host, {
            query: `room=${this.room.name}&user=${this.playerName}&color=${this.playerColor}`,
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

        this.sunburst = new Sunburst("white");

        this.socket.on('message', msg => this.userList.displayMessageFromName(msg.name, msg.text));

        this.socket.on('end-turn', () => {
            this.room.round = { type: "PAUSE" };
            this.resetTimer();
        });

        this.card = new Card();

        this.statusButton = new StatusButton("WAIT YOUR TURN", this.playerColor);

        // FACTOR
        this.cardModules = {
            DRAW: new CardDraw(this.socket)
        };

        
        // The alpha signal is when my turn starts
        this.socket.on('alpha', (card) => {
            console.log('Play round as alpha', card);
            this.setColor(card.color);
            this.setRoundType(card.type);

            
            const cardModule = this.cardModules[card.type];
            cardModule.alphaMode();
            this.toolbar.innerHTML = "";
            this.toolbar.appendChild(cardModule.toolbar);

            this.cardContainer.classList.add("maximize");
            this.userList.list.classList.add("hide-small");

            const heading = <h2 class="card-header">{card.word}</h2>;
            this.card.resetClick();
            this.card.setElements([
                heading,
                cardModule.container
            ]);

            this.startTimer();
        });
        
        /**
         * A function called when anyone's turn starts
         * --> name: name of person drawing
         */
        this.socket.on('beta', (card) => {
            console.log('Play round as beta', card);
            this.setColor(card.color);
            this.setRoundType(card.type);

            const cardModule = this.cardModules[card.type];
            cardModule.betaMode(card.letters);
            this.toolbar.innerHTML = "";
            this.toolbar.appendChild(cardModule.toolbar);

            this.statusButton.hide();
            this.card.resetClick();
            this.card.setElements(cardModule.container);
        });
        
        this.cardContainer = this.card.card;

        this.gameSection = (
            <section class="section-game">
                {this.userList.render()}
                {this.cardContainer}
            </section>
        );

        const gameColor = this.room.round.color;

        this.toolbar = <span />;
        this.page = (
            <main class={gameColor}>
                {this.sunburst.render()}
                {this.gameSection}
                <section class="bottom">
                    {this.statusButton.render()}
                    {this.toolbar}
                </section>
            </main>
        );
        this.resetTimer();
        this.onRender();
    }
  
    setMyTurn() {
        console.log("Set my turn");
        //this.isMyTurn = true;

        // FACTOR
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
        this.cardModules["DRAW"].drawToolbar.hide();
        this.cardModules["DRAW"].letterToolbar.hide();
        
        // Show the card that starts the round
        console.log("delta");
        this.card.setElements(<p class="card-center-text">CARD</p>);
        this.card.onClick = () => {
            this.socket.emit('request-card');
            this.card.resetClick();
        }
    }
    
    setRoundType(type) {
        // TODO verify this client supports the type
        this.room.round.type = type;
    }

    resetTimer() {
        console.log("Reset Timer");
        this.timeLeft = 120;
        clearInterval(this.drawingTimer);
        this.drawingTimer = null;

        // Minimize the cards
        // TODO consolidate to a single element
        this.cardModules["DRAW"].minimize();
        this.cardContainer.classList.remove("maximize");
        this.userList.list.classList.remove("hide-small");

        this.statusButton.setText("WAIT YOUR TURN");
        this.statusButton.show();
        
        this.cardModules["DRAW"].surface.lock();
        this.cardModules["DRAW"].surface.onDraw = () => console.log("Surface not emitting");
        
        this.cardModules["DRAW"].drawToolbar.hide();
        this.cardModules["DRAW"].letterToolbar.hide();
        
    }

    startTimer() {
        clearInterval(this.drawingTimer);
        this.drawingTimer = setInterval(() => this.timerTick(), 1000);
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

    setColor(color) {
        this.sunburst.setColor(color);
        this.page.className = color;
    }

    render() {
        return this.page;
    }
    
    onRender() { console.log("Scene Improperly Loaded"); }
    postRender() { console.log("Render completed") }
}

function sanitizeString(string, maxLength) {
    return string.replace(/[^a-z ]/gim, "").trim().substring(0, maxLength);
}