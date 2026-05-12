class InputHandler {
    constructor() {
        this.keys = {};
        this.touchData = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            angle: 0,
            force: 0
        };

        this.settings = {
            fixedJoystick: localStorage.getItem("fixedJoystick") !== "false", // Default true
            joystickRadius: 60,
            deadzone: 10
        };

        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        this.initKeyboard();
        if (this.isTouchDevice) {
            this.initTouch();
        } else {
            const mobileUI = document.getElementById("mobileControls");
            if (mobileUI) mobileUI.style.display = "none";
        }
        this.initFocusHandling();
    }

    initKeyboard() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
            const gameKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "Enter"];
            if (gameKeys.includes(e.code)) e.preventDefault();
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });
    }

    initFocusHandling() {
        window.addEventListener("blur", () => {
            this.keys = {};
        });
    }

    initTouch() {
        const zone = document.getElementById("joystickZone");
        const stick = document.getElementById("joystickStick");
        const fireBtn = document.getElementById("mobileFireBtn");

        if (!zone) return;

        zone.addEventListener("touchstart", (e) => {
            const touch = e.touches[0];
            const rect = zone.getBoundingClientRect();
            
            this.touchData.active = true;
            
            if (this.settings.fixedJoystick) {
                this.touchData.startX = rect.left + rect.width / 2;
                this.touchData.startY = rect.top + rect.height / 2;
            } else {
                // Dynamic joystick position (not implemented yet, but keeping startX/Y as touch start)
                this.touchData.startX = touch.clientX;
                this.touchData.startY = touch.clientY;
            }
            
            this.handleTouchMove(touch);
            e.preventDefault();
        }, { passive: false });

        window.addEventListener("touchmove", (e) => {
            if (this.touchData.active) {
                this.handleTouchMove(e.touches[0]);
                e.preventDefault();
            }
        }, { passive: false });

        window.addEventListener("touchend", () => {
            this.touchData.active = false;
            if (stick) {
                stick.style.transition = "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                stick.style.transform = `translate(0, 0)`;
            }
            
            // Clear virtual keys
            this.keys["ArrowUp"] = false;
            this.keys["ArrowDown"] = false;
            this.keys["ArrowLeft"] = false;
            this.keys["ArrowRight"] = false;
        });

        if (fireBtn) {
            fireBtn.addEventListener("touchstart", (e) => {
                this.keys["Space"] = true;
                e.preventDefault();
            }, { passive: false });
            fireBtn.addEventListener("touchend", () => {
                this.keys["Space"] = false;
            });
        }
    }

    handleTouchMove(touch) {
        const stick = document.getElementById("joystickStick");
        const dx = touch.clientX - this.touchData.startX;
        const dy = touch.clientY - this.touchData.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const maxDist = this.settings.joystickRadius;
        const limitedDist = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);
        
        this.touchData.angle = angle;
        this.touchData.force = limitedDist / maxDist;

        if (stick) {
            stick.style.transition = "none";
            const moveX = Math.cos(angle) * limitedDist;
            const moveY = Math.sin(angle) * limitedDist;
            stick.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }

        // Map to virtual keys with deadzone
        this.keys["ArrowUp"] = false;
        this.keys["ArrowDown"] = false;
        this.keys["ArrowLeft"] = false;
        this.keys["ArrowRight"] = false;

        if (dist > this.settings.deadzone) {
            if (Math.abs(angle) < Math.PI * 0.4) this.keys["ArrowRight"] = true;
            if (Math.abs(angle) > Math.PI * 0.6) this.keys["ArrowLeft"] = true;
            if (angle > -Math.PI * 0.8 && angle < -Math.PI * 0.2) this.keys["ArrowUp"] = true;
            if (angle > Math.PI * 0.2 && angle < Math.PI * 0.8) this.keys["ArrowDown"] = true;
        }
    }

    isPressed(code) {
        return !!this.keys[code];
    }
}
