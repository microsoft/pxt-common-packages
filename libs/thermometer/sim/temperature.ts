namespace pxsim {
    export enum TemperatureUnit {
        Celsius,
        Fahrenheit
    }
}

namespace pxsim.input {

    export function temperature(unit: number): number {
        let b = thermometerState();
        b.setUsed();
        setThermometerUnit(unit);

        const deg = b.getLevel();
        return  unit == pxsim.TemperatureUnit.Celsius ? deg 
            : ((deg * 18) / 10 + 32) >> 0;
    }

    export function onTemperateConditionChanged(condition: number, temperature: number, unit: number, body: RefAction) {
        let b = thermometerState();
        b.setUsed();
        setThermometerUnit(unit);

        const t = unit == pxsim.TemperatureUnit.Celsius 
            ? temperature 
            : (((temperature - 32) * 10) / 18 >> 0);
        
        if (condition === DAL.ANALOG_THRESHOLD_HIGH) {
            b.setHighThreshold(t);
        }
        else {
            b.setLowThreshold(t);
        }

        pxtcore.registerWithDal(b.id, condition, body);
    }
}