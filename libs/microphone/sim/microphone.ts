namespace pxsim.input {
    export function soundLevel(): number {
        let b = microphoneState();
        if (!b) return 0;
        b.setUsed();
        return b.getLevel();
    }

    export function onLoudSound(body: RefAction) {
        let b = microphoneState();
        if (!b) return;
        b.setUsed();
        pxtcore.registerWithDal(b.id, DAL.LEVEL_THRESHOLD_HIGH, body);
    }

    export function setLoudSoundThreshold(value: number) {
        let b = microphoneState();
        if (!b) return;
        b.setUsed();
        b.setHighThreshold(value);
    }
}
