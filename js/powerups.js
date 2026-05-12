const PowerUpType = {
    SPEED: 'SPEED',
    RAPID_FIRE: 'RAPID_FIRE',
    SHIELD: 'SHIELD'
};

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 20;
        this.active = true;
        this.currentSize = this.size;
    }

    update(game) {
        if (!this.active) return false;

        // Pulse effect
        this.currentSize = this.size + Math.sin(Date.now() / 200) * 5;

        // Collision with player
        if (game.player && !game.player.isDead) {
            const dist = Math.hypot(this.x - game.player.x, this.y - game.player.y);
            if (dist < 30) {
                this.apply(game.player, game);
                this.active = false;
                return false;
            }
        }

        return true;
    }

    apply(tank, game) {
        game.audio.playPickup();
        switch (this.type) {
            case PowerUpType.SPEED:
                if (tank.speedTimeout) clearTimeout(tank.speedTimeout);
                tank.speedBoost = true;
                tank.speedTimeout = setTimeout(() => { tank.speedBoost = false; tank.speedTimeout = null; }, 5000);
                break;
            case PowerUpType.RAPID_FIRE:
                if (tank.rapidFireTimeout) clearTimeout(tank.rapidFireTimeout);
                tank.rapidFire = true;
                tank.rapidFireTimeout = setTimeout(() => { tank.rapidFire = false; tank.rapidFireTimeout = null; }, 5000);
                break;
            case PowerUpType.SHIELD:
                if (tank.invulnerabilityTimeout) clearTimeout(tank.invulnerabilityTimeout);
                tank.invulnerable = true;
                tank.invulnerabilityTimeout = setTimeout(() => { tank.invulnerable = false; tank.invulnerabilityTimeout = null; }, 5000);
                break;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        
        let color = "#fff";
        if (this.type === PowerUpType.SPEED) color = "#00ffff";
        if (this.type === PowerUpType.RAPID_FIRE) color = "#ff00ff";
        if (this.type === PowerUpType.SHIELD) color = "#ffff00";

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.rotate(Date.now() / 1000);
        ctx.strokeRect(-this.currentSize/2, -this.currentSize/2, this.currentSize, this.currentSize);
        
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = color;
        ctx.fillRect(-this.currentSize/2, -this.currentSize/2, this.currentSize, this.currentSize);
        
        ctx.restore();
    }
}
