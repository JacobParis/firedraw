export default class Surface {
    constructor() {

        this.canvas = <canvas id="canvas" width="300" height="480"></canvas>
        // Disable text selection on the canvas
        this.canvas.addEventListener('mousedown', (() => false));

        /*
        this.socket.on('DRAW-drawCanvas', (canvasToDraw) => {
            console.log(canvasToDraw);
            if (canvasToDraw) {
                //drawLayer.width(drawLayer.clientWidth);
                this.context.lineJoin = 'round';

                for(const line of canvasToDraw) {
                    if (line.stop) { continue; }
                    this.context.strokeStyle = line.color;
                    this.context.lineWidth = 10;

                    this.context.beginPath();
                    if (line.from) this.context.moveTo(line.from.x, line.from.y);
                    else this.context.moveTo(line.to.x - 1, line.to.y);
                    
                    this.context.lineTo(line.to.x, line.to.y);
                    this.context.closePath();
                    this.context.stroke();
                }
            }
        });
        */

        this.context = this.canvas.getContext("2d");
        this.context.beginPath();
        this.context.lineTo(300, 300);
        this.context.stroke();

        /** OPTIONS */
        /** Stores the selected color as a string */
        this.selectedColor = '#ff0000';
        // An array of points to drip ink
        this.points = [];
        // Stores an interval timer from the last time we moved the cursor
        this.stoppedMoving;

        this.blackInk = <span class="ink black" />
        this.blackInk.addEventListener('click', () => {
            console.log("black");
            this.selectedColor = '#252525';
        });

        const palette = <panel>{this.blackInk}</panel>;

        this.paletteElements = [];
        for(const colorName of ["red", "yellow", "green", "cyan", "blue", "magenta"]) {
            const colorInk = <span class={colorName + " ink"} />
            colorInk.addEventListener('click', () => {
                this.selectedColor = document.defaultView.getComputedStyle(colorInk, null).getPropertyValue('background-color');

                this.hideRestOfPalette(colorInk);
            });
            palette.appendChild(colorInk);
            this.paletteElements.push(colorInk);
        }

        this.drawOptions = (
            <footer class="options">
                {palette}
            </footer>
        );

        this.drawHandler = this.drawInk.bind(this);
        this.moveHandler = this.moveInk.bind(this);
        this.stopHandler = this.stopInk.bind(this);
    }

    
    unlock() {
        this.canvas.addEventListener('mousedown', this.drawHandler, true);
        this.canvas.addEventListener('touchstart', this.drawHandler, true);
        
        this.canvas.addEventListener('mousemove', this.moveHandler, true);
        this.canvas.addEventListener('touchmove', this.moveHandler, true);
        
        this.canvas.addEventListener('mouseout', this.stopHandler, true);
        this.canvas.addEventListener('mouseup', this.stopHandler, true);
        this.canvas.addEventListener('touchend', this.stopHandler, true);
        this.canvas.addEventListener('touchcancel', this.stopHandler, true);
    }

    lock() {
        console.log("Remove Listeners");

        this.canvas.removeEventListener('mousedown', this.drawHandler, true);
        this.canvas.removeEventListener('touchstart', this.drawHandler, true);

        this.canvas.removeEventListener('mousemove', this.moveHandler, true);
        this.canvas.removeEventListener('touchmove', this.moveHandler, true);

        this.canvas.removeEventListener('mouseout', this.stopHandler, true);
        this.canvas.removeEventListener('mouseup', this.stopHandler, true);
        this.canvas.removeEventListener('touchend', this.stopHandler, true);
        this.canvas.removeEventListener('touchcancel', this.stopHandler, true);
    }

    drawInk(e) {
        console.log("draw");
        this.isPainting = true;
        const x = e.pageX || e.targetTouches[0].pageX;
        const y = e.pageY || e.targetTouches[0].pageY;
        const offset = this.canvas.getBoundingClientRect();
        const newpoint = {
            x: (x - offset.left) / this.canvas.offsetWidth * this.canvas.width,
            y: (y - offset.top) / this.canvas.offsetHeight * this.canvas.height
        };

        const line = { from: null, to: newpoint, color: this.selectedColor };

        this.draw(line, true);
        this.lastpoint = newpoint;
    }

    moveInk(e) {
        console.log("move");
        if(!this.isPainting) return;
        
        const x = e.pageX || e.targetTouches[0].pageX;
        const y = e.pageY || e.targetTouches[0].pageY;
        const offset = this.canvas.getBoundingClientRect();
        const newpoint = { 
            x: (x - offset.left) / this.canvas.offsetWidth * this.canvas.width, 
            y: (y - offset.top) / this.canvas.offsetHeight * this.canvas.height 
        };

        const line = { from: this.lastpoint, to: newpoint, color: this.selectedColor };


        this.draw(line);
        this.lastpoint = newpoint;
    }

    stopInk(e) {
        console.log("stop");
        this.isPainting = false;
    }

    draw(line, clearBuffer) {
        clearInterval(this.stoppedMoving);

        if (line.stop) {
            console.log("STOP: " + points.length);
            this.stoppedMoving = setInterval(() => this.catchUp(), 16);
            return;
        }


        if (clearBuffer) this.points = [];
        this.points.push(line);
        
        const weightedPeriod = 30;
        let point = {};
        let delta = {
            x: 0,
            y: 0
        };
        if (this.points.length > weightedPeriod) {
            //There are more than weightedPeriod points in the list
            //Calculate the destination. The source is == the last destination.
            point = {
                from: this.points[0].from,
                to: { x: 0, y: 0 }
            };

            //Sum the recent points, weighting the closest, highest.
            for (let i = 0; i < weightedPeriod; i++) {
                point.to.x += this.points[i].to.x * (weightedPeriod - i);
                point.to.y += this.points[i].to.y * (weightedPeriod - i);
            }
            //Divide the sum to get the average
            point.to.x /= ((weightedPeriod * (weightedPeriod + 1)) / 2);
            point.to.y /= ((weightedPeriod * (weightedPeriod + 1)) / 2);
            delta.x = point.to.x - this.points[0].to.x;
            delta.y = point.to.y - this.points[0].to.y;

            //Set the next source to the current destination
            this.points[1].from = point.to;
            //Remove the last point from the list so we're only smoothing recents
            this.points = this.points.splice(1);
        } else {
            //There is not enough data, start from scratch
            point = {
                from: { x: 0, y: 0 },
                to: { x: 0, y: 0 }
            };

            for (let i = 0; i < this.points.length; i++) {
                //If the point has a source, average it. Otherwise average the destination
                if (this.points[i].from) {
                    point.from.y += this.points[i].from.y * (this.points.length - i);
                    point.from.x += this.points[i].from.x * (this.points.length - i);
                } else {
                    point.from.y += this.points[i].to.y * (this.points.length - i);
                    point.from.x += this.points[i].to.x * (this.points.length - i);
                }
                point.to.x += this.points[i].to.x * (this.points.length - i);
                point.to.y += this.points[i].to.y * (this.points.length - i);
            }
            point.from.x /= ((this.points.length * (this.points.length + 1)) / 2);
            point.from.y /= ((this.points.length * (this.points.length + 1)) / 2);
            point.to.x /= ((this.points.length * (this.points.length + 1)) / 2);
            point.to.y /= ((this.points.length * (this.points.length + 1)) / 2);
            delta.x = point.to.x - this.points[0].to.x;
            delta.y = point.to.y - this.points[0].to.y;
        }

        const velocity = Math.cbrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));

        this.context.lineJoin = 'round';
        this.context.lineWidth = velocity + 1;
        this.context.strokeStyle = line.color;
        this.context.beginPath();

        //Average last ten points

        if (point.from && point.from.x) {
            this.context.moveTo(point.from.x, point.from.y);
        } else {
            this.context.moveTo(point.to.x - 1, point.to.y);
        }
        this.context.lineTo(point.to.x, point.to.y);
        this.context.closePath();
        this.context.stroke();

        point.color = line.color;
        this.onDraw(point, clearBuffer);

        if (this.points.length > 5) {
            this.stoppedMoving = setInterval(() => this.catchUp(), 16);
        }
    }

    catchUp() {
        let point;
        let delta = {
            x: 0,
            y: 0
        };
        if (this.points.length > 1) {
            //There are more than weightedPeriod points in the list
            //Calculate the destination. The source is == the last destination.
            point = {
                from: this.points[0].from,
                to: { x: 0, y: 0 }
            };

            //Sum the recent points, weighting the closest, highest.
            for (let i = 0; i < this.points.length; i++) {
                point.to.x += this.points[i].to.x * (this.points.length - i);
                point.to.y += this.points[i].to.y * (this.points.length - i);
            }

            //Divide the sum to get the average
            point.to.x /= ((this.points.length * (this.points.length + 1)) / 2);
            point.to.y /= ((this.points.length * (this.points.length + 1)) / 2);
            delta.x = point.to.x - this.points[0].to.x;
            delta.y = point.to.y - this.points[0].to.y;
            let velocity = Math.cbrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
            //Set the next source to the current destination
            this.points[1].from = point.to;
            //Remove the last point from the list so we're only smoothing recents
            this.points = this.points.splice(1);

            this.context.lineJoin = 'round';
            this.context.lineWidth = velocity + 1;
            this.context.strokeStyle = point.color;
            this.context.beginPath();
            if (point.from && point.from.x) {
                this.context.moveTo(point.from.x, point.from.y);
            } else {
                this.context.moveTo(point.to.x - 1, point.to.y);
            }
            this.context.lineTo(point.to.x, point.to.y);
            this.context.closePath();
            this.context.stroke();
            this.onDraw(point);
        } else {
            clearInterval(this.stoppedMoving);
        }
    }
    render() {
        return this.canvas;
    }

    onDraw() { console.log('No draw handler set');}
}