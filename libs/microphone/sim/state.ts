/// <reference path="../../core/sim/analogSensor.ts" />

namespace pxsim {
    export interface MicrophoneBoard {
        microphoneState: MicrophoneState;
    }

    export class MicrophoneState extends AnalogSensorState {
        public onSoundRegistered: boolean = false;
        public soundLevelRequested: boolean = false;
        private pingUsed: ReturnType<typeof setTimeout>;

        public pingSoundLevel = () => {
            if (this.onSoundRegistered) {
                return;
            }
            this.soundLevelRequested = true;
            runtime.queueDisplayUpdate();
            clearTimeout(this.pingUsed);
            this.pingUsed = setTimeout(() => {
                this.soundLevelRequested = false;
                runtime.queueDisplayUpdate();
                this.pingUsed = undefined;
            }, 100);
        }

    }

    export function microphoneState() {
        return (board() as any as MicrophoneBoard).microphoneState;
    }
}