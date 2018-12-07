namespace jacdac {
    export class AccelerometerService extends jacdac.SensorService {
        constructor(name: string) {
            super(name, jacdac.ACCELEROMETER_DEVICE_CLASS);
            input.onGesture(Gesture.Shake, () => this.raiseHostEvent(Gesture.Shake));
            input.onGesture(Gesture.TiltUp, () => this.raiseHostEvent(Gesture.TiltUp));
            input.onGesture(Gesture.TiltDown, () => this.raiseHostEvent(Gesture.TiltDown));
            input.onGesture(Gesture.TiltLeft, () => this.raiseHostEvent(Gesture.TiltLeft));
            input.onGesture(Gesture.TiltRight, () => this.raiseHostEvent(Gesture.TiltRight));
            input.onGesture(Gesture.FaceUp, () => this.raiseHostEvent(Gesture.FaceUp));
            input.onGesture(Gesture.FaceDown, () => this.raiseHostEvent(Gesture.FaceDown));
            input.onGesture(Gesture.FreeFall, () => this.raiseHostEvent(Gesture.FreeFall));
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
    export const accelerometerService = new AccelerometerService("accelerometer");
}