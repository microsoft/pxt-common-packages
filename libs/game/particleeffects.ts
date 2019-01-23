namespace effects {

    //% fixedInstances
    export interface BackgroundEffect {
        startScreenEffect(): void;
    }

    //% fixedInstances
    export class ParticleEffect {
        protected sourceFactory: (anchor: particles.ParticleAnchor, pps: number) => particles.ParticleSource;
        protected defaultRate: number;
        protected defaultLifespan: number;

        constructor(defaultParticlesPerSecond: number, defaultLifespan: number,
                sourceFactory: (anchor: particles.ParticleAnchor, particlesPerSecond: number) => particles.ParticleSource) {
            this.sourceFactory = sourceFactory;
            this.defaultRate = defaultParticlesPerSecond;
            this.defaultLifespan = defaultLifespan;
        }

        /**
         * Attaches a new particle animation to the sprite or anchor for a short period of time
         * @param anchor
         * @param duration
         * @param particlesPerSecond 
         */
        start(anchor: particles.ParticleAnchor, duration?: number, particlesPerSecond?: number): void {
            if (!this.sourceFactory) return;
            const src = this.sourceFactory(anchor, particlesPerSecond ? particlesPerSecond : this.defaultRate);
            if (duration)
                src.lifespan = duration > 0 ? duration : this.defaultLifespan;
        }

        /**
         * Destroy the provided sprite with an effect
         * @param sprite
         * @param duration how long the sprite will remain on the screen. If set to 0 or undefined,
         *                  uses the default rate for this effect.
         * @param particlesPerSecond
         */
        destroy(anchor: Sprite, duration?: number, particlesPerSecond?: number) {
            anchor.setFlag(SpriteFlag.Ghost, true);
            this.start(anchor, particlesPerSecond);
            anchor.lifespan = duration ? duration : this.defaultLifespan >> 2;
            effects.dissolve.applyTo(anchor);
        }
    }

    /**
     * Anchor used for effects that occur across the screen.
     */
    class SceneAnchor implements particles.ParticleAnchor {
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
    export class ScreenEffect extends ParticleEffect implements BackgroundEffect {
        protected source: particles.ParticleSource;
        protected sceneDefaultRate: number;

        constructor(anchorDefault: number, sceneDefault: number, defaultLifespan: number,
                sourceFactory: (anchor: particles.ParticleAnchor, particlesPerSecond: number) => particles.ParticleSource) {
            super(anchorDefault, defaultLifespan, sourceFactory);
            this.sceneDefaultRate = sceneDefault;
        }

        /**
         * Creates a new effect that occurs over the entire screen
         * @param particlesPerSecond 
         * @param duration
         */
        //% blockId=particlesStartScreenAnimation block="start screen %effect effect || for %duration ms"
        //% duration.shadow=timePicker
        //% blockNamespace=scene
        //% group="Effects" blockGap=8
        //% weight=90
        startScreenEffect(duration?: number, particlesPerSecond?: number): void {
            if (!this.sourceFactory)
                return;

            if (this.source && this.source.enabled) {
                if (duration)
                    this.source.lifespan = duration;
                return;
            }

            this.endScreenEffect();
            this.source = this.sourceFactory(new SceneAnchor(), particlesPerSecond ? particlesPerSecond : this.sceneDefaultRate);
            if (duration)
                this.source.lifespan = duration;
        }

        /**
         * If this effect is currently occurring as a full screen effect, stop producing particles and end the effect
         * @param particlesPerSecond 
         */
        //% blockId=particlesEndScreenAnimation block="end screen %effect effect"
        //% blockNamespace=scene
        //% group="Effects" blockGap=8
        //% weight=80
        endScreenEffect(): void {
            if (this.source) {
                this.source.destroy();
                this.source = undefined;
            }
        }
    }

    /**
     * Removes all effects at anchor's location
     * @param anchor the anchor to remove effects from
     */
    //% blockId=particlesclearparticles block="clear effects on %anchor=variables_get(mySprite)"
    //% blockNamespace=sprites
    //% group="Effects" weight=89
    export function clearParticles(anchor: particles.ParticleAnchor) {
        const sources = game.currentScene().data.particleSources as particles.ParticleSource[];
        if (!sources) return;
        sources
            .filter(ps => ps.anchor == anchor || ps.anchor.x == anchor.x && ps.anchor.y == anchor.y)
            .forEach(ps => ps.destroy());
    }

    function createEffect(defaultParticlesPerSecond: number, defaultLifespan: number,
            factoryFactory: (anchor?: particles.ParticleAnchor) => particles.ParticleFactory): ParticleEffect {
        const factory = factoryFactory();
        if (!factory) return undefined;
        return new ParticleEffect(defaultParticlesPerSecond, defaultLifespan,
                    (anchor: particles.ParticleAnchor, pps: number) => new particles.ParticleSource(anchor, pps, factory));
    }

    //% fixedInstance whenUsed block="spray"
    export const spray = createEffect(20, 2000, function () { return new particles.SprayFactory(100, 0, 120) });

    //% fixedInstance whenUsed block="trail"
    export const trail = new ParticleEffect(20, 4000, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        const factory = new particles.TrailFactory(anchor, 250, 1000);
        return new particles.ParticleSource(anchor, particlesPerSecond, factory);
    });

    //% fixedInstance whenUsed block="fountain"
    export const fountain = new ParticleEffect(20, 3000, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        class FountainFactory extends particles.SprayFactory {
            galois: Math.FastRandom;
    
            constructor() {
                super(40, 180, 90);
                this.galois = new Math.FastRandom(1234);
            }
    
            createParticle(anchor: particles.ParticleAnchor) {
                const p = super.createParticle(anchor);
                p.color = this.galois.randomBool() ? 8 : 9;
                p.lifespan = 1500;
                return p;
            }
    
            drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
                screen.setPixel(Fx.toInt(x), Fx.toInt(y), p.color);
            }
        }

        const factory = new FountainFactory();
        const source = new particles.ParticleSource(anchor, particlesPerSecond, factory);
        source.setAcceleration(0, 40);
        return source;
    });

    //% fixedInstance whenUsed block="confetti"
    export const confetti = new ScreenEffect(10, 40, 4000, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        const factory = new particles.ConfettiFactory(anchor.width ? anchor.width : 16, 16);
        factory.setSpeed(30);
        return new particles.ParticleSource(anchor, particlesPerSecond, factory);
    });

    //% fixedInstance whenUsed block="hearts"
    export const hearts = new ScreenEffect(5, 20, 2000, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        const factory = new particles.ShapeFactory(anchor.width ? anchor.width : 16, 16, img`
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
        return new particles.ParticleSource(anchor, particlesPerSecond, factory);
    });

    //% fixedInstance whenUsed block="smiles"
    export const smiles = new ScreenEffect(5, 25, 1500, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        const factory = new particles.ShapeFactory(anchor.width ? anchor.width : 16, 16, img`
            . f . f . 
            . f . f . 
            . . . . . 
            f . . . f 
            . f f f . 
        `);
        // if large anchor, increase lifespan
        if (factory.xRange > 50) {
            factory.minLifespan = 1250;
            factory.maxLifespan = 2500;
        }

        factory.setSpeed(50);
        return new particles.ParticleSource(anchor, particlesPerSecond, factory);
    });

    //% fixedInstance whenUsed block="rings"
    export const rings = createEffect(5, 1000, function () {
        return new particles.ShapeFactory(16, 16, img`
            . F F F . 
            F . . . F 
            F . . . F 
            f . . . f 
            . f f f . 
        `);
    });

    //% fixedInstance whenUsed block="fire"
    export const fire = new ParticleEffect(40, 5000, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        const factory = new particles.FireFactory(5);
        const src = new particles.FireSource(anchor, particlesPerSecond, factory);
        src.setAcceleration(0, -20);
        return src;
    });

    //% fixedInstance whenUsed block="warm radial"
    export const warmRadial = createEffect(30, 2500, function () { return new particles.RadialFactory(0, 30, 10) });

    //% fixedInstance whenUsed block="cool radial"
    export const coolRadial = createEffect(30, 2000, function () { return new particles.RadialFactory(0, 30, 10, [0x6, 0x7, 0x8, 0x9, 0xA]) });

    //% fixedInstance whenUsed block="halo"
    export const halo = createEffect(40, 3000, function () {
        class RingFactory extends particles.RadialFactory {
            createParticle(anchor: particles.ParticleAnchor) {
                const p = super.createParticle(anchor);
                p.lifespan = this.galois.randomRange(200, 350);
                return p;
            }
        }
        return new RingFactory(30, 40, 10, [0x4, 0x4, 0x5]);
    });

    //% fixedInstance whenUsed block="ashes"
    export const ashes = new ParticleEffect(60, 2000, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        const factory = new particles.AshFactory(anchor);
        const src = new particles.ParticleSource(anchor, particlesPerSecond, factory);
        src.setAcceleration(0, 500);
        return src;
    });

    //% fixedInstance whenUsed block="disintegrate"
    export const disintegrate = new ParticleEffect(60, 1250, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        const factory = new particles.AshFactory(anchor, true, 30);
        factory.minLifespan = 200;
        factory.maxLifespan = 500;
        const src = new particles.ParticleSource(anchor, particlesPerSecond, factory);
        src.setAcceleration(0, 750);
        return src;
    });

    //% fixedInstance whenUsed block="blizzard"
    export const blizzard = new ScreenEffect(15, 50, 3000, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        class SnowFactory extends particles.ShapeFactory {
            constructor(xRange: number, yRange: number) {
                super(xRange, yRange, img`F`);
                this.addShape(img`
                    F
                    F`
                );
                this.minLifespan = 200;
                this.maxLifespan = this.xRange > 50 ? 1200: 700;
            }

            createParticle(anchor: particles.ParticleAnchor) {
                const p = super.createParticle(anchor);
                p.color = this.galois.percentChance(80) ? 0x1 : 0x9;
                return p;
            }
        }

        const factory = new SnowFactory(anchor.width ? anchor.width : 16, anchor.height ? anchor.height : 16);
        const src = new particles.ParticleSource(anchor, particlesPerSecond, factory);
        src.setAcceleration(-300, -100);
        return src;
    });

    //% fixedInstance whenUsed block="bubbles"
    export const bubbles = new ScreenEffect(15, 40, 5000, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        const min = anchor.width > 50 ? 2000 : 500;
        const factory = new particles.BubbleFactory(anchor, min, min * 2.5);
        return new particles.BubbleSource(anchor, particlesPerSecond, factory.stateCount - 1, factory);
    });

    //% fixedInstance whenUsed block="star field"
    export const starField = new ScreenEffect(2, 5, 5000, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
        const factory = new particles.StarFactory([0x1, 0x3, 0x5, 0x9, 0xC]);
        return new particles.ParticleSource(anchor, particlesPerSecond, factory);
    });
}