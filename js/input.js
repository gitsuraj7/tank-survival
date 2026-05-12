class InputHandler {
    constructor() {
        this.keys = {};
        this.initKeyboard();
        this.initFocusHandling();
    }

    initKeyboard() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
            const gameKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "Enter"];
            if (gameKeys.includes(e.code)) e.preventDefault();
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });
    }

    initFocusHandling() {
        window.addEventListener("blur", () => {
            this.keys = {};
        });
    }

    isPressed(code) {
        return !!this.keys[code];
    }
}
