namespace pxsim {
    export interface MicrophoneBoard extends CommonBoard {
        microphoneState: AnalogSensorState;
    }

    export function microphoneState() {
        return (board() as MicrophoneBoard).microphoneState;
    }
}