class WaveManager {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        this.currentWave = 0;
        this.enemiesRemaining = 0;
        this.spawnQueue = 0;
        this.lastSpawnTime = 0;
        this.spawnDelay = 1500;
    }

    startNextWave() {
        this.game.state = State.PLAYING;
        this.currentWave++;
        this.spawnQueue = CONFIG.INITIAL_ENEMIES + (this.currentWave - 1) * CONFIG.ENEMIES_PER_WAVE;
        this.enemiesRemaining = this.spawnQueue;
        this.game.ui.updateStatus(`WAVE ${this.currentWave} DETECTED`);
        this.game.audio.playWaveStart();
    }

    update() {
        if (this.game.state !== State.PLAYING) return;

        const now = performance.now();
        if (this.spawnQueue > 0 && now - this.lastSpawnTime > this.spawnDelay) {
            this.spawnEnemy();
            this.lastSpawnTime = now;
        }

        // Only clear wave if we have actually started and spawned all enemies
        if (this.currentWave > 0 && this.enemiesRemaining <= 0 && this.spawnQueue <= 0) {
            this.game.state = State.WAVE_CLEAR;
            setTimeout(() => this.startNextWave(), CONFIG.WAVE_DELAY);
        }
    }

    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        // Spawn at edges
        if (side === 0) { x = 50; y = Math.random() * CONFIG.ARENA_HEIGHT; }
        else if (side === 1) { x = CONFIG.ARENA_WIDTH - 50; y = Math.random() * CONFIG.ARENA_HEIGHT; }
        else if (side === 2) { x = Math.random() * CONFIG.ARENA_WIDTH; y = 50; }
        else { x = Math.random() * CONFIG.ARENA_WIDTH; y = CONFIG.ARENA_HEIGHT - 50; }

        const enemy = new EnemyTank(x, y, Math.random() * Math.PI * 2, CONFIG.ENEMY_COLOR, `enemy_${Date.now()}`);
        this.game.enemies.push(enemy);
        this.spawnQueue--;
        
        this.game.particles.createExplosion(x, y, CONFIG.ENEMY_COLOR, 10);
    }

    onEnemyDestroyed() {
        this.enemiesRemaining--;
        this.game.score += 100 * this.currentWave;
        
        const highScore = Math.max(this.game.score, localStorage.getItem("tankHighScore") || 0);
        localStorage.setItem("tankHighScore", highScore);
        
        this.game.ui.updateScores({ 
            p1: this.game.score, 
            p2: this.currentWave,
            high: highScore
        });
    }
}
