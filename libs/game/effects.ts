/**
 * Small particles
 */
//% color="#382561" weight=78 icon="\uf06d"
//% groups='["Particles", "Images"]'
//% advanced=true
namespace effects {

    export interface BackgroundEffect {
        startSceneEffect(): void;
    }

    //% fixedInstances
    export class ImageEffect implements BackgroundEffect {

        // If used in an animation, this should be used as the default delay between method calls
        protected preferredDelay: number;
        protected effect: (image: Image, fastRandom ?: Math.FastRandom) => void;
        protected fastRandom: Math.FastRandom;

        constructor(defaultRate: number, effectFactory: (image: Image, fastRandom ?: Math.FastRandom) => void) {
            this.effect = effectFactory;
            this.fastRandom = new Math.FastRandom();
            this.preferredDelay = defaultRate;
        }

        /**
         * Apply this effect to the image of the current sprite
         * @param sprite
         */
        //% blockId=particleEffectApply block="apply %effect effect to the image of %image=variables_get(mySprite)"
        //% group="Images"
        applyTo(sprite: Sprite) {
            if (!sprite || !sprite.image) return;
            const clonedImage = sprite.image.clone();
            this.change(clonedImage)
            sprite.setImage(clonedImage);
        }

        /**
         * Change the given image with this effect
         * @param input 
         */
        //% blockId=imageEffectChange block="use %effect effect to change %input=variables_get(myImage)"
        //% group="Images"
        change(input: Image) {
            this.effect(input, this.fastRandom);
        }

        /**
         * Make this effect occur repeatedly on the background
         * @param times number of times effect should occur
         * @param delay delay between instances of the effect
         */
        //% blockId=particleEffectStartScene block="apply %effect effect to background || %times times"
        //% group="Images"
        startSceneEffect(times?: number, delay?: number): void {
            times = times ? times : 15;
            control.runInParallel(() => {
                for (let i = 0; i < times; ++i) {
                    this.change(scene.backgroundImage());
                    pause(delay ? delay : this.preferredDelay);
                }
            });
        }
    }

    //% fixedInstance whenUsed block="dissolve"
    export const dissolve = new ImageEffect(25, (input: Image, r: Math.FastRandom) => {
        for (let i = (input.width * input.height) >> 4; i > 0; --i) {
            const x = r.randomRange(0, input.width)
            const y = r.randomRange(0, input.height)
            const w = r.randomRange(1, 3);
            const h = r.randomRange(1, 3);

            input.drawRect(x, y, w, h, 0);
        }
    });

    //% fixedInstance whenUsed block="melt"
    export const melt = new ImageEffect(125, (input: Image, r: Math.FastRandom) => {
        const rounds = (input.width * input.height) >> 4;
        for (let j = 0; j < rounds; ++j) {
            let x = r.randomRange(0, input.width - 1)
            let y = r.randomRange(0, input.height - 3)
            let c = input.getPixel(x, y)
            input.setPixel(x, y + 1, c)
            input.setPixel(x, y + 2, c)
        }
    });
}