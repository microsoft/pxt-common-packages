namespace easing {
    export function linear(t: number): number { return t; }
    export function inQuad(t: number): number { return t * t; }
    export function outQuad(t: number): number { return t * (2 - t); }
    export function inOutQuad(t: number): number { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    export function inCubic(t: number): number { return t * t * t; }
    export function outCubic(t: number): number { return (--t) * t * t + 1; }
    export function inOutCubic(t: number): number { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; }
}

namespace light {
    export class BrightnessTransition {
        constructor() { }
        apply(strip: LightStrip, t: number, start: number, end: number): void {

        }
    }

    export class EasingBrightnessTransition extends BrightnessTransition {
        private timeEasing: (t: number) => number;
        private spatialEasing: (t: number) => number;

        constructor(
            timeEasing: (t: number) => number, 
            spatialEasing?: (t: number) => number) {
            super();
            this.timeEasing = timeEasing || easing.inOutQuad;
            this.spatialEasing = spatialEasing;
        }

        apply(strip: LightStrip, t: number, start: number, end: number): void {
            // t in [0..1]
            const db = end - start;
            const b = this.timeEasing(t); // [0..1]
            if (!this.spatialEasing) {
                strip.setBrightness(start + db * b);
            }
            else {
                // convolve desired brightness with spacial easing function
                const n = strip.length();
                for (let i = 0; i < n; ++i) {
                    const x = this.spatialEasing(i / (n - 1)); // [0..1]
                    strip.setPixelBrightness(i, end - db * (1 - b) * x);
                }
            }
        }
    }

    export class BrightnessTransitionPlayer {
        private transition: BrightnessTransition;
        private startBrightness: number;
        private endBrightness: number;
        private duration: number;
        private startTime: number;
        private repeat: number;
        private yoyo: number;

        constructor(
            transition: BrightnessTransition,
            startBrightness: number,
            endBrightness: number,
            duration: number,
            repeat: number,
            yoyo: boolean) {
            this.transition = transition;
            this.startBrightness = startBrightness;
            this.endBrightness = endBrightness;
            this.duration = duration;
            this.startTime = control.millis();
            this.repeat = repeat || 1;
            this.yoyo = yoyo ? 1 : 0;
        }

        update(strip: LightStrip): boolean {
            let elapsed = control.millis() - this.startTime;
            if (elapsed > this.duration) {
                this.yoyo = -this.yoyo;
                if (this.repeat > 0)
                    this.repeat--;
                this.startTime = control.millis();
                elapsed = 0;
                return this.repeat != 0;
            }

            let t = elapsed / this.duration;
            if (this.yoyo < 0)
                t = 1 - t;
            this.transition.apply(strip, t, this.startBrightness, this.endBrightness);
            return true;
        }
    }
}