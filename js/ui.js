class UIManager {
    constructor() {
        this.p1Score = document.getElementById("p1Score");
        this.p2Score = document.getElementById("p2Score");
        this.menu = document.getElementById("menu");
        this.gameOver = document.getElementById("gameOver");
        this.winnerText = document.getElementById("winnerText");
        this.statusText = document.getElementById("statusText");
    }

    updateScores(data) {
        if (this.p1Score) this.p1Score.innerText = data.p1;
        if (this.p2Score) this.p2Score.innerText = data.p2;
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
            this.winnerText.innerText = `COMBAT TERMINATED\nDESTROYED BY ${attackerName}\nFINAL SCORE: ${window.game.score}`;
        }
        if (this.gameOver) this.gameOver.classList.remove("hidden");
    }

    updateStatus(text) {
        if (this.statusText) this.statusText.innerText = `SYSTEM: ${text}`;
    }
}
