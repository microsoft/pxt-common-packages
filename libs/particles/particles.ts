namespace particles {
    export let cachedSin: Fx8[];
    export let cachedCos: Fx8[];
    const TIME_PRECISION = 10; // down to the 1 << 10

    let lastUpdate: number;
    let sources: ParticleSource[];
    const galois = new Math.FastRandom(1234);
    const NUM_SLICES = 100;
    let angleSlice = 2 * Math.PI / NUM_SLICES;

    export class Particle {
        _x: Fx8;
        _y: Fx8;
        vx: Fx8;
        vy: Fx8;
        lifespan: number;
        data: number;
        next: Particle;
    }

    export interface ParticleAnchor {
        x: number;
        y: number;
    }

    export class ParticleFactory {
        constructor() {
            // Compiler errors if this doesn't exist
        }

        createParticle(anchor: ParticleAnchor): Particle {
            return mkParticle(Fx8(anchor.x), Fx8(anchor.y), 1500);
        }

        drawParticle(x: Fx8, y: Fx8, particle: Particle) {
            screen.setPixel(Fx.toInt(x), Fx.toInt(y), 1);
        }
    }

    let defaultFactory: ParticleFactory;

    export class ParticleSource implements SpriteLike {
        anchor: ParticleAnchor;

        protected enabled: boolean;
        protected head: Particle;
        protected timer: number;
        protected period: number;
        protected factory: ParticleFactory;
        protected ax: Fx8;
        protected ay: Fx8;

        z: number;
        id: number;

        _dt: number;

        constructor(anchor: ParticleAnchor, particlesPerSecond: number) {
            this.setRate(particlesPerSecond);
            this.setAnchor(anchor);
            this._dt = 0;
            this.setAcceleration(0, 0);

            if (!defaultFactory) defaultFactory = new ParticleFactory();

            this.factory = defaultFactory;
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
                if (current.lifespan > 0) this.drawParticle(current, left, top);
                current = current.next;
            }
        }

        _update(dt: number) {
            this.timer -= dt;
            while (this.timer < 0 && this.enabled) {
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
            }
            else {
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
                }
                else {
                    current = current.next;
                }
            }
        }

        setAcceleration(ax: number, ay: number) {
            this.ax = Fx8(ax);
            this.ay = Fx8(ay);
        }

        enable() {
            if (this.enabled) return;
            this.enabled = true;
            this.timer = 0;
            addSource(this);
        }

        disable() {
            if (!this.enabled) return;
            this.enabled = false;
        }

        setAnchor(anchor: ParticleAnchor) {
            this.anchor = anchor;
        }

        setRate(particlesPerSecond: number) {
            this.period = Math.ceil(1000 / particlesPerSecond);
            this.timer = 0;
        }

        setFactory(factory: ParticleFactory) {
            if (factory) this.factory = factory;
        }

        protected updateParticle(p: Particle, fixedDt: Fx8) {
            fixedDt = (fixedDt as any as number >> TIME_PRECISION) as any as Fx8;
            p.vx = Fx.add(p.vx, Fx.mul(this.ax, fixedDt));
            p.vy = Fx.add(p.vy, Fx.mul(this.ay, fixedDt));

            p._x = Fx.add(p._x, Fx.mul(p.vx, fixedDt));
            p._y = Fx.add(p._y, Fx.mul(p.vy, fixedDt));
            // p._y = Fx.add(p._y, Fx.mul(p.vx, fixedDt)); // for firework print this looks **REALLY** cool, make a varient that looks like this
        }

        protected drawParticle(p: Particle, screenLeft: Fx8, screenTop: Fx8) {
            this.factory.drawParticle(Fx.sub(p._x, screenLeft), Fx.sub(p._y, screenTop), p);
        }
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
        game.onUpdateInterval(500, pruneParticles);
    }

    function addSource(src: ParticleSource) {
        init();
        if (sources.indexOf(src) == -1) sources.push(src);
        game.currentScene().addSprite(src);
    }

    function removeSource(src: ParticleSource) {
        init();
        sources.removeElement(src);
        game.currentScene().allSprites.removeElement(src);
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

    const ratio = Math.PI / 180;
    function toRadians(degrees: number) {
        if (degrees < 0) degrees = 360 - (Math.abs(degrees) % 360);
        else degrees = degrees % 360;

        return degrees * ratio;
    }
}
