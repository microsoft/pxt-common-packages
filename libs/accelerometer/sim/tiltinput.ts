namespace pxsim.visuals {
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

                let bbox = element.getBoundingClientRect();
                let ax = (ev.clientX - bbox.width / 2) / (bbox.width / 3);
                let ay = (ev.clientY - bbox.height / 2) / (bbox.height / 3);

                let x = - Math.max(- 1023, Math.min(1023, Math.floor(ax * 1023)));
                let y = Math.max(- 1023, Math.min(1023, Math.floor(ay * 1023)));
                let z2 = 1023 * 1023 - x * x - y * y;
                let z = Math.floor((z2 > 0 ? -1 : 1) * Math.sqrt(Math.abs(z2)));

                this.state.accelerometer.update(-x, y, z);
                this.updateTilt();
            };
            this.leaveHandler = () => {
                if (!this.state.accelerometer.isActive) return;

                if (!this.tiltDecayer) {
                    this.tiltDecayer = setInterval(() => {
                        let accx = this.state.accelerometer.getX();
                        accx = Math.floor(Math.abs(accx) * 0.85) * (accx > 0 ? 1 : -1);
                        let accy = this.state.accelerometer.getY();
                        accy = Math.floor(Math.abs(accy) * 0.85) * (accy > 0 ? 1 : -1);
                        let accz = -Math.sqrt(Math.max(0, 1023 * 1023 - accx * accx - accy * accy));
                        if (Math.abs(accx) <= 24 && Math.abs(accy) <= 24) {
                            clearInterval(this.tiltDecayer);
                            this.tiltDecayer = 0;
                            accx = 0;
                            accy = 0;
                            accz = -1023;
                        }
                        this.state.accelerometer.update(accx, accy, accz);
                        this.updateTilt();
                    }, 50)
                }
            };
            this.element.addEventListener(pointerEvents.move, this.moveHandler, false);
            this.element.addEventListener(pointerEvents.leave, this.leaveHandler, false);
        }

        /**
         * Removes the pointer listeners from the attached element, if any,
         * and stops a tilt decay in progress.
         */
        detach(): void {
            if (this.element) {
                this.element.removeEventListener(pointerEvents.move, this.moveHandler, false);
                this.element.removeEventListener(pointerEvents.leave, this.leaveHandler, false);
            }
            clearInterval(this.tiltDecayer);
            this.tiltDecayer = 0;
            this.element = undefined;
            this.moveHandler = undefined;
            this.leaveHandler = undefined;
        }

        private updateTilt() {
            if (!this.state.accelerometer.isActive || !this.element) return;

            const x = this.state.accelerometer.getX();
            const y = this.state.accelerometer.getY();
            const af = 8 / 1023;
            const s = 1 - Math.min(0.1, Math.pow(Math.max(Math.abs(x), Math.abs(y)) / 1023, 2) / 35);

            this.element.style.transform = `perspective(30em) rotateX(${y * af}deg) rotateY(${x * af}deg) scale(${s}, ${s})`
            this.element.style.perspectiveOrigin = "50% 50% 50%";
            this.element.style.perspective = "30em";
        }
    }
}
