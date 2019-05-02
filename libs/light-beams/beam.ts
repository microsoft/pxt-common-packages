namespace beams {
    export class BeamEngine {
        readonly strip: light.LightStrip;
        private _beams: Beam[];

        constructor(strip: light.LightStrip) {
            this.strip = strip;
            this.strip.setBrightness(255); // handled internally
            this.strip.setBuffered(true);
            this._beams = [];

            this.initHandlers();
        }

        public beams(): Beam[] {
            return this._beams.slice(0);
        }

        public addBeam(color: number, length?: number): Beam {
            if (!length) length = Math.max(4, this.strip.length() / 10);

            const b = new Beam(this);
            b.image = [];
            for (let i = 0; i < length; ++i)
                b.image[i] = color;
            b.brightness = easing.outQuad;
            this._beams.push(b);
            return b;
        }

        public removeBeam(beam: Beam) {
            this._beams.removeElement(beam);
        }

        private initHandlers() {
            let start = control.millis();
            control.runInBackground(() => {
                while (true) {
                    const now = control.millis();
                    let dt = now - start;
                    start = now;
                    this.physics(dt);
                    this.render(dt);
                    pause(1);
                }
            })
        }

        private physics(dt: number) {
            // move
            this._beams.forEach(beam => {
                const v = beam.v;
                beam.v += beam.a * dt;
                beam.p += (v + beam.v) * dt / 2;
            })
            // cleanup dead sprites
            this._beams = this._beams.filter(beam => !(beam.flags & BeamFlags.Destroyed));
        }

        private render(dt: number) {
            this.strip.clear()
            this._beams.forEach(beam => beam.render(dt));
            this.strip.show();
        }
    }

    export enum BeamFlags {
        None = 0,
        Wrap = 1 << 0,
        Destroyed = 1 << 2,
        DestroyOnExit = 1 << 3
    }

    export class Beam {
        readonly engine: BeamEngine;
        p: number;
        v: number;
        a: number;
        image: number[];
        brightness: easing.Easing;
        flags: BeamFlags;

        constructor(engine: BeamEngine) {
            this.engine = engine;
            this.p = 0;
            this.v = 0;
            this.a = 0;
            this.image = [0xff0000];
            this.flags = BeamFlags.None;
            this.brightness = easing.one;
        }

        get left() {
            return (this.p - this.image.length / 2) | 0;
        }

        get right() {
            return (this.p + this.image.length / 2) | 0;
        }

        destroy() {
            this.engine.destroy(this);
            this.flags |= BeamFlags.Destroyed;
        }

        render(dt: number) {
            if (this.flags & BeamFlags.Destroyed)
                return;

            const strip = this.engine.strip;
            const n = this.engine.strip.length();
            const si = this.p | 0;
            for (let i = 0; i < this.image.length; ++i) {
                let pi = si + i;
                if (this.flags & BeamFlags.Wrap) {
                    pi = pi % n;
                    if (pi < 0) pi += n;
                }
                const b = this.brightness(i / (this.image.length - 1));
                strip.blendPixelColor(pi, this.image[i], (b * 0xff) | 0);
            }
        }
    }
}