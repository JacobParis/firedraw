
export default class Chat {
    constructor(socket) {
        this.socket = socket;

        this.messageInput = <input type="text" id="chatinput" disabled="disabled" maxlength="256" />;
        this.messageInput.addEventListener('keyup', e => {
            if(e.keyCode === 13) this.sendMessage();
        });

        this.submitButton = <button class="input-submit" >-></button>
        this.submitButton.addEventListener('click', () => this.sendMessage());
    }

    sendMessage() {
        const msg = this.messageInput.value;
        if(!msg) return;

        this.socket.emit('message', {
            text: msg,
            user: this.socket.id
        });

        this.messageInput.value = "";
    }

    render() {
        return (
            <div>
                <div class={"guess " + this.colour + "-dark"}>
                    {this.messageInput}
                    {this.submitButton}
                </div>
            </div>
        );
    }

}