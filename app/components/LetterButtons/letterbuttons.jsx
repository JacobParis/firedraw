

export default class LetterButtons {
    constructor(socket) {
        this.socket = socket;

        this.display = <div class="letters display" />;

        this.letters = <div class="letters" />;
        this.letterElements = [];
        this.submitButton = <button class="letters-submit" >-></button>
        this.submitButton.addEventListener('click', () => this.sendMessage());
    }

    sendMessage() {
        const msg = this.message;
        if (!msg) return;

        this.socket.emit('message', {
            text: msg,
            user: this.socket.id
        });

        this.message = "";
        this.display.innerHTML = "";

        for(let element of this.letterElements) {
            element.classList.remove("disabled");
        }
    }

    loadLetters(letters) {
        this.message = "";
        this.letters.innerHTML = "";
        this.letterElements = [];

        const topRow = <div class="letters-row" />;
        const bottomRow = <div class="letters-row" />;
        for (let i in letters) {
            const letterElement = <span class={this.colour + "-dark letter-button"}>{letters[i]}</span>
            letterElement.addEventListener('click', () => { this.useLetter(letterElement); });

            if(i >= 7) {
                bottomRow.appendChild(letterElement);
            } else topRow.appendChild(letterElement);

            this.letterElements.push(letterElement);
        }

        this.letters.appendChild(topRow);
        this.letters.appendChild(bottomRow);

        console.log(this.letters);
    }


    useLetter(element) {
        if (element.classList.contains('disabled')) {
            return;
        }
        this.display.appendChild(element.cloneNode(true));

        element.classList.add("disabled");
        this.message = this.message + element.innerText;

        console.log('Message', this.message);
    }

    render() {
        return (
            <div>
                <div class={"guess"}>
                    {this.display}
                    {this.letters}
                    {this.submitButton}
                </div>
            </div>
        );
    }

}