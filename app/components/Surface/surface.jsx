export default class Surface {
    constructor(socket) {
        this.socket = socket;

        this.canvas = <canvas id="canvas" width="300" height="300"></canvas>
        // Disable text selection on the canvas
        this.canvas.addEventListener('mousedown', (() => false));

        this.socket.on('drawCanvas', (canvasToDraw) => {
            console.log(canvasToDraw);
            if (canvasToDraw) {
                console.log("Should be drawing a canvas");
                //drawLayer.width(drawLayer.clientWidth);
                this.context.lineJoin = 'round';

                for(let line of canvasToDraw) {
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

        this.socket.on('draw', (line, clearBuffer) => this.draw(line, clearBuffer));


        this.context = this.canvas.getContext("2d");
        this.context.beginPath();
        this.context.lineTo(300, 300);
        this.context.stroke();
        this.isMyTurn;


        /** OPTIONS */
        /** Stores the selected colour as a string */
        this.selectedColour = '#ff0000';
        // An array of points to drip ink
        this.points = [];
        // Stores an interval timer from the last time we moved the cursor
        this.stoppedMoving;

        this.blackInk = <span class="ink black" />
        this.blackInk.addEventListener('click', () => {
            this.selectedColour = '#252525';
        });

        this.colorInk = <span class="ink" />
        this.colorInk.addEventListener('click', () => {
            const colour = this.colorInk.style.backgroundColor;
            this.selectedColour = colour;
        });

        this.drawOptions = (
            <footer class="options">
                <panel>
                    {this.blackInk}
                    {this.colorInk}                    
                </panel>
            </footer>
        );

        this.gamePanel = (
            <div>
                {this.canvas}
                {this.drawOptions}
            </div>
        );

        this.drawHandler = this.drawInk.bind(this);
        this.moveHandler = this.moveInk.bind(this);
        this.stopHandler = this.stopInk.bind(this);
    }

    
    addListeners() {
        this.canvas.addEventListener('mousedown', this.drawHandler, true);
        this.canvas.addEventListener('touchstart', this.drawHandler, true);
        
        this.canvas.addEventListener('mousemove', this.moveHandler, true);
        this.canvas.addEventListener('touchmove', this.moveHandler, true);
        
        this.canvas.addEventListener('mouseout', this.stopHandler, true);
        this.canvas.addEventListener('mouseup', this.stopHandler, true);
        this.canvas.addEventListener('touchend', this.stopHandler, true);
        this.canvas.addEventListener('touchcancel', this.stopHandler, true);
    }

    removeListeners() {
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
        const newpoint = { x: (x - this.gamePanel.offsetLeft) / this.canvas.offsetWidth * this.canvas.width, y: (y - this.gamePanel.offsetTop) / this.canvas.offsetHeight * this.canvas.height };
        const line = { from: null, to: newpoint, color: this.selectedColour };

        this.draw(line, true);
        this.lastpoint = newpoint;
    }

    moveInk(e) {
        console.log("move");
        if(!this.isPainting) return;
        
        const x = e.pageX || e.targetTouches[0].pageX;
        const y = e.pageY || e.targetTouches[0].pageY;
        const newpoint = { x: (x - this.gamePanel.offsetLeft) / this.canvas.offsetWidth * this.canvas.width, y: (y - this.gamePanel.offsetTop) / this.canvas.offsetHeight * this.canvas.height };
        const line = { from: this.lastpoint, to: newpoint, color: this.selectedColour };


        this.draw(line);
        this.lastpoint = newpoint;
    }

    stopInk(e) {
        console.log("stop");
        this.isPainting = false;
        /*this.socket.emit('draw', {
            to: lastpoint, 
            color: selectedcolor, 
            stop: true 
        });*/
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
            delta.x = Math.abs(point.to.x - this.points[0].to.x);
            delta.y = Math.abs(point.to.y - this.points[0].to.y);

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
            delta.x = Math.abs(point.to.x - this.points[0].to.x);
            delta.y = Math.abs(point.to.y - this.points[0].to.y);
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

        if (this.isMyTurn) {
            point.color = line.color;
            this.socket.emit('draw', point, clearBuffer);
        }

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
            delta.x = Math.abs(point.to.x - this.points[0].to.x);
            delta.y = Math.abs(point.to.y - this.points[0].to.y);
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
            if (this.isMyTurn) {
                this.socket.emit('draw', point);
            }
        } else {
            clearInterval(this.stoppedMoving);
        }
    }
    render() {
        return this.gamePanel;
    }
}