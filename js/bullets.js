class Bullet {
    constructor(x, y, angle, color, ownerId) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * CONFIG.BULLET_SPEED;
        this.vy = Math.sin(angle) * CONFIG.BULLET_SPEED;
        this.color = color;
        this.ownerId = ownerId;
        this.active = true;
        this.life = 100; // Frames or distance
        this.trail = [];
    }

    update(game, deltaTime) {
        if (!this.active) return false;

        // Store trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();

        const dt = deltaTime / 16.67;
        const totalVx = this.vx * dt;
        const totalVy = this.vy * dt;
        
        // Sub-stepping to prevent tunneling (Bug 6)
        const steps = Math.ceil(Math.hypot(totalVx, totalVy) / 5); // Max 5px per step
        const stepVx = totalVx / steps;
        const stepVy = totalVy / steps;

        for (let s = 0; s < steps; s++) {
            this.x += stepVx;
            this.y += stepVy;

            // Collision with Arena
            if (this.x < 0 || this.x > CONFIG.ARENA_WIDTH || this.y < 0 || this.y > CONFIG.ARENA_HEIGHT) {
                this.active = false;
                return false;
            }

            // Collision with Obstacles
            for (const o of game.obstacles) {
                if (this.x > o.x && this.x < o.x + o.w && this.y > o.y && this.y < o.y + o.h) {
                    this.active = false;
                    game.particles.createSparks(this.x, this.y, this.color);
                    return false;
                }
            }

            // Collision with Tanks
            const targets = [...game.enemies];
            if (game.player) targets.push(game.player);

            for (const p of targets) {
                if (p.id !== this.ownerId && !p.isDead && !p.invulnerable) {
                    const dist = Math.hypot(this.x - p.x, this.y - p.y);
                    if (dist < 20) {
                        this.active = false;
                        game.handleHit(p, this.ownerId);
                        return false;
                    }
                }
            }
        }

        this.life--;
        if (this.life <= 0) { this.active = false; return false; }

        return true;
    }

    draw(ctx) {
        if (!this.active) return;

        // Draw trail
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        if (this.trail.length > 0) {
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        }
        ctx.restore();

        // Draw bullet head
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }
}
