const Matter = require("matter-js");

module.exports = class GameWorld {
    constructor(width = 3000, height = 1500) {
        this.width = width;
        this.height = height;
        
        // Create optimized Matter.js engine
        this.engine = Matter.Engine.create({
            enableSleeping: false, // Disable sleeping for consistent performance
            positionIterations: 8, // Increased for better collision accuracy
            velocityIterations: 6, // Increased for better velocity resolution
            constraintIterations: 2,
            timing: {
                timeScale: 1
            }
        });
        
        // No gravity for top-down gameplay
        this.engine.world.gravity.y = 0;
        this.engine.world.gravity.x = 0;

        // Create borders with better bounce properties
        const borderOptions = { 
            isStatic: true, 
            restitution: 0.8, // Some bounce off walls
            friction: 0.1,
            slop: 0.05
        };
        
        let borderTop = Matter.Bodies.rectangle(width / 2, -25, width + 100, 50, borderOptions);
        let borderBottom = Matter.Bodies.rectangle(width / 2, height + 25, width + 100, 50, borderOptions);
        let borderLeft = Matter.Bodies.rectangle(-25, height / 2, 50, height + 100, borderOptions);
        let borderRight = Matter.Bodies.rectangle(width + 25, height / 2, 50, height + 100, borderOptions);
        
        Matter.Composite.add(this.engine.world, [borderTop, borderBottom, borderLeft, borderRight]);
    }

    isOutOfBoundsX(x, halfSize) {
        return x - halfSize < 0 || x + halfSize > this.width;
    }

    isOutOfBoundsY(y, halfSize) {
        return y - halfSize < 0 || y + halfSize > this.height;
    }
}