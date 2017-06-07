namespace pxsim {
    export interface AccelerometerBoard extends CommonBoard {
        accelerometerState: AccelerometerState;
    }

    export function accelerometer(): AccelerometerState {
        return (board() as AccelerometerBoard).accelerometerState;
    }
}