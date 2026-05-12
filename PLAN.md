# TANK DUEL — DEVELOPMENT BLUEPRINT

## Project Vision
Build a polished, fast-paced 2-player top-down tank battle game that feels responsive, competitive, and visually satisfying despite being lightweight and browser-based.

This is not a “tutorial game.”
The goal is to make something that instantly looks engineered.

---

# Core Gameplay

## Match Rules
- Local 2-player battle
- Player 1:
  - Move → WASD
  - Shoot → SPACE
- Player 2:
  - Move → Arrow Keys
  - Shoot → ENTER
- First player to reach 5 kills wins
- Tanks respawn after destruction
- Small respawn invulnerability window
- Fast restart loop

---

# Technical Direction

## Stack
### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Rendering
- HTML5 Canvas API

### Audio
- Web Audio API

### Deployment
- Vercel / Netlify / GitHub Pages

---

# Engineering Principles

## Priorities
1. Gameplay feel
2. Responsiveness
3. Clean architecture
4. Visual polish
5. Expandability

## Avoid
- Overengineering
- Heavy frameworks
- Bloated assets
- Mobile-first distractions
- Premature multiplayer networking

---

# File Structure

```txt
tank-duel/
│
├── index.html
├── style.css
├── game.js
│
├── /js
│   ├── engine.js
│   ├── input.js
│   ├── physics.js
│   ├── rendering.js
│   ├── collision.js
│   ├── tanks.js
│   ├── bullets.js
│   ├── particles.js
│   ├── powerups.js
│   ├── ui.js
│   ├── audio.js
│   └── utils.js
│
├── /assets
│   ├── sounds
│   ├── textures
│   └── effects
│
└── README.md
```

---

# System Architecture

## Core Systems

### 1. Game Engine
Responsible for:
* Main game loop
* Delta timing
* State updates
* Render calls
* Pause/start/reset logic

### 2. Input System
Tracks:
* Key presses
* Held inputs
* Simultaneous actions

### 3. Tank System
Each tank should support:
* Rotation
* Forward/backward movement
* Velocity
* Friction
* Recoil
* Health
* Respawn logic

### 4. Collision System
Must support:
* Tank ↔ Wall
* Tank ↔ Tank
* Bullet ↔ Wall
* Bullet ↔ Tank

### 5. Shooting System
Features:
* Projectile spawning
* Directional firing
* Cooldown system
* Bullet lifetime
* Hit registration

### 6. Power-up System
Initial Power-ups:
* Speed Boost
* Shield
* Rapid Fire

---

# Development Phases

## Phase 1 — Foundation [IN PROGRESS]
- [x] Canvas setup
- [x] Game loop (engine.js)
- [x] Input handling (input.js)
- [x] Base rendering (rendering.js)

## Phase 2 — Core Gameplay
- [ ] Tank movement (tanks.js)
- [ ] Rotation system
- [ ] Shooting (bullets.js)
- [ ] Bullet physics
- [ ] Collision handling (collision.js, physics.js)

## Phase 3 — Combat Polish
- [ ] Health system
- [ ] Respawning
- [ ] Score tracking
- [ ] Win conditions

## Phase 4 — Visual Polish
- [ ] Particles (particles.js)
- [ ] Trails
- [ ] Recoil
- [ ] Explosions
- [ ] Screen shake

## Phase 5 — Systems Expansion
- [ ] Power-ups (powerups.js)
- [ ] Audio system (audio.js)
- [ ] Better UI (ui.js)
- [ ] Match transitions

## Phase 6 — Optimization
- [ ] Debugging
- [ ] Performance cleanup
- [ ] Code refactor
- [ ] Final balancing
