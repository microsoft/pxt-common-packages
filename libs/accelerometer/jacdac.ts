namespace jacdac {
    export class AccelerometerService extends jacdac.SensorService {
        constructor(name: string) {
            super("acc", jacdac.ACCELEROMETER_DEVICE_CLASS);
            // TODO: catch all event
            input.onGesture(Gesture.Shake, () => this.raiseHostEvent(JDGesture.Shake));
            input.onGesture(Gesture.TiltUp, () => this.raiseHostEvent(JDGesture.TiltUp));
            input.onGesture(Gesture.TiltDown, () => this.raiseHostEvent(JDGesture.TiltDown));
            input.onGesture(Gesture.TiltLeft, () => this.raiseHostEvent(JDGesture.TiltLeft));
            input.onGesture(Gesture.TiltRight, () => this.raiseHostEvent(JDGesture.TiltRight));
            input.onGesture(Gesture.FaceUp, () => this.raiseHostEvent(JDGesture.FaceUp));
            input.onGesture(Gesture.FaceDown, () => this.raiseHostEvent(JDGesture.FaceDown));
            input.onGesture(Gesture.FreeFall, () => this.raiseHostEvent(JDGesture.FreeFall));
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