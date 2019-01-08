/**
 * Small particles
 */
//% color="#382561" weight=78 icon="\uf06d"
//% groups='["Particles", "Images"]'
//% advanced=true
namespace effects {

    //% fixedInstances
    export class ImageEffect {
        protected effect: (image: Image, fastRandom ?: Math.FastRandom) => void;
        protected fastRandom: Math.FastRandom;

        constructor(effectFactory: (image: Image, fastRandom ?: Math.FastRandom) => void) {
            this.effect = effectFactory;
            this.fastRandom = new Math.FastRandom();
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
         * @param image 
         */
        //% blockId=imageEffectChange block="use %effect effect to change %image=variables_get(myImage)"
        //% group="Images"
        change(image: Image) {
            this.effect(image, this.fastRandom);
        }
    }

    //% fixedInstance whenUsed block="dissolve"
    export const dissolve = new ImageEffect((image: Image, r: Math.FastRandom) => {
        for (let i = (image.width * image.height) >> 4; i > 0; --i) {
            const x = r.randomRange(0, image.width)
            const y = r.randomRange(0, image.height)
            const w = r.randomRange(1, 3);
            const h = r.randomRange(1, 3);

            image.drawRect(x, y, w, h, 0);
        }
    });

    //% fixedInstance whenUsed block="melt"
    export const melt = new ImageEffect((image: Image, r: Math.FastRandom) => {
        const rounds = (image.width * image.height) >> 4;
        for (let j = 0; j < rounds; ++j) {
            let x = r.randomRange(0, image.width - 1)
            let y = r.randomRange(0, image.height - 3)
            let c = image.getPixel(x, y)
            image.setPixel(x, y + 1, c)
            image.setPixel(x, y + 2, c)
        }
    });
}