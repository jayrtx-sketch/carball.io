const Matter = require("matter-js");
const config = require("../config");

//i just threw this here u should move it somewhere else
function mod(n, m) {
    return ((n % m) + m) % m;
}

module.exports = class Player {
    constructor(id, team) {
        this.id = id;
        this.movement = { "up": false, "down": false, "left": false, "right": false, angle: undefined };
        this.body = Matter.Bodies.rectangle(100, 100, 160, 90, {
            mass: 5,
            restitution: 0.3, // Reduced for more controlled bounces
            friction: 0.1, // Friction with other objects
            frictionAir: 0.05, // Reduced air friction for better responsiveness
            frictionStatic: 0.3 // Static friction
        });
        // Increase inertia for more realistic car physics
        Matter.Body.setInertia(this.body, 100000);
        this.name = "VROOM";
        this.speed = 0.3; // Slightly increased base speed
        this.team = team;

        this.boostFuel = 240;
        this.boosting = false;
    }
    boost() {
        this.boosting = true;
    }
    setPos(x, y, angle) {
        Matter.Body.setPosition(this.body, { x: x, y: y });
        Matter.Body.setAngle(this.body, angle);
    }
    updateRotation(torque) {
        let dirTo = mod(this.movement.angle, 360);
        let dir = mod(this.body.angle * 180 / Math.PI, 360);

        //if close just snap
        //if (Math.abs(mod((dirTo - dir + 180), 360) - 180) < 2.5) {
        //    this.body.angle = dirTo * Math.PI / 180;
        //    this.torque = 0;
        //    return;
        //}

        if (dir != dirTo) {
            let neg = 1;
            let pos = mod(dirTo - dir + 180, 360);
            neg = Math.sign(mod((dirTo - dir + 180), 360) - 180);

            //this.angle.value += neg * x;
            //this.angle.value = util.mod(this.angle.value, 360);

            this.body.torque = neg * torque * Math.PI / 180;
        }
    }
    updatePosition() {
        let body = this.body;
        const torque = 500; // Increased torque for snappier turning

        if(typeof this.movement.angle == "number")
            this.updateRotation(torque);

        let speed = this.speed;
        if (this.boosting) {
            if (this.boostFuel < 0)
                this.boosting = false;

            speed *= config.BOOST_STRENGTH;
            this.boostFuel -= 4;
        } else {
            if (this.boostFuel < 240)
                this.boostFuel += 1.5; // Slightly faster boost recharge
        }

        if (this.movement.up) {
            let vector = {
                x: speed * Math.cos(body.angle),
                y: speed * Math.sin(body.angle)
            };
            Matter.Body.applyForce(body, body.position, vector);
        }

        if (!this.movement.angle) {
            if (this.movement.down) {
                let vector = {
                    x: -this.speed * 0.6 * Math.cos(body.angle), // Reverse is slower
                    y: -this.speed * 0.6 * Math.sin(body.angle)
                };
                Matter.Body.applyForce(body, body.position, vector);
            }

            if (this.movement.left) {
                body.torque = -torque * Math.PI / 180;
            }

            if (this.movement.right) {
                body.torque = torque * Math.PI / 180;
            }
        }

        // Improved angular damping for smoother rotation
        let angularVelocity = Matter.Body.getAngularVelocity(this.body) * 0.88;
        Matter.Body.setAngularVelocity(this.body, angularVelocity);
        
        // Cap max speed for better control
        const maxSpeed = 25;
        const currentSpeed = Matter.Body.getSpeed(this.body);
        if (currentSpeed > maxSpeed) {
            const velocity = Matter.Body.getVelocity(this.body);
            const scale = maxSpeed / currentSpeed;
            Matter.Body.setVelocity(this.body, {
                x: velocity.x * scale,
                y: velocity.y * scale
            });
        }
    }

    exportJSON() {
        return {
            name: this.name,
            team: this.team,
            x: Math.round(this.body.position.x),
            y: Math.round(this.body.position.y),
            angle: Math.round(this.body.angle * 100) / 100,
            boost: this.boostFuel
        }
    }
}