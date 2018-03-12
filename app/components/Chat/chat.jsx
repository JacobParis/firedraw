
export default class Chat {
    constructor(socket) {
        this.socket = socket;

        this.name = 'guest';
        this.nameInput = <input type="text" id="chatnick" disabled="disabled" value="guest" maxlength="32" />;
        this.nameInput.addEventListener('keyup', e => {
            if (e.keyCode === 13) this.nameChange();
        });

        this.messageInput = <input type="text" id="chatinput" disabled="disabled" maxlength="256" />;
        this.messageInput.addEventListener('keyup', e => {
            if(e.keyCode === 13) this.sendMessage();
        });

        this.messageBox = <div id="chatcontent" />;
    }

    sendMessage() {
        const msg = this.messageInput.value;
        if(!msg) return;

        if (msg === 'cls' | msg === 'clear') {
            this.messageBox.innerHTML = "";
            this.messageInput.value = "";
            return;
        }

        if (this.name != this.nameInput.value) {
            this.nameChange();
        }

        this.socket.emit('message', {
            text: msg,
            user: this.socket.id
        });
        this.messageInput.value = "";
    }

    nameChange() {
        const msg = this.nameInput.value;
        if (!msg || msg == this.name) return;

        this.socket.emit('nickChange', { nick: msg });
        this.name = msg;
    }

    render() {
        return (
            <div>
                {this.posterBoard}
                <div class="guess">
                    {this.messageInput}
                </div>
            </div>
        );
    }

}