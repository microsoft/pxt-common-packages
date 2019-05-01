namespace easing {
    export function linear(t: number): number { return t; }
    export function inQuad(t: number): number { return t * t; }
    export function outQuad(t: number): number { return t * (2 - t); }
    export function inOutQuad(t: number): number { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    export function inCubic(t: number): number { return t * t * t; }
    export function outCubic(t: number): number { return (--t) * t * t + 1; }
    export function inOutCubic(t: number): number { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; }
    export type Easing = (t: number) => number;
}

namespace light {
    export class BrightnessTransition {
        private timeEasing: easing.Easing;
        private spatialEasing: easing.Easing;

        constructor(
            timeEasing: easing.Easing, spatialEasing?: easing.Easing) {
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
                    const x = i / (n - 1);
                    const bi = b * this.spatialEasing(x);
                    strip.setPixelBrightness(i, start + db * bi);
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

        constructor(
            transition: BrightnessTransition,
            startBrightness: number,
            endBrightness: number,
            duration: number) {
            this.transition = transition;
            this.startBrightness = startBrightness;
            this.endBrightness = endBrightness;
            this.duration = duration;
            this.startTime = control.millis();
        }

        update(strip: LightStrip): boolean {
            const elapsed = control.millis() - this.startTime;
            if (elapsed > this.duration)
                return false;
            else {
                const t = elapsed / this.duration;
                this.transition.apply(strip, t, this.startBrightness, this.endBrightness);
                return true;
            }
        }
    }
}