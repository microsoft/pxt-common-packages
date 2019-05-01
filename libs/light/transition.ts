namespace light {
    export type Easing = (t: number) => number;
    namespace easing {
        export function constant(t: number): number { return 1; }
        export function linear(t: number): number { return t; }
        export function inQuad(t: number): number { return t * t; }
        export function outQuad(t: number): number { return t * (2 - t); }
        export function inOutQuad(t: number): number { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
        export function inCubic(t: number): number { return t * t * t; }
        export function outCubic(t: number): number { return (--t) * t * t + 1; }
        export function inOutCubic(t: number): number { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; }
    }

    export class TransitionPlayer {
        private transition: Transition;
        private duration: number;
        private startTime: number;

        constructor(transition: Transition, duration: number) {
            this.transition = transition;
            this.duration = duration;
            this.startTime = control.millis();
        }

        update(strip: LightStrip): boolean {
            const elapsed = control.millis() - this.startTime;
            if (elapsed > this.duration)
                return false;
            else {
                const t = elapsed / this.duration;
                this.transition.apply(t, strip);
                return true;
            }
        }
    }

    export class Transition {
        private brightessEasing: Easing;
        private spatialEasing: Easing;
        private rotationEasing: Easing;

        constructor(brightnessEasing: Easing, spatialEasing: Easing, rotationEasing: Easing) {
            this.brightessEasing = brightnessEasing;
            this.spatialEasing = spatialEasing;
            this.rotationEasing = rotationEasing;
        }

        apply(t: number, strip: LightStrip): void {
            // t in [0..1]
            const b = this.brightessEasing(t); // [0..1]
            if (!this.spatialEasing && !this.rotationEasing)
                strip.setBrightness((b * 0xff) | 0);
            else {
                // convolve desired brightness with spacial easing function
                const n = strip.length();
                for(let i = 0; i < n; ++i) {
                    const ti = i / (n - 1);
                    let bi = 1;
                    if (this.spatialEasing)
                        bi *= this.spatialEasing(ti);
                    if (this.rotationEasing)
                        bi *= this.rotationEasing(ti);
                    strip.setPixelBrightness(i, bi);
                }
            }
        }
    }
}