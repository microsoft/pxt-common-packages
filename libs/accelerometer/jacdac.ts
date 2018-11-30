namespace jacdac {
    export class AccelerometerHostDriver extends jacdac.SensorHostDriver {
        constructor(name: string) {
            super(name, jacdac.ACCELEROMETER_DRIVER_CLASS);
            input.acceleration(Dimension.X); // turn on sensor
            control.onEvent(DAL.DEVICE_ID_GESTURE, DAL.ACCELEROMETER_EVT_SHAKE, () => this.raiseHostEvent(DAL.ACCELEROMETER_EVT_SHAKE));
        }

        /* handleGestureEvent(value: number): void {
            switch (value) {
                case DAL.ACCELEROMETER_EVT_SHAKE:
                case DAL.ACCELEROMETER_EVT_3G:
                case DAL.ACCELEROMETER_EVT_6G:
                case DAL.ACCELEROMETER_EVT_8G:
                case DAL.ACCELEROMETER_EVT_FACE_DOWN:
                case DAL.ACCELEROMETER_EVT_FACE_UP:
                case DAL.ACCELEROMETER_EVT_FREEFALL:
                case DAL.ACCELEROMETER_EVT_TILT_LEFT:
                case DAL.ACCELEROMETER_EVT_TILT_UP:
                case DAL.ACCELEROMETER_EVT_TILT_DOWN:
                case DAL.ACCELEROMETER_EVT_TILT_UP:
                    this.raiseHostEvent(value);
            }
        }*/

        protected serializeState(): Buffer {
            const buf = control.createBuffer(6);
            buf.setNumber(NumberFormat.Int16LE, 0, input.acceleration(Dimension.X));
            buf.setNumber(NumberFormat.Int16LE, 2, input.acceleration(Dimension.Y));
            buf.setNumber(NumberFormat.Int16LE, 4, input.acceleration(Dimension.Z));
            return buf;
        }
    }
}