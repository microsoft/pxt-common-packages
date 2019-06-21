const enum PromixityEvent {
    //% block="close"
    Close = DAL.LEVEL_THRESHOLD_LOW,
    //% block="far"
    Far = DAL.LEVEL_THRESHOLD_HIGH
}

namespace sensors {
    export class PromixitySensor {
        private _levelDetector: pins.LevelDetector;

        constructor() {
        }

        distance(): number {
            return -1;
        }

        private levelDetector(): pins.LevelDetector {
            if (!this._levelDetector) {
                this._levelDetector = new pins.LevelDetector(9901, 0, 1023, 45, 600);
                control.runInBackground(() => {
                    while(true) {
                        this._levelDetector.level = this.distance();
                        pause(20);
                    }
                })
            }
            return this._levelDetector;
        }

        /**
         * Registers an event when a level is detected
         * @param event
         * @param handler
         */
        onDistanceEvent(event: PromixityEvent, handler: () => void) {
            const ld = this.levelDetector();
            control.onEvent(ld.id, event, handler);
        }
    }
}

namespace input {
    let _sensor: sensors.PromixitySensor;
    function proximitySensor(): sensors.PromixitySensor {
        if (!_sensor)
            _sensor = new vl53l0x.VL53L0X();
        return _sensor;
    }
    /**
     * Gets the distance measured by the proximity sensor
     */
    //% blockId=proximity_distance block="distance"
    export function distance(): number {
        const sensor = proximitySensor();
        if (!sensor) return -1;
        return sensor.distance();
    }

    /**
     * Registers a distance event
     * @param event
     * @param handler
     */
    export function onDistanceEvent(event: PromixityEvent, handler: () => void) {
        const sensor = proximitySensor();
        if (sensor)
            sensor.onDistanceEvent(event, handler);
    }
}