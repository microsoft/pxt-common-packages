namespace pxsim.visuals {
    /** The accelerometer reading for 1 g on one axis. */
    const FULL_SCALE = 1023;
    /** How much of the tilt is left after each decay step. */
    const DECAY_FACTOR = 0.85;
    /** A decaying tilt snaps to flat once x and y are both this small. */
    const SETTLE_THRESHOLD = 24;
    const DECAY_INTERVAL_MS = 50;
    const DEGREES_PER_UNIT = 8 / FULL_SCALE;
    /** The most a tilt shrinks the board image, as a fraction of its size. */
    const MAX_SCALE_REDUCTION = 0.1;
    const SCALE_DIVISOR = 35;
    const PERSPECTIVE = "30em";

    /**
     * Tilts a simulated board with the pointer. While the accelerometer is active, moving the
     * pointer over the board image sets the acceleration and rotates the image to match. When the
     * pointer leaves, the tilt decays back to flat.
     */
    export class AccelerometerTiltInput {
        private tiltDecayer: number = 0;
        private element: HTMLElement | SVGElement;
        private moveHandler: (ev: MouseEvent) => void;
        private leaveHandler: () => void;

        constructor(private state: AccelerometerState) {
        }

        /** Starts following the pointer over `element`. Detaches from the previous element first. */
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
         * Stops following the pointer and clears the element's tilt. If the accelerometer is
         * active, the reading goes back to flat.
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
