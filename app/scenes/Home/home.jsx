import API from '../utilities/apiservice.js';
const api = new API();

import {getCookie, setCookie} from '../utilities/cookiemonster.js';

export default class HomeScene {
    constructor(router) { this.router = router; }
    load() { this.onReady() }
    
    onReady() {
        
        this.roomInput = <input type="text" placeholder="ROOM" maxlength="4"/>;
        const roomCookie = getCookie('firedraw-room');
        if (roomCookie) this.roomInput.value = roomCookie;
        
        this.nameInput = <input type="text" placeholder="Name" maxlength="12"/>;
        const nameCookie = getCookie('firedraw-name');
        if (nameCookie) this.nameInput.value = nameCookie;

        const colorCookie = getCookie('firedraw-color');
        if (colorCookie) this.color = colorCookie;
        
        this.submitButton = <button class="primary wide disabled">JOIN</button>;
        this.submitButton.addEventListener('click', () => {
            if(!this.nameInput.value.length) return;

            const room = this.roomInput.value.toUpperCase();
            setCookie('firedraw-room', room, 1);

            const name = this.nameInput.value.toUpperCase();
            setCookie('firedraw-name', name, 1);

            const color = this.color;
            setCookie('firedraw-color', color, 1);

            this.router.navigate(`/room/${room}`);
        });

        let selectedColorElement;
        const colors = ["red", "yellow", "green", "cyan", "blue", "magenta"];
        this.palette = <div class="palette" />;
        for(let color of colors) {
            const isSelected = this.color === color;
            
            // Preselect if we've selected it already
            const element = <button class={color} />;
            if(isSelected) {
                selectedColorElement = element;
                element.classList.add('selected');
                this.nameInput.className = `${color}-text`;
                this.submitButton.classList.add(`${color}-dark`);
                this.submitButton.classList.remove("disabled");
            }

            element.addEventListener('click', () => {
                if(selectedColorElement) {
                    // Skip if already selected
                    if(selectedColorElement === element) return;

                    // Deselect existing element and select this one
                    selectedColorElement.classList.remove('selected');
                    this.submitButton.classList.remove(selectedColorElement.className + "-dark");
                }
                selectedColorElement = element;
                element.classList.add('selected');
                this.nameInput.className = `${color}-text`;
                this.submitButton.classList.add(`${color}-dark`);
                this.color = color;

                this.submitButton.classList.remove("disabled");

            });
            this.palette.appendChild(element);
        }

        this.onRender();
    }

    render() {

        return (
            <main>
                <header class="home-header">
                    <h1 class="text-center">FireDraw</h1>
                </header>
                <div class="content">
                    <section>
                        <label>
                            <h2 class="text-center">Enter the 4 Letter Room Code</h2>
                            {this.roomInput}
                        </label>
                    </section>
                    <section>
                        <label>
                            <h2 class="text-center">Enter your name and choose a text color</h2>
                            {this.nameInput}
                        </label>
                        {this.palette}
                    </section>
                    <footer>
                        <span class="flex"></span>
                        {this.submitButton}
                    </footer>
                </div>
            </main>
        );
    }
    
    onRender() { console.log("Scene Improperly Loaded"); }
    postRender() { console.log("Render completed") }
}