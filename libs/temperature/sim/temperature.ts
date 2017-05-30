namespace pxsim {
    export enum ThermometerUnit {
        Celsius,
        Fahrenheit
    }
}

namespace pxsim.input {

    export function temperature(unit: number): number {
        let b = thermometerState();
        b.setUsed();
        setThermometerUnit(unit);
        return b.getLevel();
    }

    export function onTemperateConditionChanged(condition: number, temperature: number, body: RefAction) {
        let b = thermometerState();
        b.setUsed();
        setThermometerUnit(pxsim.ThermometerUnit.Celsius);

        if (condition === DAL.ANALOG_THRESHOLD_HIGH) {
            b.setHighThreshold(temperature);
        }
        else {
            b.setLowThreshold(temperature);
        }

        pxtcore.registerWithDal(b.id, condition, body);
    }
}