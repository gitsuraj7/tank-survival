class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.shakeAmount = 0;
        this.cameraX = 0;
        this.cameraY = 0;
    }

    shake(intensity) {
        this.shakeAmount = intensity;
    }

    update(deltaTime) {
        if (this.shakeAmount > 0) {
            this.cameraX = (Math.random() - 0.5) * this.shakeAmount;
            this.cameraY = (Math.random() - 0.5) * this.shakeAmount;
            this.shakeAmount *= 0.9;
            if (this.shakeAmount < 0.1) {
                this.shakeAmount = 0;
                this.cameraX = 0;
                this.cameraY = 0;
            }
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    applyCamera() {
        this.ctx.save();
        this.ctx.translate(this.cameraX, this.cameraY);
    }

    restoreCamera() {
        this.ctx.restore();
    }

    drawArena(obstacles) {
        
        // Solid background
        this.ctx.fillStyle = "#0a0a0c";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Technical Grid with subtle glow
        this.ctx.strokeStyle = "rgba(0, 255, 65, 0.08)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.stroke();

        // Arena Border Glow
        this.ctx.strokeStyle = "rgba(0, 255, 65, 0.2)";
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

        // Obstacles with technical aesthetic
        obstacles.forEach(o => {
            // Shadow/Glow
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = "rgba(0,0,0,0.5)";
            
            this.ctx.fillStyle = "#111114";
            this.ctx.fillRect(o.x, o.y, o.w, o.h);
            
            this.ctx.shadowBlur = 0; // Reset shadow
            
            this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(o.x, o.y, o.w, o.h);

            // Accent corners (Neon)
            this.ctx.strokeStyle = "rgba(0, 255, 65, 0.4)";
            this.ctx.lineWidth = 2;
            const s = 10;
            // Top-left
            this.ctx.beginPath();
            this.ctx.moveTo(o.x, o.y + s); this.ctx.lineTo(o.x, o.y); this.ctx.lineTo(o.x + s, o.y);
            this.ctx.stroke();
            // Bottom-right
            this.ctx.beginPath();
            this.ctx.moveTo(o.x + o.w, o.y + o.h - s); this.ctx.lineTo(o.x + o.w, o.h + o.y); this.ctx.lineTo(o.x + o.w - s, o.y + o.h);
            this.ctx.stroke();
        });
    }

    drawScanlines() {
        this.ctx.fillStyle = "rgba(10, 10, 12, 0.1)";
        for (let y = 0; y < this.canvas.height; y += 4) {
            this.ctx.fillRect(0, y, this.canvas.width, 1);
        }
    }
}
