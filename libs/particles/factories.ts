namespace particles {
    let cachedSin: Fx8[];
    let cachedCos: Fx8[];

    const NUM_SLICES = 100;
    const galois = new Math.FastRandom();
    let angleSlice = 2 * Math.PI / NUM_SLICES;

    /**
     * Initialize sin and cos values for each slice to minimize recomputation
     */
    function initTrig() {
        if (!cachedSin) {
            cachedSin = cacheSin(NUM_SLICES);
            cachedCos = cacheCos(NUM_SLICES);
        }
    }

    /**
     * @param slices number of cached sin values to make
     * @returns array of cached sin values between 0 and 360 degrees
     */
    export function cacheSin(slices: number): Fx8[] {
        let sin: Fx8[] = [];
        let anglePerSlice = 2 * Math.PI / slices;
        for (let i = 0; i < slices; i++) {
            sin.push(Fx8(Math.sin(i * anglePerSlice)));
        }
        return sin;
    }

    /**
     * @param slices number of cached cos values to make
     * @returns array of cached cos values between 0 and 360 degrees
     */
    export function cacheCos(slices: number): Fx8[] {
        let cos: Fx8[] = [];
        let anglePerSlice = 2 * Math.PI / slices;
        for (let i = 0; i < slices; i++) {
            cos.push(Fx8(Math.cos(i * anglePerSlice)));
        }
        return cos;
    }

    const ratio = Math.PI / 180;
    function toRadians(degrees: number) {
        if (degrees < 0)
            degrees = 360 - (Math.abs(degrees) % 360);
        else
            degrees = degrees % 360;

        return degrees * ratio;
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
            p.lifespan = 500;

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
     * A factory for creating a spray of particles
     */
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

        drawParticle(particle: Particle, x: Fx8, y: Fx8) {
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
     * A factory for creating particles within rectangular area
     */
    export class AreaFactory extends SprayFactory {
        xRange: number;
        yRange: number;
        protected galois: Math.FastRandom;

        constructor(xRange: number, yRange: number) {
            super(40, 0, 90);
            this.xRange = xRange;
            this.yRange = yRange;
            this.galois = new Math.FastRandom();
        }

        createParticle(anchor: particles.ParticleAnchor) {
            const p = super.createParticle(anchor);

            p.lifespan = this.galois.randomRange(150, 850);
            p._x = Fx.add(Fx8(this.galois.randomRange(0, this.xRange) - (this.xRange >> 1)), p._x);
            p._y = Fx.add(Fx8(this.galois.randomRange(0, this.yRange) - (this.yRange >> 1)), p._y);

            return p;
        }

        drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
            const col = p.lifespan > 500 ?
                4 : p.lifespan > 250 ?
                    5 : 1;
            screen.setPixel(Fx.toInt(x), Fx.toInt(y), col);
        }
    }

    /**
     * A factory for creating a trail that is emitted by sprites.
     */
    export class TrailFactory extends AreaFactory {
        minLifespan: number;
        maxLifespan: number;
        galois: Math.FastRandom;

        constructor(sprite: ParticleAnchor, minLifespan: number, maxLifespan: number) {
            super(sprite.width ? sprite.width >> 1 : 8, sprite.height? sprite.height >> 1 : 8);
            this.minLifespan = minLifespan;
            this.maxLifespan = maxLifespan;
            this.galois = new Math.FastRandom();
            this.setSpeed(0)
        }

        createParticle(anchor: particles.ParticleAnchor) {
            const p = super.createParticle(anchor);

            p.lifespan = this.galois.randomRange(this.minLifespan, this.maxLifespan);
            p.data = this.galois.randomRange(0x1, 0xF);

            return p;
        }

        drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
            screen.setPixel(Fx.toInt(x), Fx.toInt(y), p.data);
        }
    }

    /**
     * A factory for creating particles with the provided shapes fall down the screen
     */
    export class ShapeFactory extends AreaFactory {
        protected sources: Image[];
        protected ox: Fx8;
        protected oy: Fx8;

        constructor(xRange: number, yRange: number, source: Image) {
            super(xRange, yRange);
            this.sources = [source];

            // Base offsets off of initial shape
            this.ox = Fx8(source.width >> 1);
            this.oy = Fx8(source.height >> 1);
        }

        /**
         * Add another possible shape for a particle to display
         * @param shape 
         */
        addShape(shape: Image) {
            if (shape) this.sources.push(shape);
        }

        drawParticle(p: Particle, x: Fx8, y: Fx8) {
            const pImage = this.galois.pickRandom(this.sources).clone();
            pImage.replace(0xF, p.data);

            screen.drawImage(pImage,
                Fx.toInt(Fx.sub(x, this.ox)),
                Fx.toInt(Fx.sub(y, this.oy))
            );
        }

        createParticle(anchor: ParticleAnchor) {
            const p = super.createParticle(anchor);

            p.data = this.galois.randomRange(1, 14);
            p.lifespan = this.galois.randomRange(250, 1000);

            return p;
        }
    }

    export class ConfettiFactory extends ShapeFactory {
        constructor(xRange: number, yRange: number) {
            const confetti = [
                img`
                    F
                `,
                img`
                    F
                    F
                `,
                img`
                    F F
                `,
                img`
                    F F
                    F .
                `,
                img`
                    F F
                    . F
            `];
            super(xRange, yRange, confetti[0])
            for (let i = 1; i < confetti.length; i++) {
                this.addShape(confetti[i]);
            }
        }

        createParticle(anchor: ParticleAnchor) {
            const p = super.createParticle(anchor);
            p.lifespan = this.galois.randomRange(1000, 4500);
            return p;
        }
    }

    export class FireFactory extends particles.ParticleFactory {
        protected galois: Math.FastRandom;
        protected minRadius: number;
        protected maxRadius: number;
    
        constructor(radius: number) {
            super();
            initTrig();
            this.galois = new Math.FastRandom();
            this.minRadius = radius >> 1;
            this.maxRadius = radius;
        }
    
        createParticle(anchor: particles.ParticleAnchor) {
            const p = super.createParticle(anchor);
            p.data = this.galois.randomBool() ?
                2 : this.galois.randomBool() ?
                    4 : 5 // 50% 2, otherwise 50% 4 or 5
    
            const i = this.galois.randomRange(0, cachedCos.length);
            const r = this.galois.randomRange(this.minRadius, this.maxRadius);
            p._x = Fx.iadd(anchor.x, Fx.mul(Fx8(r), cachedCos[i]));
            p._y = Fx.iadd(anchor.y, Fx.mul(Fx8(r), cachedSin[i]));
            p.vy = Fx8(Math.randomRange(0, 10));
            p.vx = Fx8(Math.randomRange(-5, 5))
            p.lifespan = 1500;
    
            return p;
        }
    
        drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
            screen.setPixel(Fx.toInt(p._x), Fx.toInt(p._y), p.data);
        }
    }
}