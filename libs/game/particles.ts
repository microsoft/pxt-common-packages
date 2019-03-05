namespace particles {
    enum Flag {
        enabled = 1 << 0,
        destroyed = 1 << 1,
    }

    const MAX_SOURCES = 7; // maximum count of sources before removing previous sources
    const TIME_PRECISION = 10; // time goes down to down to the 1<<10 seconds
    let lastUpdate: number;

    /**
     * A single particle
     */
    export class Particle {
        _x: Fx8;
        _y: Fx8;
        vx: Fx8;
        vy: Fx8;
        lifespan: number;
        next: Particle;
        data?: number;
        color?: number;
    }

    /**
     * An anchor for a Particle to originate from
     */
    export interface ParticleAnchor {
        x: number;
        y: number;
        vx?: number;
        vy?: number;
        width?: number;
        height?: number;
        image?: Image;
        flags?: number;
        setImage?: (i: Image) => void;
    }

    /**
     * A source of particles
     */
    export class ParticleSource implements SpriteLike {
        private _z: number;

        /**
         * A relative ranking of this sources priority
         * When necessary, a source with a lower priority will
         * be culled before a source with a higher priority.
         */
        priority: number;

        id: number;
        _dt: number;
        /**
         * The anchor this source is currently attached to
         */
        anchor: ParticleAnchor;
        /**
         * Time to live in milliseconds. The lifespan decreases by 1 on each millisecond
         * and the source gets destroyed when it reaches 0.
         */
        lifespan: number;

        protected flags: number;
        protected head: Particle;
        protected timer: number;
        protected period: number;
        protected _factory: ParticleFactory;

        protected ax: Fx8;
        protected ay: Fx8;

        get z() {
            return this._z;
        }

        set z(v: number) {
            if (v != this._z) {
                this._z = v;
                game.currentScene().flags |= scene.Flag.NeedsSorting;
            }
        }

        /**
         * @param anchor to emit particles from
         * @param particlesPerSecond rate at which particles are emitted
         * @param factory [optional] factory to generate particles with; otherwise, 
         */
        constructor(anchor: ParticleAnchor, particlesPerSecond: number, factory?: ParticleFactory) {
            init();
            const scene = game.currentScene();
            const sources = particleSources();

            // remove and immediately destroy oldest source if over MAX_SOURCES
            if (sources.length > MAX_SOURCES) {
                sortSources();
                const removedSource = sources.shift();
                removedSource.clear();
                removedSource.destroy();
            }

            this.flags = 0;
            this.setRate(particlesPerSecond);
            this.setAcceleration(0, 0);
            this.setAnchor(anchor);
            this.lifespan = undefined;
            this._dt = 0;
            this.z = 0;
            this.priority = 0;
            this.setFactory(factory || particles.defaultFactory);
            sources.push(this);
            scene.addSprite(this);
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
            const left = Fx8(camera.drawOffsetX);
            const top = Fx8(camera.drawOffsetY);

            while (current) {
                if (current.lifespan > 0)
                    this.drawParticle(current, left, top);
                current = current.next;
            }
        }

        _update(dt: number) {
            this.timer -= dt;

            const anchor: ParticleAnchor = this.anchor;
            if (this.lifespan !== undefined) {
                this.lifespan -= dt;
                if (this.lifespan <= 0) {
                    this.lifespan = undefined;
                    this.destroy();
                }
            } else if (this.anchor && this.anchor.flags !== undefined && (this.anchor.flags & sprites.Flag.Destroyed)) {
                this.lifespan = 750;
            }

            while (this.timer < 0 && this.enabled) {
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

            if ((this.flags & Flag.destroyed) && !this.head) {
                const scene = game.currentScene();
                if (scene)
                    scene.allSprites.removeElement(this);
                const sources = particleSources();
                if (sources && sources.length)
                    sources.removeElement(this);
                this.anchor == undefined;
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
        setAcceleration(ax: number, ay: number) {
            this.ax = Fx8(ax);
            this.ay = Fx8(ay);
        }

        /**
         * Enables or disables particles
         * @param on 
         */
        setEnabled(on: boolean) {
            this.enabled = on;
        }

        get enabled() {
            return !!(this.flags & Flag.enabled);
        }

        /**
         * Set whether this source is currently enabled (emitting particles) or not
         */
        set enabled(v: boolean) {
            if (v !== this.enabled) {
                this.flags = v ? (this.flags | Flag.enabled) : (this.flags ^ Flag.enabled);
                this.timer = 0;
            }
        }

        /**
         * Destroy the source
         */
        destroy() {
            // The `_prune` step will finishing destroying this Source once all emitted particles finish rendering
            this.enabled = false;
            this.flags |= Flag.destroyed;
            this._prune();
        }

        /**
         * Clear all particles emitted from this source
         */
        clear() {
            this.head = undefined;
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

    //% whenUsed
    export const defaultFactory = new particles.SprayFactory(20, 0, 60);

    /**
     * Creates a new source of particles attached to a sprite
     * @param sprite 
     * @param particlesPerSecond number of particles created per second
     */
    export function createParticleSource(sprite: Sprite, particlesPerSecond: number): ParticleSource {
        return new ParticleSource(sprite, particlesPerSecond);
    }

    function init() {
        const scene = game.currentScene();
        if (scene.particleSources) return;
        scene.particleSources = [];
        lastUpdate = control.millis();
        game.onUpdate(updateParticles);
        game.onUpdateInterval(250, pruneParticles);
    }

    function updateParticles() {
        const sources = particleSources();
        sortSources();

        const time = control.millis();
        const dt = time - lastUpdate;
        lastUpdate = time;

        for (let i = 0; i < sources.length; i++) {
            sources[i]._update(dt);
        }
    }

    function pruneParticles() {
        const sources = particleSources();
        if (sources)
        sources.slice(0, sources.length).forEach(s => s._prune());
    }
    
    function sortSources() {
        const sources = particleSources();
        sources.sort((a, b) => (a.priority - b.priority || a.id - b.id));
    }

    /**
     * A source of particles where particles will occasionally change speed based off of each other
     */
    export class FireSource extends ParticleSource {
        protected galois: Math.FastRandom;

        constructor(anchor: ParticleAnchor, particlesPerSecond: number, factory?: ParticleFactory) {
            super(anchor, particlesPerSecond, factory);
            this.galois = new Math.FastRandom();
            this.z = 20;
        }

        updateParticle(p: Particle, fixedDt: Fx8) {
            super.updateParticle(p, fixedDt);
            if (p.next && this.galois.percentChance(30)) {
                p.vx = p.next.vx;
                p.vy = p.next.vy;
            }
        }
    }

    /**
     * A source of particles where the particles oscillate horizontally, and occasionally change
     * between a given number of defined states
     */
    export class BubbleSource extends ParticleSource {
        protected maxState: number;
        protected galois: Math.FastRandom;
        stateChangePercentage: number;
        oscilattionPercentage: number


        constructor(anchor: ParticleAnchor, particlesPerSecond: number, maxState: number, factory?: ParticleFactory) {
            super(anchor, particlesPerSecond, factory);
            this.galois = new Math.FastRandom();
            this.maxState = maxState;
            this.stateChangePercentage = 3;
            this.oscilattionPercentage = 4;
        }

        updateParticle(p: Particle, fixedDt: Fx8) {
            super.updateParticle(p, fixedDt);
            if (this.galois.percentChance(this.stateChangePercentage)) {
                if (p.data < this.maxState) {
                    p.data++;
                } else if (p.data > 0) {
                    p.data--;
                }
            }

            if (this.galois.percentChance(this.oscilattionPercentage)) {
                p.vx = Fx.neg(p.vx);
            }
        }
    }

    export function clearAll() {
        const sources = particleSources();
        if (sources) {
            sources.forEach(s => s.clear());
            pruneParticles();
        }
    }

    /**
     * Stop all particle sources from creating any new particles
     */
    export function disableAll() {
        const sources = particleSources();
        if (sources) {
            sources.forEach(s => s.enabled = false);
            pruneParticles();
        }
    }

    /**
     * Allow all particle sources to create any new particles
     */
    export function enableAll() {
        const sources = particleSources();
        if (sources) {
            sources.forEach(s => s.enabled = true);
            pruneParticles();
        }
    }

    function particleSources() {
        const sources = game.currentScene().particleSources;
        return sources;
    }
}
