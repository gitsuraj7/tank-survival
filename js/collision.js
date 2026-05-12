class Collision {
    static rectRect(r1, r2) {
        return r1.x < r2.x + r2.w &&
               r1.x + r1.w > r2.x &&
               r1.y < r2.y + r2.h &&
               r1.y + r1.h > r2.y;
    }

    static circleRect(circle, rect) {
        const radius = circle.radius ?? circle.r ?? 4;
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (radius * radius);
    }

    static pointRect(px, py, r) {
        return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }
}
