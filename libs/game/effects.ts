namespace effects {
    //% fixedInstances
    export class ImageEffect implements BackgroundEffect {

        // If used in an animation, this should be used as the default delay between method calls
        protected preferredDelay: number;
        protected effect: (image: Image, fastRandom?: Math.FastRandom) => void;
        protected fastRandom: Math.FastRandom;
        private times: number;

        constructor(defaultRate: number, effectFactory: (image: Image, fastRandom?: Math.FastRandom) => void) {
            this.effect = effectFactory;
            this.fastRandom = new Math.FastRandom();
            this.preferredDelay = defaultRate;
            this.times = undefined;
        }

        /**
         * Apply this effect to the image of the current sprite
         * @param sprite
         */
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
        change(input: Image) {
            this.effect(input, this.fastRandom);
        }

        /**
         * Make this effect occur repeatedly on the background image
         * @param times number of times effect should occur
         * @param delay delay between instances of the effect
         */
        startScreenEffect(times?: number, delay?: number): void {
            if (!game.currentScene().background.hasBackgroundImage()) return;
            const wasRunning = this.times != undefined;
            this.times = times ? times : 15;

            if (!wasRunning) {
                control.runInParallel(() => {
                    while (this.times > 0) {
                        this.change(scene.backgroundImage());
                        pause(delay ? delay : this.preferredDelay);
                        --this.times;
                    }
                    this.times = undefined;
                });
            }
        }
    }

    //% fixedInstance whenUsed block="dissolve"
    export const dissolve = new ImageEffect(100, (input: Image, r: Math.FastRandom) => {
        for (let i = (input.width * input.height) >> 5; i > 0; --i) {
            const x = r.randomRange(0, input.width)
            const y = r.randomRange(0, input.height)
            const w = r.randomRange(1, 3);
            const h = r.randomRange(1, 3);

            input.drawRect(x, y, w, h, 0);
        }
    });

    //% fixedInstance whenUsed block="melt"
    export const melt = new ImageEffect(125, (input: Image, r: Math.FastRandom) => {
        const rounds = (input.width * input.height) >> 5;
        for (let j = 0; j < rounds; ++j) {
            let x = r.randomRange(0, input.width - 1)
            let y = r.randomRange(0, input.height - 3)
            let c = input.getPixel(x, y)
            input.setPixel(x, y + 1, c)
            input.setPixel(x, y + 2, c)
        }
    });

    //% fixedInstance whenUsed block="slash"
    export const slash = new ImageEffect(125, (input: Image, r: Math.FastRandom) => {
        const rounds = 12;
        for (let j = 0; j < rounds; ++j) {
            let horizontal = r.randomBool();
            let length = r.randomRange(5, 50);
            let x = r.randomRange(0, input.width - (horizontal ? length : 1));
            let y = r.randomRange(0, input.height - (horizontal ? 3 : length));
            input.drawLine(x, y, horizontal ? x + length : x, horizontal ? y : y + length, 1);
        }
    });

    //% fixedInstance whenUsed block="splatter"
    export const splatter = new ImageEffect(125, (input: Image, r: Math.FastRandom) => {
        const imgs: Image[] = [
            img`
            . 1 .
            1 1 1
            . 1 1`,
            img`
            . 1 1 .
            1 1 1 1
            . 1 1 .`,
            img`
            . 1 1 1 .
            1 1 1 1 1
            1 1 1 1 1
            1 1 1 1 1
            . 1 1 1 .`,
            img`
            . . 1 1 . .
            . 1 1 1 1 .
            1 1 1 1 1 1
            1 1 1 1 1 1
            . 1 1 1 1 .
            . . 1 1 . .`,
            img`
            . . 1 1 1. .
            . 1 1 1 1 1 .
            1 1 1 1 1 1 1
            1 1 1 1 1 1 1
            1 1 1 1 1 1 1
            . 1 1 1 1 1 .
            . . 1 1 1. .`,
            img`
            . . 1 1 1 1 . .
            . 1 1 1 1 1 1 .
            1 1 1 1 1 1 1 1
            1 1 1 1 1 1 1 1
            1 1 1 1 1 1 1 1
            1 1 1 1 1 1 1 1
            . 1 1 1 1 1 1 .
            . . 1 1 1 1 . .`,
            img`
            . . . 1 1 1 . . .
            . . 1 1 1 1 1 . .
            . 1 1 1 1 1 1 1 .
            1 1 1 1 1 1 1 1 1
            1 1 1 1 1 1 1 1 1
            1 1 1 1 1 1 1 1 1
            . 1 1 1 1 1 1 1 .
            . . 1 1 1 1 1 . .
            . . . 1 1 1 . . .`,
        ];

        const rounds = 12;
        for (let j = 0; j < rounds; ++j) {
            const im = imgs[r.randomRange(0, imgs.length - 1)];
            const x = r.randomRange(0, input.width - im.width / 2);
            const y = r.randomRange(0, input.height - im.height / 2);
            input.drawImage(im, x, y);
        }
    });
}