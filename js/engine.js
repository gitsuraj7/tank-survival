class GameEngine {
    constructor(update, draw) {
        this.update = update;
        this.draw = draw;
        this.lastTime = 0;
        this.running = true;
        this.deltaTime = 0;
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        this.deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Cap delta time to avoid huge jumps
        if (this.deltaTime > 100) this.deltaTime = 100;

        this.update(this.deltaTime);
        this.draw();

        if (this.running) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }

    stop() {
        this.running = false;
    }
}
