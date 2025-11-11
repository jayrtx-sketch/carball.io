const Matter = require("matter-js");

module.exports = class SoccerBall {
    constructor(x, y) {
        // Optimized ball physics for satisfying gameplay
        this.body = Matter.Bodies.circle(x, y, 50, {
            mass: 6,
            restitution: 0.98, // High bounciness but not perfect
            friction: 0.005, // Minimal friction for smooth rolling
            frictionAir: 0.012, // Less air friction for faster ball movement
            inertia: Infinity, // Prevents rotation affecting physics
            density: 0.0012,
            slop: 0.05
        });

        this.scored = false;
        this.lastTouchTeam = null;
        this.lastTouchPlayer = null;
    }

    score() {
        
    }

    reset() {
    }

    get x() {
        return this.body.position.x;
    }

    set x(v) {
        Matter.Body.setPosition(this.body, { x: v, y: this.y });
    }

    get y() {
        return this.body.position.y;
    }

    set y(v) {
        Matter.Body.setPosition(this.body, { x: this.x, y: v });
    }

    get radius() {
        return this.body.circleRadius;
    }

    updatePosition() {
        // Apply max speed limit for ball
        const config = require("../config");
        let currentSpeed = Matter.Body.getSpeed(this.body);
        
        if (currentSpeed > config.MAX_BALL_SPEED) {
            Matter.Body.setSpeed(this.body, config.MAX_BALL_SPEED);
        }
        
        // Add slight velocity damping for more control
        if (currentSpeed > 0.1) {
            Matter.Body.setVelocity(this.body, {
                x: this.body.velocity.x * 0.995,
                y: this.body.velocity.y * 0.995
            });
        }
    }

    exportJSON() {
        return { x: Math.round(this.body.position.x), y: Math.round(this.body.position.y), angle: Math.round(this.body.angle*100)/100 }
    };
}