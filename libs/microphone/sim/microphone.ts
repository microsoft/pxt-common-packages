namespace pxsim.input {
    export function soundLevel(): number {
        let b = microphoneState();
        b.setUsed();
        return b.getLevel();
    }

    export function onLoudSound(body: RefAction) {
        let b = microphoneState();
        b.setUsed();
        pxtcore.registerWithDal(b.id, DAL.LEVEL_THRESHOLD_HIGH, body);
    }

    export function setLoudSoundThreshold(value: number) {
        let b = microphoneState();
        b.setUsed();
        b.setHighThreshold(value);
    }
}
