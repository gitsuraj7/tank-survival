class UIManager {
    constructor(game) {
        this.game = game;
        this.p1Score = document.getElementById("p1Score");
        this.p2Score = document.getElementById("p2Score");
        this.highScore = document.getElementById("highScore");
        this.menu = document.getElementById("menu");
        this.gameOver = document.getElementById("gameOver");
        this.winnerText = document.getElementById("winnerText");
        this.statusText = document.getElementById("statusText");
        
        // Settings elements
        this.settingsBtn = document.getElementById("settingsBtn");
        this.settingsOverlay = document.getElementById("settingsOverlay");
        this.fixedJoystickToggle = document.getElementById("fixedJoystickToggle");
        this.closeSettings = document.getElementById("closeSettings");

        this.initSettings();
    }

    initSettings() {
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener("click", () => {
                this.settingsOverlay.style.display = "flex";
                const stored = localStorage.getItem("fixedJoystick");
                const isFixed = stored !== null ? stored === "true" : true;
                this.fixedJoystickToggle.checked = isFixed;
            });
        }

        if (this.closeSettings) {
            this.closeSettings.addEventListener("click", () => {
                this.settingsOverlay.style.display = "none";
            });
        }

        if (this.fixedJoystickToggle) {
            this.fixedJoystickToggle.addEventListener("change", (e) => {
                if (this.game.mobileInput) {
                    this.game.mobileInput.joystick.dynamicMode = !e.target.checked;
                }
                localStorage.setItem("fixedJoystick", e.target.checked);
            });
        }
    }

    updateScores(data) {
        if (this.p1Score) this.p1Score.innerText = data.p1;
        if (this.p2Score) this.p2Score.innerText = data.p2;
        if (this.highScore && data.high !== undefined) this.highScore.innerText = data.high;
    }

    showMenu() {
        if (this.menu) this.menu.classList.remove("hidden");
        if (this.gameOver) this.gameOver.classList.add("hidden");
    }

    hideOverlays() {
        if (this.menu) this.menu.classList.add("hidden");
        if (this.gameOver) this.gameOver.classList.add("hidden");
    }

    showGameOver(attackerId) {
        if (this.winnerText) {
            const attackerName = attackerId === 1 ? "PLAYER" : (attackerId === 0 ? "ARENA" : "ENEMY");
            this.winnerText.innerText = `COMBAT TERMINATED\nDESTROYED BY ${attackerName}\nFINAL SCORE: ${this.game.score}`;
        }
        if (this.gameOver) this.gameOver.classList.remove("hidden");
    }

    updateStatus(text) {
        if (this.statusText) this.statusText.innerText = `SYSTEM: ${text}`;
    }
}