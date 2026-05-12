class TankSurvival {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.input = new InputHandler();
        this.mobileInput = new MobileInputController(this);
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.particles = new ParticleSystem(this);
        this.ui = new UIManager(this);
        this.audio = audio;
        
        this.state = State.MENU;
        this.score = 0;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.obstacles = [
            { x: 250, y: 150, w: 40, h: 300 },
            { x: 810, y: 150, w: 40, h: 300 },
            { x: 450, y: 280, w: 200, h: 40 },
            { x: 100, y: 100, w: 80, h: 20 },
            { x: 920, y: 480, w: 80, h: 20 }
        ];

        this.waveManager = new WaveManager(this);
        this.engine = new GameEngine(this.update.bind(this), this.draw.bind(this));
        
        this.layoutUpdate();
        window.addEventListener("resize", () => this.layoutUpdate());
        
        this.initUI();
        this.engine.start();

        this.powerupTimer = 15000;
    }

    layoutUpdate() {
        const wrapper = document.querySelector(".game-wrapper");
        const container = document.querySelector(".game-container");
        if (!wrapper || !container) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const targetAspect = CONFIG.ARENA_WIDTH / CONFIG.ARENA_HEIGHT;
        const windowAspect = windowWidth / windowHeight;

        let scale = 1;
        if (windowAspect > targetAspect) {
            // Window is wider than arena
            scale = (windowHeight * 0.9) / CONFIG.ARENA_HEIGHT;
        } else {
            // Window is narrower than arena
            scale = (windowWidth * 0.95) / CONFIG.ARENA_WIDTH;
        }

        // Apply scale to wrapper
        wrapper.style.width = `${CONFIG.ARENA_WIDTH * scale}px`;
        wrapper.style.height = `${CONFIG.ARENA_HEIGHT * scale}px`;
        
        // Ensure status bar and top bar are reachable
        const topBar = document.querySelector(".top-bar");
        if (topBar) topBar.style.top = `${-40 * scale}px`;
        
        const statusBar = document.querySelector(".status-bar");
        if (statusBar) statusBar.style.bottom = `${-30 * scale}px`;
    }

    initUI() {
        document.getElementById("startBtn").addEventListener("click", () => this.startSurvival());
        document.getElementById("restartBtn").addEventListener("click", () => this.startSurvival());
    }

    startSurvival() {
        console.log("Game: Starting Survival Mode...");
        try {
            this.audio.playClick();
        } catch (e) {
            console.warn("Audio: Failed to play click sound", e);
        }
        this.reset();
        this.state = State.PLAYING;
        this.ui.hideOverlays();
        this.ui.updateStatus("Tactical Combat Initiated");
        this.waveManager.startNextWave();
    }

    reset() {
        this.score = 0;
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.particles.clear();
        this.hitStop = 0;
        this.player = new Tank(150, CONFIG.ARENA_HEIGHT / 2, 0, CONFIG.P1_COLOR, 1);
        this.player.health = 200; // Double life for main character
        this.waveManager.reset();
        
        const highScore = localStorage.getItem("tankHighScore") || 0;
        this.ui.updateScores({ p1: 0, p2: 1, high: highScore });
    }

    spawnPowerUp() {
        if (this.state !== State.PLAYING) return;
        const types = Object.values(PowerUpType);
        const type = types[Math.floor(Math.random() * types.length)];
        
        let x, y, valid = false, attempts = 0;
        while (!valid && attempts < 10) {
            x = Math.random() * (CONFIG.ARENA_WIDTH - 200) + 100;
            y = Math.random() * (CONFIG.ARENA_HEIGHT - 200) + 100;
            valid = true;
            for (const o of this.obstacles) {
                if (Collision.circleRect({x, y, r: 20}, o)) {
                    valid = false;
                    break;
                }
            }
            attempts++;
        }

        if (valid) this.powerups.push(new PowerUp(x, y, type));
    }

    handleInput() {
        if (this.state !== State.PLAYING || !this.player) return;

        // 1. Keyboard Input
        let kbForward = 0;
        let kbTurn = 0;
        if (this.input.isPressed("ArrowUp") || this.input.isPressed("KeyW")) kbForward += 1;
        if (this.input.isPressed("ArrowDown") || this.input.isPressed("KeyS")) kbForward -= 1;
        if (this.input.isPressed("ArrowLeft") || this.input.isPressed("KeyA")) kbTurn -= 1;
        if (this.input.isPressed("ArrowRight") || this.input.isPressed("KeyD")) kbTurn += 1;

        // 2. Mobile Analog Input
        const mobileMV = this.mobileInput.movementVector;
        
        // 3. Combined Application (Prioritize Mobile Analog if active)
        const forward = Math.abs(mobileMV.y) > 0.05 ? mobileMV.y : kbForward;
        const turn = Math.abs(mobileMV.x) > 0.05 ? mobileMV.x : kbTurn;

        if (forward !== 0) this.player.move(forward);
        if (turn !== 0) this.player.rotate(turn);

        // Shooting
        if (this.input.isPressed("Space") || this.input.isPressed("Enter") || this.mobileInput.isFiring) {
            this.fireBullet(this.player);
        }
    }

    fireBullet(tank) {
        if (tank.isDead) return;
        const now = performance.now();
        const delay = tank.rapidFire ? CONFIG.SHOOT_DELAY / 2 : CONFIG.SHOOT_DELAY;
        if (now - tank.lastShot < delay) return;

        tank.lastShot = now;
        tank.recoil = 10; // Visual recoil kickback
        this.audio.playShoot();
        
        const bx = tank.x + Math.cos(tank.angle) * 30;
        const by = tank.y + Math.sin(tank.angle) * 30;
        
        this.bullets.push(new Bullet(bx, by, tank.angle, tank.color, tank.id));
        this.particles.createMuzzleFlash(bx, by, tank.angle);
        
        if (tank.id === 1) {
            this.renderer.shake(3);
            this.player.velocity -= 1.5; // Physical recoil
        }
    }

    handleHit(target, attackerId) {
        this.audio.playHit();
        this.particles.createSparks(target.x, target.y, target.color);
        this.renderer.shake(CONFIG.SCREEN_SHAKE_INTENSITY);

        // Hit stop effect
        this.hitStop = 2; 

        target.takeDamage();

        if (target.id === 1 && target.health <= 0) {
            this.state = State.GAME_OVER;
            this.ui.showGameOver(attackerId);
        } else if (target.id !== 1 && target.health <= 0) {
            target.isDead = true;
            this.waveManager.onEnemyDestroyed();
            this.particles.createExplosion(target.x, target.y, target.color, 30);
            this.audio.playExplosion();
        }
    }

    update(deltaTime) {
        if (this.state === State.MENU) return;

        // Powerup timer
        if (this.state === State.PLAYING) {
            this.powerupTimer -= deltaTime;
            if (this.powerupTimer <= 0) {
                this.spawnPowerUp();
                this.powerupTimer = 15000;
            }
        }

        // Hit Stop logic
        if (this.hitStop > 0) {
            this.hitStop--;
            return;
        }

        this.handleInput();
        
        if (this.player) this.player.update(deltaTime, this.obstacles, this.enemies);
        
        this.enemies = this.enemies.filter(e => !e.isDead);
        this.enemies.forEach(e => e.update(deltaTime, this.obstacles, this.player));
        
        this.bullets = this.bullets.filter(b => b.update(this, deltaTime));
        this.particles.update();
        this.powerups = this.powerups.filter(pu => pu.update(this));
        
        this.waveManager.update();
        this.renderer.update(deltaTime);
    }

    draw() {
        this.renderer.clear();
        
        this.renderer.applyCamera();
        this.renderer.drawArena(this.obstacles);
        this.powerups.forEach(pu => pu.draw(this.ctx));
        if (this.player) this.player.draw(this.ctx);
        this.enemies.forEach(e => e.draw(this.ctx));
        this.bullets.forEach(b => b.draw(this.ctx));
        this.particles.draw(this.ctx);
        this.renderer.restoreCamera();
        
        this.renderer.drawScanlines();
        this.mobileInput.renderDebug(this.ctx);
    }
}

// Start Game
window.game = new TankSurvival();
