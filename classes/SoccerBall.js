const Matter = require("matter-js");

module.exports = class SoccerBall {
    constructor(x, y) {
        this.body = Matter.Bodies.circle(x, y, 50, {
            mass: 6,
            restitution: 0.8, // Slightly reduced for more controlled bounces
            friction: 0.1, // Friction with ground
            frictionAir: 0.01, // Very low air friction for smooth rolling
            inertia: Infinity // Prevent rotation for more predictable physics
        });

        this.scored = false;
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
        // Cap max speed for better gameplay
        let maxspeed = 35; // Increased max speed slightly
        if (Matter.Body.getSpeed(this.body) > maxspeed) {
            Matter.Body.setSpeed(this.body, maxspeed)
        }
        
        // Prevent ball from rotating (keep it rolling smoothly)
        Matter.Body.setAngularVelocity(this.body, 0);
    }

    exportJSON() {
        return { x: Math.round(this.body.position.x), y: Math.round(this.body.position.y), angle: Math.round(this.body.angle*100)/100 }
    };
}