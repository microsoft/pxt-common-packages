namespace sensors {
    export class PromixitySensor {
        constructor() {

        }

        distance(): number {
            return -1;
        }
    }
}

namespace input {
    let _sensor: sensors.PromixitySensor;
    /**
     * Gets the distance measured by the proximity sensor
     */
    //% blockId=proximity_distance block="distance"
    export function distance(): number {
        if (!_sensor)
            _sensor = new vl53l0x.VL53L0X();
        const d = _sensor.distance();
        return d;
    }
}