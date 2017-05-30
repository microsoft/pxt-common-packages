namespace pxsim {
    export interface TemperatureBoard extends CommonBoard {
        thermometerState: AnalogSensorState;
        thermometerUnitState: ThermometerUnit;
    }

    export function thermometerState(): AnalogSensorState {
        return (board() as TemperatureBoard).thermometerState;
    }

    export function setThermometerUnit(unit: ThermometerUnit) {
        (board() as TemperatureBoard).thermometerUnitState = unit;
    }
}