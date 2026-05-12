class MobileInputController {
    constructor(game) {
        this.game = game;

        // DEVICE DETECTION
        this.active =
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0;

        // INPUT STATE
        this.movementVector = { x: 0, y: 0 };
        this.smoothedVector = { x: 0, y: 0 };
        this.isFiring = false;

        // TOUCH TRACKING
        this.moveTouchId = null;
        this.fireTouchId = null;

        // PERFORMANCE
        this.lastUpdateTime = performance.now();

        // JOYSTICK CONFIG
        this.joystick = {
            active: false,

            baseX: 0,
            baseY: 0,

            stickX: 0,
            stickY: 0,

            radius: 75,
            deadzone: 18,
            maxDistance: 75,

            smoothing: 0.18,

            dynamicMode: false,
        };

        // DOM REFERENCES
        this.zone = document.getElementById('joystickZone');
        this.stick = document.getElementById('joystickStick');
        this.fireBtn = document.getElementById('mobileFireBtn');

        // DEBUG
        this.debugEnabled = true;

        // SAFE AREA PADDING
        this.safePadding = 24;

        // MULTITOUCH CACHE
        this.activeTouches = new Map();

        if (this.active) {
            this.init();
        }
    }

    init() {
        if (!this.zone) return;

        // IMPROVE TOUCH PERFORMANCE
        document.body.style.touchAction = 'none';

        // MOVEMENT
        this.zone.addEventListener(
            'touchstart',
            (e) => this.handleMoveStart(e),
            { passive: false }
        );

        window.addEventListener(
            'touchmove',
            (e) => this.handleMoveUpdate(e),
            { passive: false }
        );

        window.addEventListener(
            'touchend',
            (e) => this.handleMoveEnd(e)
        );

        window.addEventListener(
            'touchcancel',
            (e) => this.handleMoveEnd(e)
        );

        // FIRE
        if (this.fireBtn) {
            this.fireBtn.addEventListener(
                'touchstart',
                (e) => this.handleFireStart(e),
                { passive: false }
            );

            this.fireBtn.addEventListener(
                'touchend',
                (e) => this.handleFireEnd(e)
            );

            this.fireBtn.addEventListener(
                'touchcancel',
                (e) => this.handleFireEnd(e)
            );
        }

        // TAB SWITCH RECOVERY
        window.addEventListener('blur', () => {
            this.resetAllInputs();
        });
    }

    // =========================
    // MOVEMENT INPUT
    // =========================

    handleMoveStart(e) {
        if (this.moveTouchId !== null) return;

        const touch = e.changedTouches[0];
        const rect = this.zone.getBoundingClientRect();

        this.moveTouchId = touch.identifier;
        this.joystick.active = true;

        // FIXED BASE MODE
        if (!this.joystick.dynamicMode) {
            this.joystick.baseX = rect.left + rect.width * 0.5;
            this.joystick.baseY = rect.top + rect.height * 0.5;
        }
        // DYNAMIC BASE MODE
        else {
            this.joystick.baseX = touch.clientX;
            this.joystick.baseY = touch.clientY;
        }

        this.processMove(touch);

        e.preventDefault();
    }

    handleMoveUpdate(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];

            if (touch.identifier === this.moveTouchId) {
                this.processMove(touch);
                e.preventDefault();
                break;
            }
        }
    }

    processMove(touch) {
        let dx = touch.clientX - this.joystick.baseX;
        let dy = touch.clientY - this.joystick.baseY;

        const distance = Math.hypot(dx, dy);

        // PREVENT EXTREME STRETCHING
        const clampedDistance = Math.min(
            distance,
            this.joystick.maxDistance
        );

        const angle = Math.atan2(dy, dx);

        // CLAMP JOYSTICK STICK
        this.joystick.stickX =
            Math.cos(angle) * clampedDistance;

        this.joystick.stickY =
            Math.sin(angle) * clampedDistance;

        // DEADZONE HANDLING
        if (distance < this.joystick.deadzone) {
            this.movementVector.x = 0;
            this.movementVector.y = 0;
        } else {
            const normalizedDistance =
                clampedDistance / this.joystick.maxDistance;

            this.movementVector.x =
                Math.cos(angle) * normalizedDistance;

            this.movementVector.y =
                Math.sin(angle) * normalizedDistance;
        }

        // ANALOG SMOOTHING
        this.smoothedVector.x +=
            (this.movementVector.x - this.smoothedVector.x) *
            this.joystick.smoothing;

        this.smoothedVector.y +=
            (this.movementVector.y - this.smoothedVector.y) *
            this.joystick.smoothing;

        // VISUAL UPDATE
        this.updateJoystickVisuals();
    }

    handleMoveEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];

            if (touch.identifier === this.moveTouchId) {
                this.moveTouchId = null;

                this.joystick.active = false;

                this.movementVector.x = 0;
                this.movementVector.y = 0;

                this.smoothedVector.x = 0;
                this.smoothedVector.y = 0;

                this.resetStick();

                break;
            }
        }
    }

    // =========================
    // FIRE INPUT
    // =========================

    handleFireStart(e) {
        const touch = e.changedTouches[0];

        if (this.fireTouchId !== null) return;

        this.fireTouchId = touch.identifier;
        this.isFiring = true;

        if (this.fireBtn) {
            this.fireBtn.style.transform = 'scale(0.88)';
            this.fireBtn.style.opacity = '1';
        }

        e.preventDefault();
    }

    handleFireEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];

            if (touch.identifier === this.fireTouchId) {
                this.fireTouchId = null;
                this.isFiring = false;

                if (this.fireBtn) {
                    this.fireBtn.style.transform = 'scale(1)';
                    this.fireBtn.style.opacity = '0.85';
                }

                break;
            }
        }
    }

    // =========================
    // VISUALS
    // =========================

    updateJoystickVisuals() {
        if (!this.stick) return;

        this.stick.style.transition = 'none';

        this.stick.style.transform = `translate(${this.joystick.stickX}px, ${this.joystick.stickY}px)`;

        this.stick.style.opacity = '1';
    }

    resetStick() {
        if (!this.stick) return;

        this.joystick.stickX = 0;
        this.joystick.stickY = 0;

        this.stick.style.transition =
            'transform 0.14s ease-out, opacity 0.2s';

        this.stick.style.transform = 'translate(0px, 0px)';

        this.stick.style.opacity = '0.45';
    }

    // =========================
    // MAIN UPDATE
    // =========================

    update(player, deltaTime) {
        if (!player) return;

        // DIRECT ANALOG MOVEMENT
        player.inputX = this.smoothedVector.x;
        player.inputY = this.smoothedVector.y;

        // SHOOTING
        player.isFiring = this.isFiring;
    }

    // =========================
    // RESET
    // =========================

    resetAllInputs() {
        this.moveTouchId = null;
        this.fireTouchId = null;

        this.isFiring = false;

        this.movementVector.x = 0;
        this.movementVector.y = 0;

        this.smoothedVector.x = 0;
        this.smoothedVector.y = 0;

        this.joystick.active = false;

        this.resetStick();
    }

    // =========================
    // DEBUG RENDER
    // =========================

    renderDebug(ctx) {
        if (!this.debugEnabled) return;

        ctx.save();
        ctx.resetTransform();

        const x = 20;
        const y = ctx.canvas.height - 180;

        ctx.fillStyle = 'rgba(0,255,120,0.9)';
        ctx.font = '12px monospace';

        ctx.fillText('MOBILE INPUT DEBUG', x, y);

        ctx.fillText(
            `RAW: ${this.movementVector.x.toFixed(2)} ${this.movementVector.y.toFixed(2)}`,
            x,
            y + 18
        );

        ctx.fillText(
            `SMOOTH: ${this.smoothedVector.x.toFixed(2)} ${this.smoothedVector.y.toFixed(2)}`,
            x,
            y + 36
        );

        ctx.fillText(
            `MOVE ID: ${this.moveTouchId}`,
            x,
            y + 54
        );

        ctx.fillText(
            `FIRE: ${this.isFiring}`,
            x,
            y + 72
        );

        // VECTOR VISUALIZATION
        ctx.strokeStyle = 'rgba(0,255,120,0.7)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(x + 60, y + 120, 42, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 60, y + 120);

        ctx.lineTo(
            x + 60 + this.smoothedVector.x * 42,
            y + 120 + this.smoothedVector.y * 42
        );

        ctx.stroke();

        ctx.restore();
    }
}
