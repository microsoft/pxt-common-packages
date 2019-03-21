namespace jacdac {
    export class MicrophoneService extends jacdac.SensorService {
        constructor(name: string) {
            super(name, jacdac.MICROPHONE_DEVICE_CLASS);
            input.onLoudSound(() => this.raiseHostEvent(DAL.LEVEL_THRESHOLD_HIGH));
        }

        protected serializeState(): Buffer {
            const buf = control.createBuffer(1);
            buf.setNumber(NumberFormat.UInt8LE, 0, input.soundLevel());
            return buf;
        }
    }

    //% fixedInstance whenUsed block="microphone service"
    export const microphoneService = new MicrophoneService("microphone");
}