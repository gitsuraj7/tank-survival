class EnemyTank extends Tank {
    constructor(x, y, angle, color, id) {
        super(x, y, angle, color, id);
        this.lastAIUpdate = 0;
        this.target = null;
        this.panicTurn = 0;
    }

    update(deltaTime, obstacles, player) {
        if (this.isDead) return;

        this.target = player;
        const now = performance.now();

        // High frequency think for responsiveness
        if (now - this.lastAIUpdate > CONFIG.AI_UPDATE_RATE) {
            this.lastAIUpdate = now;
            this.think(obstacles);
        }

        super.update(deltaTime, obstacles);
    }

    think(obstacles) {
        if (!this.target || this.target.isDead) {
            this.velocity *= 0.9;
            return;
        }

        const dist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
        
        // Predictive Aiming
        let tx = this.target.x;
        let ty = this.target.y;
        
        if (Math.abs(this.target.velocity) > 0.1) {
            const timeToHit = dist / CONFIG.BULLET_SPEED;
            tx += Math.cos(this.target.angle) * this.target.velocity * timeToHit * 0.7; // Lead the shot
            ty += Math.sin(this.target.angle) * this.target.velocity * timeToHit * 0.7;
        }

        const targetAngle = Math.atan2(ty - this.y, tx - this.x);

        // Normalize angles
        let angleDiff = targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Rotation - snappy turning
        if (this.panicTurn > 0) {
            this.rotate(1);
            this.panicTurn--;
        } else if (Math.abs(angleDiff) > 0.05) {
            this.rotate(angleDiff > 0 ? 1 : -1);
        }

        // Movement - Aggressive chasing
        if (dist > 300) {
            this.move(1);
        } else if (dist < 150) {
            this.move(-1);
        } else {
            // Repositioning / Strafe-like movement
            this.move(0.5);
            if (Math.random() < 0.02) this.panicTurn = 10; 
        }

        // Shooting - intelligent fire
        if (dist < CONFIG.AI_SIGHT_RANGE && Math.abs(angleDiff) < 0.3) {
            if (window.game && typeof window.game.fireBullet === 'function') {
                window.game.fireBullet(this);
            }
        }

        // Wall avoidance
        this.avoidObstacles(obstacles);
    }

    avoidObstacles(obstacles) {
        const lookAhead = 80;
        const ax = this.x + Math.cos(this.angle) * lookAhead;
        const ay = this.y + Math.sin(this.angle) * lookAhead;

        for (const o of obstacles) {
            if (Collision.pointRect(ax, ay, o)) {
                this.panicTurn = 20;
                this.velocity *= 0.5;
                break;
            }
        }
    }
}
