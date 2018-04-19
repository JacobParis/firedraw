export default class Sunburst {
    constructor(color) {
        this.color = color;
        this.burst = (
            <div class={this.color + "-dark-text sunburst"}>
                <b /><b /><b /><b /><b /><b /><b /><b /><b />
            </div>
        );
    }
    
    setColor(color) {
        this.burst.classList.remove(this.color + "-dark-text");
        this.burst.classList.add(color + "-dark-text");
    }

    render() {
        return this.burst;
    }
}