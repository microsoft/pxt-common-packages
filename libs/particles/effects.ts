namespace particles {

    //% fixedInstances
    export class ParticleEffect {
        protected sourceFactory: (anchor: ParticleAnchor, pps: number) => ParticleSource;

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
            this.sourceFactory(anchor, particlesPerSecond);
        }
    }

    /**
     * Anchor used for global effects that occur across the screen.
     */
    class GlobalAnchor implements ParticleAnchor {
        private camera: scene.Camera;
        flags: number; //TODO: remove pending fix for https://github.com/Microsoft/pxt-arcade/issues/504

        constructor() {
            this.camera = game.currentScene().camera;
            this.flags = 0;  //TODO: remove pending fix for https://github.com/Microsoft/pxt-arcade/issues/504
        }

        get x() {
            return this.camera.offsetX + (screen.width >> 1);
        }

        get y() {
            return this.camera.offsetY + (screen.height >> 1);
        }

        get width() {
            return screen.width;
        }

        get height() {
            return screen.height;
        }

    }

    //% fixedInstances
    export class GlobalEffect extends ParticleEffect {
        protected source: ParticleSource;

        constructor(sourceFactory: (anchor: ParticleAnchor, particlesPerSecond: number) => ParticleSource) {
            super(sourceFactory);
        }

        /**
         * Creates a new Global Effect that occurs over entire screen
         * @param particlesPerSecond 
         */
        //% blockId=particlesstartglobalanimation block="start global %effect effect at rate %particlesPerSecond p/s"
        //% particlesPerSecond.defl=20
        //% particlesPerSecond.min=1 particlePerSeconds.max=100
        //% group="Effects"
        startGlobal(particlesPerSecond: number): void {
            if (!this.sourceFactory) return;
            this.source = this.sourceFactory(new GlobalAnchor(), particlesPerSecond);
        }

        /**
         * If this effect is currently occurring globally, stop producing particles and end the effect
         * @param particlesPerSecond 
         */
        //% blockId=particlesendglobalanimation block="end global %effect effect"
        //% group="Effects"
        endGlobal(): void {
            if (this.source) {
                this.source.destroy();
                this.source = null;
            }
        }
    }

    /**
     * Removes all effects at anchor's location
     * @param anchor the anchor to remove effects from
     */
    //% blockId=particlesremoveeffect block="remove effects on %anchor=variables_get(mySprite)"
    //% group="Effects"
    export function removeEffects(anchor: ParticleAnchor) {
        const sources = game.currentScene().data.particleSources as particles.ParticleSource[];
        if (!sources) return;
        sources.filter(ps => ps.anchor == anchor || ps.anchor.x == anchor.x && ps.anchor.y == anchor.y)
        .forEach(ps => ps.destroy());
    }
    
    function createEffect(factoryFactory: (anchor?: ParticleAnchor) => ParticleFactory): ParticleEffect {
    // function createEffect(factoryFactory: () => ParticleFactory): ParticleEffect {
        const factory = factoryFactory();
        if (!factory) return undefined;
        return new ParticleEffect((anchor: ParticleAnchor, pps: number) => new ParticleSource(anchor, pps, factory));
    }

    //% whenUsed
    export const defaultFactory = new SprayFactory(20, 0, 60);

    //% fixedInstance whenUsed block="spray"
    export const spray = createEffect(function () { return new SprayFactory(100, 0, 120) });

    //% fixedInstance whenUsed block="trail"
    export const trail = new ParticleEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
        const factory = new TrailFactory(anchor, 250, 1000);
        return new ParticleSource(anchor, particlesPerSecond, factory);
    });

    //% fixedInstance whenUsed block="fountain"
    export const fountain = new ParticleEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
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
    export const confetti = new GlobalEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
        const factory = new ConfettiFactory(anchor.width ? anchor.width : 16, 16);
        factory.setSpeed(30);
        return new ParticleSource(anchor, particlesPerSecond, factory);
    });

    //% fixedInstance whenUsed block="hearts"
    export const hearts = new GlobalEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
        const factory = new ShapeFactory(anchor.width ? anchor.width : 16, 16, img`
            . F . F .
            F . F . F
            F . . . F
            . F . F .
            . . F . .
        `);
        // if large anchor, increase lifespan
        if (factory.xRange > 50) {
            factory.minLifespan = 1000;
            factory.maxLifespan = 2000;
        }
        factory.setSpeed(90);
        return new ParticleSource(anchor, particlesPerSecond, factory);
    });

    //% fixedInstance whenUsed block="smiles"
    export const smiles = new GlobalEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
        const factory = new ShapeFactory(anchor.width ? anchor.width : 16, 16, img`
            . f . f . 
            . f . f . 
            . . . . . 
            f . . . f 
            . f f f . 
        `);
        // if large anchor, increase lifespan
        if (factory.xRange > 50) {
            factory.minLifespan = 1000;
            factory.maxLifespan = 2000;
        }
        factory.setSpeed(90);
        return new ParticleSource(anchor, particlesPerSecond, factory);
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
    export const fire = new ParticleEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
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

    //% fixedInstance whenUsed block="ashes"
    export const ashes = new ParticleEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
        const src = new particles.ParticleSource(anchor, particlesPerSecond, new AshFactory(anchor));
        src.setAcceleration(0, 500);
        src.lifespan = 2000;
        return src;
    });

    //% fixedInstance whenUsed block="blizzard"
    export const blizzard = new GlobalEffect(function (anchor: ParticleAnchor, particlesPerSecond: number) {
        class SnowFactory extends particles.ShapeFactory {
            constructor(xRange: number, yRange: number) {
                super(xRange, yRange, img`F`);
                this.addShape(img`
                    F
                    F`);
                this.minLifespan = 200;
                this.maxLifespan = this.xRange > 50 ? 1200: 700;
            }
        
            createParticle(anchor: particles.ParticleAnchor) {
                const p = super.createParticle(anchor);
                p.data = this.galois.percentChance(80) ? 0x1 : 0x9;
                return p;
            }
        }

        const factory = new SnowFactory(anchor.width ? anchor.width : 16, anchor.height ? anchor.height : 16);
        const src = new particles.ParticleSource(anchor, particlesPerSecond, factory);
        src.setAcceleration(-300, -100);
        return src;
    });
}