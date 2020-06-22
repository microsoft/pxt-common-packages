namespace pxsim {
    export interface MicrophoneBoard {
        microphoneState: AnalogSensorState;
    }

    export function microphoneState() {
        return (board() as any as MicrophoneBoard).microphoneState;
    }
}