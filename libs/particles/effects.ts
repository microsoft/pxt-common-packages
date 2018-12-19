namespace particles {
    export const ongoingEffects: ParticleSource[] = [];

    //% fixedInstances
    export class ParticleEffect {
        private sourceFactory: (anchor: ParticleAnchor, pps: number) => ParticleSource;

        constructor(sourceFactory: (anchor: ParticleAnchor, particlesPerSecond: number) => ParticleSource) {
            this.sourceFactory = sourceFactory;
        }

        /**
         * Attaches a new particle animation to the sprite or anchor
         * @param anchor 
         * @param particlesPerSecond 
         */
        //% blockId=particlesstartanimation block="start %effect effect on %anchor=variables_get(mySprite) at rate %particlesPerSecond p/s"
        //% particlesPerSecond.defl=20
        //% particlesPerSecond.min=1 particlePerSeconds.max=100
        //% group="Effects"
        start(anchor: ParticleAnchor, particlesPerSecond: number): void {
            if (!this.sourceFactory) return;
            ongoingEffects.push(this.sourceFactory(anchor, particlesPerSecond));
        }
    }

    function createEffect(factoryFactory: () => ParticleFactory): ParticleEffect {
        const factory = factoryFactory();
        if (!factory) return undefined;
        return new ParticleEffect((anchor: ParticleAnchor, pps: number) => new ParticleSource(anchor, pps, factory));
    }

    /**
     * Removes all effects at anchor's location
     * @param anchor the anchor to remove effects from
     */
    //% blockId=particlesremoveeffect block="remove effects on %anchor=variables_get(mySprite)"
    //% group="Effects"
    export function removeEffects(anchor: ParticleAnchor) {
        ongoingEffects.forEach(ps => {
            if (ps.anchor == anchor || ps.anchor.x == anchor.x && ps.anchor.y == anchor.y) {
                ps.destroy();
            }
        });
    }

    //% whenUsed
    export const defaultFactory = new SprayFactory(20, 0, 60);

    //% fixedInstance whenUsed block="spray"
    export const sprayEffect = createEffect(function () { return new SprayFactory(100, 0, 120) });

    //% fixedInstance whenUsed block="trail"
    export const trailEffect = new ParticleEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
        const factory = new TrailFactory(anchor, 250, 1000);
        return new ParticleSource(anchor, particlesPerSecond, factory);
    });

    //% fixedInstance whenUsed block="fountain"
    export const fountainEffect = new ParticleEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
        class FountainFactory extends particles.SprayFactory {
            galois: Math.FastRandom;
    
            constructor() {
                super(40, 180, 90);
                this.galois = new Math.FastRandom(1234);
            }
    
            createParticle(anchor: particles.ParticleAnchor) {
                const p = super.createParticle(anchor);
                p.data = this.galois.randomBool() ? 8 : 9;
                p.lifespan = 1500;
                return p;
            }
    
            drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
                screen.setPixel(Fx.toInt(x), Fx.toInt(y), p.data);
            }
        }

        const factory = new FountainFactory();
        const source = new ParticleSource(anchor, particlesPerSecond, factory);
        source.setAcceleration(0, 40);
        return source;
    });

    //% fixedInstance whenUsed block="confetti"
    export const confettiEffect = createEffect(function () {
        const factory = new ConfettiFactory(16, 16);
        factory.setSpeed(30);
        return factory;
    });

    //% fixedInstance whenUsed block="hearts"
    export const hearts = createEffect(function () {
        return new ShapeFactory(16, 16, img`
            . F . F .
            F . F . F
            F . . . F
            . F . F .
            . . F . .
        `);
    });

    //% fixedInstance whenUsed block="smiles"
    export const smiles = createEffect(function () {
        return new ShapeFactory(16, 16, img`
            . f . f . 
            . f . f . 
            . . . . . 
            f . . . f 
            . f f f . 
        `);
    });

    //% fixedInstance whenUsed block="rings"
    export const rings = createEffect(function () {
        return new ShapeFactory(16, 16, img`
            . F F F . 
            F . . . F 
            F . . . F 
            f . . . f 
            . f f f . 
        `);
    });

    //% fixedInstance whenUsed block="fire"
    export const fireEffect = new ParticleEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
        const factory = new FireFactory(5);
        const src = new FireSource(anchor, particlesPerSecond, factory);
        src.setAcceleration(0, -20);
        return src;
    });

    //% fixedInstance whenUsed block="warm radial"
    export const warmRadial = createEffect(function () { return new RadialFactory(0, 30, 10) });

    //% fixedInstance whenUsed block="cool radial"
    export const coolRadial = createEffect(function () { return new RadialFactory(0, 30, 10, [0x6, 0x7, 0x8, 0x9, 0xA]) });

    //% fixedInstance whenUsed block="halo"
    export const halo = createEffect(function () {
        class RingFactory extends RadialFactory {
            createParticle(anchor: particles.ParticleAnchor) {
                const p = super.createParticle(anchor);
                p.lifespan = this.galois.randomRange(200, 350);
                return p;
            }
        }
        return new RingFactory(30, 40, 10, [0x4, 0x4, 0x5]);
    });
}