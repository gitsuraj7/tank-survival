const CONFIG = {
    P1_COLOR: "#00ff41", // Acid Green
    ENEMY_COLOR: "#ff3e3e", // Tactical Red
    POWERUP_COLOR: "#00f2ff", // Cyber Blue
    
    BULLET_SPEED: 8,
    TANK_SPEED: 3,
    ROTATION_SPEED: 0.05,
    WIN_SCORE: 5,
    RESPAWN_DELAY: 2000,
    FRICTION: 0.95,
    
    ARENA_WIDTH: 1100,
    ARENA_HEIGHT: 600,
    TANK_WIDTH: 40,
    TANK_HEIGHT: 30,
    SHOOT_DELAY: 500,

    // AI & Survival Settings
    AI_UPDATE_RATE: 100, // ms
    AI_SIGHT_RANGE: 500,
    WAVE_DELAY: 3000,
    INITIAL_ENEMIES: 2,
    ENEMIES_PER_WAVE: 1,
    MAX_ENEMIES: 10,
    
    // Juice
    SCREEN_SHAKE_INTENSITY: 5,
    HIT_STOP_DURATION: 50
};

const State = {
    MENU: "MENU",
    PLAYING: "PLAYING",
    WAVE_CLEAR: "WAVE_CLEAR",
    GAME_OVER: "GAME_OVER"
};
