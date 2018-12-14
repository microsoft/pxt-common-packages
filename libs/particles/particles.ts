/**
 * Small particles
 */
//% color="#03AA74" weight=78 icon="\uf021"
//% groups='["Create", "Properties"]'
namespace particles {
    const TIME_PRECISION = 10; // time goes down to down to the 1<<10 seconds

    let lastUpdate: number;
    let sources: ParticleSource[];
    let defaultFactory: ParticleFactory;

    /**
     * A single particle
     */
    export class Particle {
        _x: Fx8;
        _y: Fx8;
        vx: Fx8;
        vy: Fx8;
        lifespan: number;
        data: number;
        next: Particle;
    }

    /**
     * An anchor for a Particle to originate from
     */
    export interface ParticleAnchor {
        x: number;
        y: number;
    }

    /**
     * A factory for generating particles.
     */
    export class ParticleFactory {
        constructor() {
            // Compiler errors if this doesn't exist
        }

        /**
         * Generate a particle at the position of the given anchor
         * @param anchor 
         */
        createParticle(anchor: ParticleAnchor): Particle {
            const p = new Particle();

            p._x = Fx8(anchor.x);
            p._y = Fx8(anchor.y);
            p.vx = Fx.zeroFx8;
            p.vy = Fx.zeroFx8;
            p.lifespan = 1500;

            return p;
        }

        /**
         * Draw the given particle at the given location
         * @param particle 
         * @param x 
         * @param y 
         */
        drawParticle(particle: Particle, x: Fx8, y: Fx8) {
            screen.setPixel(Fx.toInt(x), Fx.toInt(y), 1);
        }
    }

    /**
     * A source of particles
     */
    export class ParticleSource implements SpriteLike {
        anchor: ParticleAnchor;
        z: number;
        id: number;
        _dt: number;
        
        protected _enabled: boolean;
        protected head: Particle;
        protected timer: number;
        protected period: number;
        protected factory: ParticleFactory;
        
        protected ax: Fx8;
        protected ay: Fx8;

        /**
         * @param anchor to emit particles from
         * @param particlesPerSecond rate at which particles are emitted
         * @param factory [optional] factory to generate particles with; otherwise, 
         */
        constructor(anchor: ParticleAnchor, particlesPerSecond: number, factory?: ParticleFactory) {
            init();
            this.setRate(particlesPerSecond);
            this.setAcceleration(0, 0);
            this.setAnchor(anchor);
            this._dt = 0;
            this.z = -1;

            if (!defaultFactory)
                defaultFactory = new ParticleFactory();
            this.setFactory(factory ? factory : defaultFactory);

            sources.push(this);
            game.currentScene().addSprite(this);

            this.enabled = true;
        }

        __serialize(offset: number): Buffer {
            return undefined;
        }

        __update(camera: scene.Camera, dt: number) {
            // see _update()
        }

        __draw(camera: scene.Camera) {
            let current = this.head;
            const left = Fx8(camera.offsetX);
            const top = Fx8(camera.offsetY);

            while (current) {
                if (current.lifespan > 0)
                    this.drawParticle(current, left, top);
                current = current.next;
            }
        }

        _update(dt: number) {
            this.timer -= dt;
            while (this.timer < 0 && this._enabled) {
                this.timer += this.period;
                const p = this.factory.createParticle(this.anchor);
                p.next = this.head;
                this.head = p;
            }

            if (!this.head) return;

            let current = this.head;

            this._dt += dt;

            let fixedDt = Fx8(this._dt);
            if (fixedDt) {
                do {
                    if (current.lifespan > 0) {
                        current.lifespan -= dt;
                        this.updateParticle(current, fixedDt)
                    }
                } while (current = current.next);
                this._dt = 0;
            } else {
                do {
                    current.lifespan -= dt;
                } while (current = current.next);
            }
        }

        _prune() {
            while (this.head && this.head.lifespan <= 0) {
                this.head = this.head.next;
            }

            let current = this.head;
            while (current && current.next) {
                if (current.next.lifespan <= 0) {
                    current.next = current.next.next;
                } else {
                    current = current.next;
                }
            }
        }

        /**
         * Sets the acceleration applied to the particles
         */
        //% blockId=particlessetacc block="particles %source set acceleration ax $ax ay $ay"
        //% group="Properties"
        setAcceleration(ax: number, ay: number) {
            this.ax = Fx8(ax);
            this.ay = Fx8(ay);
        }

        /**
         * Enables or disables particles
         * @param on 
         */
        //% blockId=particlessetenabled block="particles %source %on=toggleOnOff"
        //% group="Properties"
        setEnabled(on: boolean) {
            this.enabled = on;
        }

        get enabled() {
            return this._enabled;
        }

        /**
         * Set whether this source is currently enabled (emitting particles) or not
         */
        set enabled(v: boolean) {
            if (v !== this._enabled) {
                this._enabled = v;
                this.timer = 0;
            }
        }

        /**
         * Destroy the source
         */
        destroy() {
            sources.removeElement(this);
            game.currentScene().allSprites.removeElement(this);
        }

        /**
         * Set a anchor for particles to be emitted from
         * @param anchor 
         */
        setAnchor(anchor: ParticleAnchor) {
            this.anchor = anchor;
        }

        /**
         * Sets the number of particle created per second
         * @param particlesPerSecond 
         */
        //% blockId=particlessetrate block="particles %source set rate to $particlesPerSecond"
        //% group="Properties"
        setRate(particlesPerSecond: number) {
            this.period = Math.ceil(1000 / particlesPerSecond);
            this.timer = 0;
        }

        /**
         * Sets the particle factor
         * @param factory 
         */
        //% blockId=particlesetfactory block="particles %source set $factory=variables_get(factory)"
        setFactory(factory: ParticleFactory) {
            if (factory)
                this.factory = factory;
        }

        protected updateParticle(p: Particle, fixedDt: Fx8) {
            fixedDt = Fx.rightShift(fixedDt, TIME_PRECISION);

            p.vx = Fx.add(p.vx, Fx.mul(this.ax, fixedDt));
            p.vy = Fx.add(p.vy, Fx.mul(this.ay, fixedDt));

            p._x = Fx.add(p._x, Fx.mul(p.vx, fixedDt));
            p._y = Fx.add(p._y, Fx.mul(p.vy, fixedDt));
        }

        protected drawParticle(p: Particle, screenLeft: Fx8, screenTop: Fx8) {
            this.factory.drawParticle(p, Fx.sub(p._x, screenLeft), Fx.sub(p._y, screenTop));
        }
    }

    /**
     * Creates a new source of particles attached to a sprite
     * @param sprite 
     * @param particlesPerSecond number of particles created per second
     */
    //% blockId=particlesspray block="create particle source from %sprite=variables_get(mySprite) at %particlesPerSecond p/sec"
    //% blockSetVariable=source
    //% particlesPerSecond=100
    //% group="Sources"
    export function createParticleSource(sprite: Sprite, particlesPerSecond: number): ParticleSource {
        return new ParticleSource(sprite, particlesPerSecond);
    }

    export class SprayFactory extends ParticleFactory {
        protected speed: Fx8;
        protected minAngle: number;
        protected spread: number;

        constructor(speed: number, centerDegrees: number, arcDegrees: number) {
            super();
            initTrig();
            this.setSpeed(speed);
            this.setDirection(centerDegrees, arcDegrees);
        }

        createParticle(anchor: ParticleAnchor) {
            const p = super.createParticle(anchor);
            const angle = (this.minAngle + galois.randomRange(0, this.spread)) % NUM_SLICES;

            p.vx = Fx.mul(cachedSin[angle], this.speed);
            p.vy = Fx.mul(cachedCos[angle], this.speed);
            return p;
        }

        drawParticle(x: Fx8, y: Fx8, particle: Particle) {
            screen.setPixel(Fx.toInt(x), Fx.toInt(y), 1);
        }

        setSpeed(pixelsPerSecond: number) {
            this.speed = Fx8(pixelsPerSecond);
        }

        setDirection(centerDegrees: number, arcDegrees: number) {
            this.minAngle = (toRadians(centerDegrees - (arcDegrees >> 1)) / angleSlice) | 0;
            this.spread = (toRadians(arcDegrees) / angleSlice) | 0;
        }
    }

    /**
     * Creates a spray factory
     */
    //% blockId=particlesspary block="spray at speed %speed center"
    //% blockSetVariable=factory
    export function sprayFactory(speed: number) {
        const spray = new SprayFactory(100, 120, 60);
        return spray;
    }

    function initTrig() {
        if (!cachedSin) {
            cachedSin = [];
            cachedCos = [];
            for (let i = 0; i < NUM_SLICES; i++) {
                cachedSin.push(Fx8(Math.sin(i * angleSlice)));
                cachedCos.push(Fx8(Math.cos(i * angleSlice)));
            }
        }
    }

    export function mkParticle(x: Fx8, y: Fx8, lifespan: number) {
        const p = new Particle();
        p._x = x;
        p._y = y;
        p.vx = Fx.zeroFx8;
        p.vy = Fx.zeroFx8;

        p.lifespan = lifespan;
        return p;
    }

    function init() {
        if (sources) return;
        sources = [];
        lastUpdate = control.millis();
        game.onUpdate(updateParticles);
        game.onUpdateInterval(250, pruneParticles);
    }

    function updateParticles() {
        const time = control.millis();
        const dt = time - lastUpdate;
        lastUpdate = time;

        for (let i = 0; i < sources.length; i++) {
            sources[i]._update(dt);
        }
    }

    function pruneParticles() {
        for (let i = 0; i < sources.length; i++) {
            sources[i]._prune();
        }
    }
}
