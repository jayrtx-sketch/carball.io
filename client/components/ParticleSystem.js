import * as PIXI from 'pixi.js';

/**
 * High-performance particle system for visual effects
 * Uses object pooling to avoid garbage collection
 */
export default class ParticleSystem {
    constructor(app, maxParticles = 500) {
        this.app = app;
        this.maxParticles = maxParticles;
        this.particles = [];
        this.activeParticles = [];
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        
        // Pre-create particle pool
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = new PIXI.Graphics();
            particle.active = false;
            particle.life = 0;
            particle.maxLife = 1;
            particle.vx = 0;
            particle.vy = 0;
            this.particles.push(particle);
            this.container.addChild(particle);
        }
    }

    /**
     * Emit boost particles
     */
    emitBoost(x, y, angle, color = 0xFFAA00) {
        const count = 3;
        for (let i = 0; i < count; i++) {
            this.createParticle({
                x: x - Math.cos(angle) * 80,
                y: y - Math.sin(angle) * 80,
                vx: -Math.cos(angle) * 5 + (Math.random() - 0.5) * 3,
                vy: -Math.sin(angle) * 5 + (Math.random() - 0.5) * 3,
                size: 8 + Math.random() * 8,
                color: color,
                life: 0.3 + Math.random() * 0.3
            });
        }
    }

    /**
     * Emit impact particles when hitting ball
     */
    emitImpact(x, y, intensity = 1) {
        const count = Math.floor(5 * intensity);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4 * intensity;
            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 6,
                color: 0xFFFFFF,
                life: 0.4 + Math.random() * 0.4
            });
        }
    }

    /**
     * Emit goal celebration particles
     */
    emitGoal(x, y, teamColor) {
        const count = 30;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 6 + Math.random() * 12,
                color: teamColor,
                life: 1 + Math.random() * 1
            });
        }
    }

    createParticle(config) {
        // Find inactive particle from pool
        const particle = this.particles.find(p => !p.active);
        if (!particle) return;

        particle.active = true;
        particle.x = config.x;
        particle.y = config.y;
        particle.vx = config.vx;
        particle.vy = config.vy;
        particle.life = 0;
        particle.maxLife = config.life;
        particle.size = config.size;
        particle.color = config.color;
        particle.alpha = 1;

        // Draw particle
        particle.clear();
        particle.beginFill(config.color);
        particle.drawCircle(0, 0, config.size);
        particle.endFill();

        this.activeParticles.push(particle);
    }

    update(delta) {
        const dt = delta / 60; // Normalize to 60fps
        
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply drag
            particle.vx *= 0.96;
            particle.vy *= 0.96;
            
            // Update life
            particle.life += dt;
            const lifeRatio = particle.life / particle.maxLife;
            
            // Fade out
            particle.alpha = 1 - lifeRatio;
            particle.scale.set(1 - lifeRatio * 0.5);
            
            // Remove if dead
            if (particle.life >= particle.maxLife) {
                particle.active = false;
                particle.alpha = 0;
                this.activeParticles.splice(i, 1);
            }
        }
    }

    destroy() {
        this.app.stage.removeChild(this.container);
        this.container.destroy();
    }
}
