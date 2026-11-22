/// <reference path="../../../core/sim/core/analogSensor.ts" />

namespace pxsim {
    export interface MicrophoneBoard {
        microphoneState: MicrophoneState;
    }

    export class MicrophoneState extends AnalogSensorState {
        public onSoundRegistered: boolean = false;
        public soundLevelRequested: boolean = false;
        private pingUsed: host.TimerHandle;

        public pingSoundLevel = () => {
            if (this.onSoundRegistered) {
                return;
            }
            this.soundLevelRequested = true;
            runtime.queueDisplayUpdate();
            host.timers().clearTimeout(this.pingUsed);
            this.pingUsed = host.timers().setTimeout(() => {
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