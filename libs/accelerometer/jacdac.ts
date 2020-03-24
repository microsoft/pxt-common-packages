namespace jacdac {
    export class AccelerometerService extends jacdac.SensorHost {
        constructor(name: string) {
            super("acc", jd_class.ACCELEROMETER);
            // TODO: catch all event
            input.onGesture(Gesture.Shake, () => this.raiseHostEvent(JDGesture.Shake));
            input.onGesture(Gesture.TiltUp, () => this.raiseHostEvent(JDGesture.TiltUp));
            input.onGesture(Gesture.TiltDown, () => this.raiseHostEvent(JDGesture.TiltDown));
            input.onGesture(Gesture.TiltLeft, () => this.raiseHostEvent(JDGesture.TiltLeft));
            input.onGesture(Gesture.TiltRight, () => this.raiseHostEvent(JDGesture.TiltRight));
            input.onGesture(Gesture.FaceUp, () => this.raiseHostEvent(JDGesture.FaceUp));
            input.onGesture(Gesture.FaceDown, () => this.raiseHostEvent(JDGesture.FaceDown));
            input.onGesture(Gesture.FreeFall, () => this.raiseHostEvent(JDGesture.FreeFall));
            input.onGesture(Gesture.ThreeG, () => this.raiseHostEvent(JDGesture.ThreeG));
            input.onGesture(Gesture.SixG, () => this.raiseHostEvent(JDGesture.SixG));
            input.onGesture(Gesture.EightG, () => this.raiseHostEvent(JDGesture.EightG));
            input.onGesture(Gesture.TwoG, () => this.raiseHostEvent(JDGesture.TwoG));
        }

        raiseCustomGestureEvent(id: number) {
            this.raiseHostEvent(JDGesture.TwoG + 1 + (id | 0));
        }

        protected serializeState(): Buffer {
            const buf = control.createBuffer(6);
            buf.setNumber(NumberFormat.Int16LE, 0, input.acceleration(Dimension.X));
            buf.setNumber(NumberFormat.Int16LE, 2, input.acceleration(Dimension.Y));
            buf.setNumber(NumberFormat.Int16LE, 4, input.acceleration(Dimension.Z));
            return buf;
        }
    }

    //% fixedInstance whenUsed block="accelerometer service"
    export const accelerometerService = new AccelerometerService("acc");
}