class MobileInputController {
    constructor(game) {
        this.game = game;
        this.active = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // State
        this.movementVector = { x: 0, y: 0 };
        this.isFiring = false;
        
        // Touch Tracking
        this.moveTouchId = null;
        this.fireTouchId = null;
        
        // Joystick Geometry
        this.joystick = {
            baseX: 0,
            baseY: 0,
            stickX: 0,
            stickY: 0,
            radius: 70,
            deadzone: 15,
            active: false
        };

        // DOM Elements (Existing)
        this.zone = document.getElementById("joystickZone");
        this.stick = document.getElementById("joystickStick");
        this.fireBtn = document.getElementById("mobileFireBtn");
        
        // Settings
        this.fixedMode = localStorage.getItem("fixedJoystick") !== "false";
        this.debugEnabled = true; // Enabled by default for this task

        if (this.active) {
            this.init();
        }
    }

    init() {
        if (!this.zone) return;

        // Touch Listeners
        this.zone.addEventListener("touchstart", (e) => this.handleMoveStart(e), { passive: false });
        window.addEventListener("touchmove", (e) => this.handleMoveUpdate(e), { passive: false });
        window.addEventListener("touchend", (e) => this.handleMoveEnd(e));
        window.addEventListener("touchcancel", (e) => this.handleMoveEnd(e));

        if (this.fireBtn) {
            this.fireBtn.addEventListener("touchstart", (e) => this.handleFireStart(e), { passive: false });
            this.fireBtn.addEventListener("touchend", (e) => this.handleFireEnd(e));
            this.fireBtn.addEventListener("touchcancel", (e) => this.handleFireEnd(e));
        }
        
        console.log("MobileInput: Initialized with Multitouch Support");
    }

    handleMoveStart(e) {
        if (this.moveTouchId !== null) return; // Already moving

        const touch = e.changedTouches[0];
        const rect = this.zone.getBoundingClientRect();
        
        this.moveTouchId = touch.identifier;
        this.joystick.active = true;

        if (this.fixedMode) {
            this.joystick.baseX = rect.left + rect.width / 2;
            this.joystick.baseY = rect.top + rect.height / 2;
        } else {
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
        const dx = touch.clientX - this.joystick.baseX;
        const dy = touch.clientY - this.joystick.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const clampedDist = Math.min(dist, this.joystick.radius);
        
        this.joystick.stickX = Math.cos(angle) * clampedDist;
        this.joystick.stickY = Math.sin(angle) * clampedDist;

        // Vector Generation (Normalized -1 to 1)
        if (dist > this.joystick.deadzone) {
            this.movementVector.x = Math.cos(angle) * (clampedDist / this.joystick.radius);
            this.movementVector.y = -Math.sin(angle) * (clampedDist / this.joystick.radius); // Invert Y for forward
        } else {
            this.movementVector.x = 0;
            this.movementVector.y = 0;
        }

        // DOM Update (Visual Feedback)
        if (this.stick) {
            this.stick.style.transition = "none";
            this.stick.style.transform = `translate(${this.joystick.stickX}px, ${this.joystick.stickY}px)`;
            this.stick.style.opacity = "1";
        }
    }

    handleMoveEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.moveTouchId) {
                this.moveTouchId = null;
                this.joystick.active = false;
                this.joystick.stickX = 0;
                this.joystick.stickY = 0;
                this.movementVector = { x: 0, y: 0 };
                
                if (this.stick) {
                    this.stick.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s";
                    this.stick.style.transform = `translate(0, 0)`;
                    this.stick.style.opacity = "0.5";
                }
                break;
            }
        }
    }

    handleFireStart(e) {
        const touch = e.changedTouches[0];
        if (this.fireTouchId === null) {
            this.fireTouchId = touch.identifier;
            this.isFiring = true;
            if (this.fireBtn) this.fireBtn.style.transform = "scale(0.9)";
        }
        e.preventDefault();
    }

    handleFireEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.fireTouchId) {
                this.fireTouchId = null;
                this.isFiring = false;
                if (this.fireBtn) this.fireBtn.style.transform = "scale(1.0)";
                break;
            }
        }
    }

    renderDebug(ctx) {
        if (!this.debugEnabled || !this.joystick.active) return;

        ctx.save();
        ctx.resetTransform(); // Draw in screen space if possible, but game space is fine for alignment
        
        // Scale to arena space if needed, but here we assume ctx is arena space
        // Let's use simple HUD-style coordinates if we can
        
        const bX = this.joystick.baseX; // Note: these are screen coords, might need conversion
        const bY = this.joystick.baseY;

        // Draw on game overlay (absolute bottom left)
        const debugX = 20;
        const debugY = ctx.canvas.height - 150;
        
        ctx.fillStyle = "rgba(0, 255, 65, 0.7)";
        ctx.font = "12px monospace";
        ctx.fillText(`MOBILE INPUT DEBUG`, debugX, debugY);
        ctx.fillText(`MVMT: X:${this.movementVector.x.toFixed(2)} Y:${this.movementVector.y.toFixed(2)}`, debugX, debugY + 15);
        ctx.fillText(`TID: MVMT:${this.moveTouchId} FIRE:${this.fireTouchId}`, debugX, debugY + 30);
        ctx.fillText(`JOY: ACT:${this.joystick.active} MODE:${this.fixedMode ? 'FIXED' : 'DYN'}`, debugX, debugY + 45);

        // Visual Vector
        ctx.strokeStyle = "rgba(0, 255, 65, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(debugX + 50, debugY + 80, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(debugX + 50, debugY + 80);
        ctx.lineTo(debugX + 50 + this.movementVector.x * 40, debugY + 80 - this.movementVector.y * 40);
        ctx.stroke();
        
        ctx.restore();
    }
}
