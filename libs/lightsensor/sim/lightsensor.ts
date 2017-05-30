namespace pxsim.input {
    export function lightLevel(): number {
        let b = lightSensorState();
        b.setUsed();

        return b.getLevel();
    }

    export function onLightConditionChanged(condition: number, body: RefAction) {
        let b = lightSensorState();
        b.setUsed();

        pxtcore.registerWithDal(b.id, condition, body);
    }
}
