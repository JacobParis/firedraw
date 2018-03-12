import Surface from '../components/surface.js';
import Chat from '../components/chat.js';

import API from '../utilities/apiservice.js';

const api = new API();

export default class RoomScene {
    load() { this.onReady() }
    
    onReady() {
        this.roomName = document.location.hash.toUpperCase().slice(1); //"MEOW"; //window.location.pathname.substring(1).toUpperCase();
        console.log("You have entered room " + this.roomName);
        this.socket = io.connect('http://localhost:8080/', { query: `room=${this.roomName}` });
        
        this.title = <h2>Welcome</h2>;
        this.socket.on('connect', () => {
            this.title.innerText = this.roomName;
            this.chat.nameInput.disabled = false;
            this.chat.messageInput.disabled = false;
            this.chat.messageInput.focus();
        });
        
        this.loginForm = {
            name: null,
            colour: null
        };
        
        this.nameInput = <input type="text" placeholder="Name" />;
        this.submitButton = <button id="modal-ok" class="red-dark wide disabled">JOIN</button>;
        this.submitButton.addEventListener('click', () => {
            if(!this.nameInput.value.length) return;

            this.socket.emit('nickChange', {nick: this.nameInput.value});
            this.login.classList.add('hide');
        });

        let selectedColourElement;
        const colours = ["red", "yellow", "green", "cyan", "blue", "magenta"];
        this.palette = <div class="palette" />;
        for(let colour of colours) {
            const selected = this.loginForm.colour === colour ? " selected" : "";
            const element = <button class={colour + selected} />;
            element.addEventListener('click', () => {
                if(selectedColourElement) {
                    selectedColourElement.classList.remove('selected');
                }
                element.classList.add('selected');
                selectedColourElement = element;
                this.nameInput.class = colour;
                this.submitButton.classList.remove("disabled");
                this.loginForm.colour = colour;
            });
            this.palette.appendChild(element);
        }


        this.login = (
            <panel class="modal">
                <div class="content">
                    <section>
                        <h2 class="text-center">Enter your name and choose a text colour</h2>
                        <p class="text-center">This will not affect your drawing colour</p>
                        <div>
                            {this.nameInput}
                        </div>
                        {this.palette}
                    </section>
                    <footer>
                        <span class="flex"></span>
                        {this.submitButton}
                    </footer>
                </div>
            </panel>
        );

        this.spinBoard = <div class="spin-board" />

        this.socket.on('message', msg => {
            console.log(msg);
            const index = msg.playerIndex;
            const players = msg.numberOfPlayers - 1;
            
            const message = <span class="pin"><span class="pin-text">{msg.text}</span></span>;
            setTimeout(() => message.classList.add('rise'), 1000);
            setTimeout(() => message.parentNode.removeChild(message), 3000);
            
            let angle;
            // If 1 player, use bottom
            if(players === 1) angle = Math.PI / 2;
            // Half a circle minus half a slice, double the size if it's an even number
            if(players > 1) angle =  (Math.PI - (Math.PI / players)) * index * (2 - (players % 2));
            if(players > 2) angle += Math.PI / 2;
            const x = Math.cos(angle) * 150;
            const y = Math.sin(angle) * 150;

            message.style.color = msg.color;
            message.style.transform = `translate(${x}px, ${y}px)`;
            this.spinBoard.appendChild(message);
        });

        this.surface = new Surface(this.socket);

        // The readyToDraw signal either starts a turn or -- if it's already your turn, ends it
        this.drawNow = <button class="red-dark wide primary fix-bottom">START DRAWING</button>;
        this.drawNow.addEventListener('click', () => {
            this.socket.emit('readyToDraw');
        });

        
        this.timeLeft = 120;
        clearInterval(this.drawingTimer);
        console.log("Timer Cleared");

        this.socket.on('youDraw', (word, colour, bgcolor) => {
            console.log("You Draw");
            this.setMyTurn();
            this.surface.canvas.style.backgroundColor = "#f5f5f5";
            this.surface.colorInk.style.backgroundColor = colour;
            this.surface.drawOptions.classList.remove('hide');
            this.surface.selectedColour = '#252525';
            this.surface.context.clearRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);

            this.title.innerText = this.roomName + ': ' + word[0];
            this.drawNow.innerText = 'PASS (' + this.timeLeft + ')';

            //modal.classList.remove('hide');
            //modalOk.innerText = 'START DRAWING';
            //modalHeader.innerText = 'It\'s your turn!';
            //modalText.innerText = 'Your word is ' + word[0] + '! and the timer is already counting!';
        });

        this.socket.on('friendDraw', (msg) => {
            console.log('frienddraw', msg);
            this.surface.canvas.style.backgroundColor = "#f5f5f5";
            this.surface.context.clearRect(0, 0, this.surface.canvas.clientWidth, this.surface.canvas.clientHeight);

            if (!this.isMyTurn) {
                console.log("Not you draw");
                this.title.innerText = this.roomName + ': ' + msg.nick + '\'s drawing';
                this.drawNow.classList.add("hide");
                this.chatElement.classList.remove("hide");
            }

            // turn on drawing timer
            this.drawingTimer = setInterval(() => this.timerTick(), 1000);
            // Modal or chat notify someone is drawing?
        });

        this.socket.on('youCanDraw', () => {
            console.log("I CAN DRAW");
            this.surface.canvas.style.backgroundColor = '#333';
            this.drawNow.classList.remove("hide");
            this.chatElement.classList.add("hide");
            //this.resetTimer();
        });

        this.socket.on('wordGuessed', (msg) => {
            this.surface.drawOptions.classList.add('hide');
            this.resetTimer();
           // modal.classList.remove('hide');
            //modalOk.innerText = 'OKAY';
            //modalHeader.innerText = 'Round over!)';
            //modalText.innerText = msg.nick + ' guessed the word (' + msg.text + ') !!!';
        });

        this.socket.on('wordNotGuessed', (msg) => {
            this.surface.drawOptions.classList.add('hide');
            this.resetTimer();
            //modal.classList.remove('hide');
            //modalOk.innerText = 'AWW OKAY';
            //modalHeader.innerText = 'Nobody Wins!';
            //modalText.innerText = 'The turn is over! The word was ' + msg.text + '.';
        });

        this.chat = new Chat(this.socket);
        this.chatElement = this.chat.render();
        this.chatElement.classList.add("fix-bottom");
        this.chatElement.classList.add("hide");

        this.onRender();
    }

    setMyTurn() {
        this.isMyTurn = true;
        this.surface.isMyTurn = true;
        this.surface.addListeners();
    }

    resetTimer() {
        this.timeLeft = 120;
        clearInterval(this.drawingTimer);
        console.log("Timer Cleared");
        this.drawingTimer = null;

        this.title.innerText = this.roomName;
        this.drawNow.innerText = 'START DRAWING';
        
        this.isMyTurn = false;
        this.surface.isMyTurn = false;
        this.surface.removeListeners();
    }

    timerTick() {
        if (this.timeLeft <= 0) return this.resetTimer();
        
        this.timeLeft -= 1;
        this.drawNow.innerText = `PASS (${this.timeLeft}')`;
    }

    render() {
        //console.log("RENDERING", this.data);

        

        return (
            <main>
                <header class="toolbar">
                    {this.title}
                </header>
                {this.login}
                <section class="top">
                    {this.spinBoard}
                    {this.surface.render()}
                </section>
                <section class="bottom">
                    {this.drawNow}
                    {this.chatElement}
                </section>
            </main>
        );
    }
    
    onRender() { console.log("Scene Improperly Loaded"); }
    postRender() { console.log("Render completed") }
}