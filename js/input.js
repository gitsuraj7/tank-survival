class InputHandler {
    constructor() {
        this.keys = {};
        this.joystickVector = { x: 0, y: 0 }; // Added for continuous control
        
        this.settings = {
            fixedJoystick: localStorage.getItem("fixedJoystick") !== "false", 
            joystickRadius: 60,
            deadzone: 0.15 // Normalized deadzone (0-1)
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
            this.joystickVector = { x: 0, y: 0 };
        });
    }

    initTouch() {
        const zone = document.getElementById("joystickZone");
        const stick = document.getElementById("joystickStick");
        const fireBtn = document.getElementById("mobileFireBtn");

        if (!zone) return;

        let startX = 0, startY = 0;

        const handleStart = (e) => {
            const touch = e.touches[0];
            const rect = zone.getBoundingClientRect();
            
            if (this.settings.fixedJoystick) {
                startX = rect.left + rect.width / 2;
                startY = rect.top + rect.height / 2;
            } else {
                startX = touch.clientX;
                startY = touch.clientY;
            }
            
            handleMove(e);
            e.preventDefault();
        };

        const handleMove = (e) => {
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const maxDist = this.settings.joystickRadius;
            const normalizedDist = Math.min(dist / maxDist, 1.0);
            const angle = Math.atan2(dy, dx);
            
            // Update vector (x = turn, y = forward)
            if (normalizedDist > this.settings.deadzone) {
                this.joystickVector.x = Math.cos(angle) * normalizedDist;
                this.joystickVector.y = -Math.sin(angle) * normalizedDist; // Invert Y for forward
            } else {
                this.joystickVector.x = 0;
                this.joystickVector.y = 0;
            }

            // Visual update
            if (stick) {
                stick.style.transition = "none";
                const visualX = Math.cos(angle) * normalizedDist * maxDist;
                const visualY = Math.sin(angle) * normalizedDist * maxDist;
                stick.style.transform = `translate(${visualX}px, ${visualY}px)`;
            }
            e.preventDefault();
        };

        const handleEnd = () => {
            this.joystickVector = { x: 0, y: 0 };
            if (stick) {
                stick.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                stick.style.transform = `translate(0, 0)`;
            }
        };

        zone.addEventListener("touchstart", handleStart, { passive: false });
        window.addEventListener("touchmove", (e) => {
            if (e.touches.length > 0 && e.target.closest("#joystickZone")) {
                handleMove(e);
            }
        }, { passive: false });
        window.addEventListener("touchend", handleEnd);

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

    isPressed(code) {
        return !!this.keys[code];
    }

    getMovement() {
        // Combine keyboard and joystick
        let forward = 0;
        let turn = 0;

        if (this.keys["ArrowUp"] || this.keys["KeyW"]) forward += 1;
        if (this.keys["ArrowDown"] || this.keys["KeyS"]) forward -= 1;
        if (this.keys["ArrowLeft"] || this.keys["KeyA"]) turn -= 1;
        if (this.keys["ArrowRight"] || this.keys["KeyD"]) turn += 1;

        // Use joystick if active (prioritize or blend)
        if (Math.abs(this.joystickVector.y) > 0.1) forward = this.joystickVector.y;
        
        // For turn, we map X to the rotate amount. 
        // Note: joystickVector.x is turn, but our tank rotation logic expects -1 to 1.
        if (Math.abs(this.joystickVector.x) > 0.1) turn = this.joystickVector.x;

        return { forward, turn };
    }
}
