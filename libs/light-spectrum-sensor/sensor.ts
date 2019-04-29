namespace sensors {
    export interface LightSpectrum {
        full: number;
        infrared: number;
        visible: number;
    }

    export abstract class LightSpectrumSensor {
        private reading: boolean;
        private _spectrum: LightSpectrum;
        constructor() {
            this.reading = false;
            this._spectrum = {
                full: -1, infrared: -1, visible: -1
            }
        }
        protected abstract readSpectrum(): LightSpectrum;
        protected startReading() {
            if (this.reading) return;
            control.runInBackground(() => {
                while (this.reading) {
                    this._spectrum = this.readSpectrum();
                    pause(1);
                }
            });
        }

        get spectrum(): LightSpectrum {
            if (!this.reading) {
                this._spectrum = this.readSpectrum();
                this.startReading();
            }
            return this._spectrum;
        }
        onEvent(event: JDLightSpectrumEvent, handler: () => void): void {
            this.startReading();

        }
    }
}

namespace input {
    let _sensor: sensors.LightSpectrumSensor;
    export function lightSpectrumSensor(): sensors.LightSpectrumSensor {
        if (!_sensor)
            _sensor = new sensors.TSL2591();
        return _sensor;
    }

    /**
     * Uses a light spectrum sensor to capture the light spectrum range
     */
    //% blockId=sensor_light_spectrum block="light $range spectrum"
    //% group="Light Spectrum Sensor"
    export function lightSpectrum(range: JDLightSpectrumRange): number {
        const sensor = lightSpectrumSensor();
        if (sensor) {
            const spectrum = sensor.spectrum();
            if (spectrum) {
                switch (range) {
                    case JDLightSpectrumRange.Full: return spectrum.full;
                    case JDLightSpectrumRange.Infrared: return spectrum.infrared;
                    case JDLightSpectrumRange.Visible: return spectrum.visible;
                }
            }
        }
        return -1;
    }

    /**
     * Register code to run when the light condition changed
     * @param event 
     * @param handler 
     */
    export function onLightSpectrumConditionChanged(event: JDLightSpectrumEvent, handler: () => void): void {
        const sensor = lightSpectrumSensor();
        if (sensor)
            sensor.onEvent(event, handler);
    }
}