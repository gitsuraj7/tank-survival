class Particle {
    constructor(x, y, color, size, vx, vy, life) {
        this.reset(x, y, color, size, vx, vy, life);
    }

    reset(x, y, color, size, vx, vy, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= 0.96;
        this.vy *= 0.96;
        return this.life > 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 150;
    }

    clear() {
        this.particles = [];
    }

    createExplosion(x, y, color, count) {
        if (this.particles.length > this.maxParticles) return;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.particles.push(new Particle(
                x, y, 
                color, 
                Math.random() * 3 + 1,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() * 20 + 15
            ));
        }
    }

    createMuzzleFlash(x, y, angle) {
        if (this.particles.length > this.maxParticles) return;
        for (let i = 0; i < 5; i++) {
            const a = angle + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 5 + 5;
            this.particles.push(new Particle(
                x, y, 
                "#fff", 
                Math.random() * 4 + 2,
                Math.cos(a) * speed,
                Math.sin(a) * speed,
                Math.random() * 5 + 5
            ));
        }
    }

    createSparks(x, y, color) {
        if (this.particles.length > this.maxParticles) return;
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            this.particles.push(new Particle(
                x, y, 
                color, 
                Math.random() * 2 + 1,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() * 10 + 5
            ));
        }
    }

    createTrail(x, y, color) {
        if (this.particles.length > this.maxParticles) return;
        if (Math.random() > 0.3) return; // Sparse trails
        this.particles.push(new Particle(
            x, y, 
            color, 
            Math.random() * 2 + 2,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            Math.random() * 20 + 10
        ));
    }

    update() {
        this.particles = this.particles.filter(p => p.update());
    }

    draw(ctx) {
        // Bulk drawing for performance
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        });
        ctx.globalAlpha = 1.0;
    }
}
