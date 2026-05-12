class Physics {
    static applyVelocity(entity, deltaTime) {
        const dt = deltaTime / 16.67;
        entity.x += Math.cos(entity.angle) * entity.velocity * dt;
        entity.y += Math.sin(entity.angle) * entity.velocity * dt;
    }

    static applyFriction(entity, deltaTime) {
        const dt = deltaTime / 16.67;
        entity.velocity *= Math.pow(CONFIG.FRICTION, dt);
        if (Math.abs(entity.velocity) < 0.1) entity.velocity = 0;
    }

    static checkBounds(entity, width, height, padding = 20) {
        let hit = false;
        if (entity.x < padding) { entity.x = padding; hit = true; }
        if (entity.x > width - padding) { entity.x = width - padding; hit = true; }
        if (entity.y < padding) { entity.y = padding; hit = true; }
        if (entity.y > height - padding) { entity.y = height - padding; hit = true; }
        return hit;
    }
}
