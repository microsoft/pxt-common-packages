enum JacdacGesture {
    /**
     * Raised when shaken
     */
    //% block=shake
    Shake = DAL.ACCELEROMETER_EVT_SHAKE,
    /**
     * Raised when the device tilts up
     */
    //% block="tilt up"
    TiltUp = DAL.ACCELEROMETER_EVT_TILT_UP,
    /**
     * Raised when the device tilts down
     */
    //% block="tilt down"
    TiltDown = DAL.ACCELEROMETER_EVT_TILT_DOWN,
    /**
     * Raised when the screen is pointing left
     */
    //% block="tilt left"
    TiltLeft = DAL.ACCELEROMETER_EVT_TILT_LEFT,
    /**
     * Raised when the screen is pointing right
     */
    //% block="tilt right"
    TiltRight = DAL.ACCELEROMETER_EVT_TILT_RIGHT,
    /**
     * Raised when the screen faces up
     */
    //% block="face up"
    FaceUp = DAL.ACCELEROMETER_EVT_FACE_UP,
    /**
     * Raised when the screen is pointing up and the board is horizontal
     */
    //% block="face down"
    FaceDown = DAL.ACCELEROMETER_EVT_FACE_DOWN,
    /**
     * Raised when the board is falling!
     */
    //% block="free fall"
    FreeFall = DAL.ACCELEROMETER_EVT_FREEFALL,
    /**
    * Raised when a 3G shock is detected
    */
    //% block="3g"
    ThreeG = DAL.ACCELEROMETER_EVT_3G,
    /**
    * Raised when a 6G shock is detected
    */
    //% block="6g"
    SixG = DAL.ACCELEROMETER_EVT_6G,
    /**
    * Raised when a 8G shock is detected
    */
    //% block="8g"
    EightG = DAL.ACCELEROMETER_EVT_8G
}

const enum JacdacDimension {
    //% block=x
    X = 0,
    //% block=y
    Y = 1,
    //% block=z
    Z = 2,
    //% block=strength
    Strength = 3
}

namespace jacdac {
    //% fixedInstances
    export class AccelerometerVirtualDriver extends SensorVirtualDriver {
        constructor(name: string) {
            super(name, DAL.JD_DRIVER_CLASS_ACCELEROMETER);
        }

        /**
         * Reads the current x value from the sensor
         */
        get x(): number {
            return this.get(JacdacDimension.X);
        }

        /**
         * Reads the current y value from the sensor
         */
        get y(): number {
            return this.get(JacdacDimension.Y);
        }

        /**
         * Reads the current z value from the sensor
         */
        get z(): number {
            return this.get(JacdacDimension.Z);
        }

        /**
         * Reads the current strength value from the sensor
         */
        get strength(): number {
            return this.get(JacdacDimension.Strength);
        }


        /**
         * Reads a value of the sensor
         * @param dimension which channel to read
         */
        //% blockId=jacdacaccget block="jacdac %accelerometer %dimension"
        //% group="Input" weight=5
        get(dimension: JacdacDimension): number {
            const s = this.state;
            if (!s) return 0;
            switch (dimension) {
                case JacdacDimension.X:
                case JacdacDimension.Y:
                case JacdacDimension.Z:
                    return s.getNumber(NumberFormat.Int16LE, dimension * 2);
                default: // strength
                    let r = 0;
                    for (let i = 0; i < 3; ++i) {
                        const x = s.getNumber(NumberFormat.Int16LE, i * 2);
                        r += x * x;
                    }
                    return Math.sqrt(r);
            }
        }

        /**
         * Runs code when an event happens on the sensor
         * @param gesture 
         * @param handler 
         */
        //% blockId=jacadacacconevent block="jacdac %accelerometer on %gesture"
        //% group="Input"
        onEvent(gesture: JacdacGesture, handler: () => void) {
            control.onEvent(this.id, gesture, handler);
        }
    }

    //% fixedInstance whenUsed
    export const accelerometer = new AccelerometerVirtualDriver("accelerometer");
}