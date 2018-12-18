/**
 * Small particles
 */
//% color="#382561" weight=78 icon="\uf06d"
//% groups='["Effects", "Create", "Properties"]'
namespace particles {
    const TIME_PRECISION = 10; // time goes down to down to the 1<<10 seconds

    let lastUpdate: number;
    let sources: ParticleSource[];

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
        width?: number;
        height?: number;
    }

    /**
     * A source of particles
     */
    export class ParticleSource implements SpriteLike {
        z: number;
        id: number;
        _dt: number;
        /**
         * The anchor this source is currently attached to
         */
        anchor: ParticleAnchor;
        /**
         * Time to live in milliseconds. The lifespan decreases by 1 on each millisecond
         * and the sprite gets destroyed when it reaches 0.
         */
        lifespan: number;

        protected _enabled: boolean;
        protected head: Particle;
        protected timer: number;
        protected period: number;
        protected _factory: ParticleFactory;

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
            this.lifespan = undefined;
            this._dt = 0;
            this.z = -1;
            this.setFactory(factory || particles.defaultFactory);
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

            if (this.lifespan !== undefined) {
                this.lifespan -= dt;
                if (this.lifespan <= 0) {
                    this.lifespan = undefined;
                    this.destroy();
                }
            }

            while (this.timer < 0 && this._enabled) {
                this.timer += this.period;
                const p = this._factory.createParticle(this.anchor);
                if (!p) continue; // some factories can decide to not produce a particle
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
            this.enabled = false;
            control.runInParallel(() => {
                pauseUntil(() => this.head == null);
                sources.removeElement(this);
                game.currentScene().allSprites.removeElement(this);
            });
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

        get factory(): ParticleFactory {
            return this._factory;
        }

        /**
         * Sets the particle factor
         * @param factory 
         */
        //% blockId=particlesetfactory block="particles %source set $factory=variables_get(factory)"
        setFactory(factory: ParticleFactory) {
            if (factory)
                this._factory = factory;
        }

        protected updateParticle(p: Particle, fixedDt: Fx8) {
            fixedDt = Fx.rightShift(fixedDt, TIME_PRECISION);

            p.vx = Fx.add(p.vx, Fx.mul(this.ax, fixedDt));
            p.vy = Fx.add(p.vy, Fx.mul(this.ay, fixedDt));

            p._x = Fx.add(p._x, Fx.mul(p.vx, fixedDt));
            p._y = Fx.add(p._y, Fx.mul(p.vy, fixedDt));
        }

        protected drawParticle(p: Particle, screenLeft: Fx8, screenTop: Fx8) {
            this._factory.drawParticle(p, Fx.sub(p._x, screenLeft), Fx.sub(p._y, screenTop));
        }
    }

    /**
     * Creates a new source of particles attached to a sprite
     * @param sprite 
     * @param particlesPerSecond number of particles created per second
     */
    //% blockId=particlesspray block="create particle source from %sprite=variables_get(mySprite) at %particlesPerSecond p/sec"
    //% particlesPerSecond.defl=20
    //% blockSetVariable=source
    //% particlesPerSecond=100
    //% group="Sources"
    export function createParticleSource(sprite: Sprite, particlesPerSecond: number): ParticleSource {
        return new ParticleSource(sprite, particlesPerSecond);
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

    /**
     * A source of particles, where 
     */
    export class FireSource extends particles.ParticleSource {
        private galois: Math.FastRandom;
        constructor(anchor: particles.ParticleAnchor, particlesPerSecond: number, factory?: particles.ParticleFactory) {
            super(anchor, particlesPerSecond, factory);
            this.galois = new Math.FastRandom();
            this.z = 20;
        }

        updateParticle(p: particles.Particle, fixedDt: Fx8) {
            super.updateParticle(p, fixedDt);
            if (p.next && this.galois.percentChance(30)) {
                p.vx = p.next.vx;
                p.vy = p.next.vy;
            }
        }
    }
}
