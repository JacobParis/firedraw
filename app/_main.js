import './layouts.scss';
import './styles.scss';
import './main.scss';

import Navigo from './utilities/navigo.js';

import RoomScene from './scenes/room.js';

let router;

document.addEventListener('DOMContentLoaded', initRouter);

function initRouter() {
    if (router) {
        document.removeEventListener('DOMContentLoaded', initRouter);
        return;
    }

    const root = document.location.href;
    console.log(root);
    const useHash = true; // Defaults to: false
    const hash = '#!'; // Defaults to: '#'
    router = new Navigo(root, useHash, hash);
    router.on({
        /*'foo/:id': params => {
            loadScene(new FooScene(), params)
        },*/
        '*': () => {
            loadScene(new RoomScene())
        }
    }).resolve();
}

// We use the load and render methods instead of the constructor
// Because this way we can hijack the render to execute after the load
function loadScene(scene, params) {
    scene.onRender = () => {
        const entry = document.getElementById("yield");
        entry.innerHTML = "";
        entry.appendChild(scene.render());
        scene.postRender();
    };
    scene.load(params);
}





