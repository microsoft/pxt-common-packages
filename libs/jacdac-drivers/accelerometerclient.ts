enum JDGesture {
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

const enum JDDimension {
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
    export class AccelerometerClient extends SensorClient {
        constructor(name: string) {
            super(name, jacdac.ACCELEROMETER_DEVICE_CLASS);
        }

        /**
         * Reads the current x value from the sensor
         */
        get x(): number {
            return this.get(JDDimension.X);
        }

        /**
         * Reads the current y value from the sensor
         */
        get y(): number {
            return this.get(JDDimension.Y);
        }

        /**
         * Reads the current z value from the sensor
         */
        get z(): number {
            return this.get(JDDimension.Z);
        }

        /**
         * Reads the current strength value from the sensor
         */
        get strength(): number {
            return this.get(JDDimension.Strength);
        }


        /**
         * Reads a value of the sensor
         * @param dimension which channel to read
         */
        //% blockId=jacdacaccget block="jacdac %accelerometer %dimension"
        //% group="Accelerometer" weight=5
        get(dimension: JDDimension): number {
            const s = this.state;
            if (!s || s.length < 6) return 0;
            switch (dimension) {
                case JDDimension.X:
                case JDDimension.Y:
                case JDDimension.Z:
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
        //% group="Accelerometer"
        onEvent(gesture: JDGesture, handler: () => void) {
            this.registerEvent(gesture, handler);
        }
    }

    //% fixedInstance whenUsed block="accelerometer"
    export const accelerometerClient = new AccelerometerClient("accelerometer");
}