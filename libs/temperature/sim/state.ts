namespace pxsim {
    export interface TemperatureBoard extends CommonBoard {
        thermometerState: AnalogSensorState;
        thermometerUnitState: TemperatureUnit;
    }

    export function thermometerState(): AnalogSensorState {
        return (board() as TemperatureBoard).thermometerState;
    }

    export function setThermometerUnit(unit: TemperatureUnit) {
        (board() as TemperatureBoard).thermometerUnitState = unit;
    }
}