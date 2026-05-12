class Tank {
    constructor(x, y, angle, color, id) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.color = color;
        this.id = id;
        this.width = CONFIG.TANK_WIDTH;
        this.height = CONFIG.TANK_HEIGHT;
        
        this.velocity = 0;
        this.recoil = 0;
        this.lastShot = 0;
        this.health = 100;
        this.invulnerable = false;
        this.isDead = false;
        this.damageFlash = 0;

        this.speedBoost = false;
        this.rapidFire = false;
        this.invulnerabilityTimeout = null;
        this.speedTimeout = null;
        this.rapidFireTimeout = null;
    }

    move(dir) {
        if (this.isDead) return;
        const accel = 0.5;
        this.velocity += dir * accel;
    }

    rotate(dir) {
        if (this.isDead) return;
        this.angle += dir * 0.08;
    }

    takeDamage() {
        this.health -= 25;
        this.damageFlash = 10;
    }

    update(deltaTime, obstacles, others = []) {
        if (this.isDead) return;

        // Friction
        this.velocity *= 0.92;
        if (Math.abs(this.velocity) < 0.1) this.velocity = 0;

        // Predictive collision
        const nx = this.x + Math.cos(this.angle) * this.velocity;
        const ny = this.y + Math.sin(this.angle) * this.velocity;
        const tankRect = { x: nx - this.width/2, y: ny - this.height/2, w: this.width, h: this.height };
        
        let blocked = false;
        
        // Obstacle collision
        for (const o of obstacles) {
            if (Collision.rectRect(tankRect, o)) {
                blocked = true;
                this.velocity *= -0.5;
                break;
            }
        }

        // Tank-Tank collision (Bug 4)
        if (!blocked) {
            for (const other of others) {
                if (other !== this && !other.isDead) {
                    const otherRect = { x: other.x - other.width/2, y: other.y - other.height/2, w: other.width, h: other.height };
                    if (Collision.rectRect(tankRect, otherRect)) {
                        blocked = true;
                        this.velocity *= -0.5;
                        other.velocity += this.velocity * 0.5; // Push other tank slightly
                        break;
                    }
                }
            }
        }

        if (!blocked) {
            this.x = nx;
            this.y = ny;
            
            // Movement Trail
            if (Math.abs(this.velocity) > 0.5 && window.game) {
                window.game.particles.createTrail(this.x - Math.cos(this.angle) * 20, this.y - Math.sin(this.angle) * 20, this.color);
            }

            const hitBounds = Physics.checkBounds(this, CONFIG.ARENA_WIDTH, CONFIG.ARENA_HEIGHT);
            if (hitBounds) this.velocity *= -0.5; // Bug 9: Handle bounds hit
        }

        if (this.recoil > 0) this.recoil *= 0.8;
        if (this.damageFlash > 0) this.damageFlash--;
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(-this.width/2 + 4, -this.height/2 + 4, this.width, this.height);

        // Hull
        ctx.fillStyle = this.damageFlash > 0 ? "#fff" : this.color;
        
        if (this.invulnerable) {
            ctx.globalAlpha = Math.sin(Date.now() / 100) * 0.3 + 0.6;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.width/2 - 5, -this.height/2 - 5, this.width + 10, this.height + 10);
            ctx.globalAlpha = 1.0;
        }
        
        // Main Body with recoil effect
        const bodyX = -this.width/2 - this.recoil;
        ctx.fillRect(bodyX, -this.height/2, this.width, this.height);
        
        // Inner detail
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(bodyX + 5, -this.height/2 + 5, this.width - 10, this.height - 10);

        // Turret
        ctx.fillStyle = "#0a0a0c";
        ctx.strokeStyle = this.damageFlash > 0 ? "#fff" : this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-8, -10, 20, 20);
        ctx.fill();
        ctx.stroke();

        // Barrel
        ctx.fillStyle = "#0a0a0c";
        ctx.fillRect(12, -4, 18, 8);
        ctx.strokeRect(12, -4, 18, 8);

        // Health bar
        if (this.health < 100) {
            ctx.restore();
            ctx.save();
            ctx.translate(this.x, this.y - 30);
            ctx.fillStyle = "#333";
            ctx.fillRect(-20, 0, 40, 4);
            ctx.fillStyle = this.color;
            ctx.fillRect(-20, 0, (this.health / 100) * 40, 4);
        }

        ctx.restore();
    }
}
