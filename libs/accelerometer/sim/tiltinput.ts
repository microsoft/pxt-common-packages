namespace pxsim.visuals {
    /** Magnitude of a full-scale accelerometer reading on one axis (1 g). */
    const FULL_SCALE = 1023;
    /** Factor each decay step multiplies the x and y readings by. */
    const DECAY_FACTOR = 0.85;
    /** Largest x and y magnitude at which a decaying tilt snaps to flat. */
    const SETTLE_THRESHOLD = 24;
    /** Interval between decay steps, in milliseconds. */
    const DECAY_INTERVAL_MS = 50;
    /** Element rotation, in degrees, per unit of x or y reading. */
    const DEGREES_PER_UNIT = 8 / FULL_SCALE;
    /** Upper bound on the fraction by which a tilt shrinks the element. */
    const MAX_SCALE_REDUCTION = 0.1;
    /** Divisor of the squared tilt fraction in the element's shrink. */
    const SCALE_DIVISOR = 35;
    /** CSS perspective distance of the tilted element. */
    const PERSPECTIVE = "30em";

    /**
     * Pointer input that tilts a simulated board. While the accelerometer is
     * active, the pointer position over the attached element sets the
     * acceleration of `state` and rotates the element to match; when the
     * pointer leaves, the tilt decays toward flat in steps every 50 ms.
     */
    export class AccelerometerTiltInput {
        private tiltDecayer: number = 0;
        private element: HTMLElement | SVGElement;
        private moveHandler: (ev: MouseEvent) => void;
        private leaveHandler: () => void;

        /**
         * @param state the accelerometer state that pointer movement updates
         */
        constructor(private state: AccelerometerState) {
        }

        /**
         * Starts listening for pointer movement over `element`, detaching
         * from any element attached before.
         */
        attach(element: HTMLElement | SVGElement): void {
            this.detach();
            this.element = element;
            this.moveHandler = (ev: MouseEvent) => {
                if (!this.state.accelerometer.isActive) return;
                if (this.tiltDecayer) {
                    clearInterval(this.tiltDecayer);
                    this.tiltDecayer = 0;
                }

                const bbox = element.getBoundingClientRect();
                const ax = (ev.clientX - bbox.width / 2) / (bbox.width / 3);
                const ay = (ev.clientY - bbox.height / 2) / (bbox.height / 3);

                const x = - Math.max(- FULL_SCALE, Math.min(FULL_SCALE, Math.floor(ax * FULL_SCALE)));
                const y = Math.max(- FULL_SCALE, Math.min(FULL_SCALE, Math.floor(ay * FULL_SCALE)));
                const z2 = FULL_SCALE * FULL_SCALE - x * x - y * y;
                const z = Math.floor((z2 > 0 ? -1 : 1) * Math.sqrt(Math.abs(z2)));

                this.state.accelerometer.update(-x, y, z);
                this.updateTilt();
            };
            this.leaveHandler = () => {
                if (!this.state.accelerometer.isActive) return;

                if (!this.tiltDecayer) {
                    this.tiltDecayer = setInterval(() => {
                        let accx = this.state.accelerometer.getX();
                        accx = Math.floor(Math.abs(accx) * DECAY_FACTOR) * (accx > 0 ? 1 : -1);
                        let accy = this.state.accelerometer.getY();
                        accy = Math.floor(Math.abs(accy) * DECAY_FACTOR) * (accy > 0 ? 1 : -1);
                        let accz = -Math.sqrt(Math.max(0, FULL_SCALE * FULL_SCALE - accx * accx - accy * accy));
                        if (Math.abs(accx) <= SETTLE_THRESHOLD && Math.abs(accy) <= SETTLE_THRESHOLD) {
                            clearInterval(this.tiltDecayer);
                            this.tiltDecayer = 0;
                            accx = 0;
                            accy = 0;
                            accz = -FULL_SCALE;
                        }
                        this.state.accelerometer.update(accx, accy, accz);
                        this.updateTilt();
                    }, DECAY_INTERVAL_MS);
                }
            };
            this.element.addEventListener(pointerEvents.move, this.moveHandler, false);
            this.element.addEventListener(pointerEvents.leave, this.leaveHandler, false);
        }

        /**
         * Removes the pointer listeners from the attached element, if any,
         * clears its transform, perspective and perspective origin, and
         * stops a tilt decay in progress. When an element was attached and
         * the accelerometer is active, sets the reading to flat
         * (0, 0, -1023).
         */
        detach(): void {
            clearInterval(this.tiltDecayer);
            this.tiltDecayer = 0;
            if (this.element) {
                this.element.removeEventListener(pointerEvents.move, this.moveHandler, false);
                this.element.removeEventListener(pointerEvents.leave, this.leaveHandler, false);
                this.element.style.transform = "";
                this.element.style.perspective = "";
                this.element.style.perspectiveOrigin = "";
                if (this.state.accelerometer.isActive)
                    this.state.accelerometer.update(0, 0, -FULL_SCALE);
            }
            this.element = undefined;
            this.moveHandler = undefined;
            this.leaveHandler = undefined;
        }

        private updateTilt() {
            if (!this.state.accelerometer.isActive || !this.element) return;

            const x = this.state.accelerometer.getX();
            const y = this.state.accelerometer.getY();
            const s = 1 - Math.min(MAX_SCALE_REDUCTION, Math.pow(Math.max(Math.abs(x), Math.abs(y)) / FULL_SCALE, 2) / SCALE_DIVISOR);

            this.element.style.transform = `perspective(${PERSPECTIVE}) rotateX(${y * DEGREES_PER_UNIT}deg) rotateY(${x * DEGREES_PER_UNIT}deg) scale(${s}, ${s})`;
            this.element.style.perspectiveOrigin = "50% 50% 50%";
            this.element.style.perspective = PERSPECTIVE;
        }
    }
}
