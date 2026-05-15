const PowerUpType = {
    OVERDRIVE: 'OVERDRIVE',
    REPAIR: 'REPAIR',
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
            case PowerUpType.OVERDRIVE:
                // Combine speed and fire rate
                if (tank.speedTimeout) clearTimeout(tank.speedTimeout);
                if (tank.rapidFireTimeout) clearTimeout(tank.rapidFireTimeout);
                
                tank.speedBoost = true;
                tank.rapidFire = true;
                
                const overdriveDuration = 6000;
                tank.speedTimeout = setTimeout(() => { 
                    tank.speedBoost = false; 
                    tank.speedTimeout = null; 
                }, overdriveDuration);
                
                tank.rapidFireTimeout = setTimeout(() => { 
                    tank.rapidFire = false; 
                    tank.rapidFireTimeout = null; 
                }, overdriveDuration);
                break;
                
            case PowerUpType.REPAIR:
                // Nano-Repair: +50 HP, capped at 200
                const maxHP = tank.id === 1 ? 200 : 100;
                tank.health = Math.min(tank.health + 50, maxHP);
                game.ui.updateStatus("NANO-REPAIR SEQUENCE COMPLETE");
                break;
                
            case PowerUpType.SHIELD:
                if (tank.invulnerabilityTimeout) clearTimeout(tank.invulnerabilityTimeout);
                tank.invulnerable = true;
                tank.invulnerabilityTimeout = setTimeout(() => { 
                    tank.invulnerable = false; 
                    tank.invulnerabilityTimeout = null; 
                }, 6000);
                game.ui.updateStatus("KINETIC SHIELD ENGAGED");
                break;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        
        let color = "#fff";
        if (this.type === PowerUpType.OVERDRIVE) color = "#00f2ff"; // Cyan
        if (this.type === PowerUpType.REPAIR) color = "#00ff41";    // Green
        if (this.type === PowerUpType.SHIELD) color = "#ffff00";    // Yellow

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.rotate(Date.now() / 1000);
        
        // Draw double square for "premium" look
        ctx.strokeRect(-this.currentSize/2, -this.currentSize/2, this.currentSize, this.currentSize);
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-this.currentSize/3, -this.currentSize/3, this.currentSize*0.6, this.currentSize*0.6);
        
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = color;
        ctx.fillRect(-this.currentSize/2, -this.currentSize/2, this.currentSize, this.currentSize);
        
        ctx.restore();
    }
}
