namespace pxsim {
    export interface LightSensorBoard extends CommonBoard {
        lightSensorState: AnalogSensorState;
    }

    export function lightSensorState() {
        return (board() as LightSensorBoard).lightSensorState;
    }
}