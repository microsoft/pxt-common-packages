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
            cachedSin = [];
            cachedCos = [];
            for (let i = 0; i < NUM_SLICES; i++) {
                cachedSin.push(Fx8(Math.sin(i * angleSlice)));
                cachedCos.push(Fx8(Math.cos(i * angleSlice)));
            }
        }
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

        constructor(sprite: Sprite, minLifespan: number, maxLifespan: number) {
            super(sprite.image.width >> 1, sprite.image.height >> 1);
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
}