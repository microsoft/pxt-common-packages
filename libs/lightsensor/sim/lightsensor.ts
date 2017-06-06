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

    export function setLightThreshold(condition: number, value: number) {
        let b = lightSensorState();
        switch(condition) {
            case DAL.ANALOG_THRESHOLD_LOW: b.setLowThreshold(value); break;
            case DAL.ANALOG_THRESHOLD_HIGH: b.setHighThreshold(value); break;
        }
    }    
}
