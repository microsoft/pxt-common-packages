namespace pxsim {
    export interface AccelerometerBoard extends CommonBoard {
        accelerometerState: AccelerometerState;
        invertAccelerometerXAxis?: boolean;
        invertAccelerometerYAxis?: boolean;
        invertAccelerometerZAxis?: boolean;
    }

    export function accelerometer(): AccelerometerState {
        return (board() as AccelerometerBoard).accelerometerState;
    }
}