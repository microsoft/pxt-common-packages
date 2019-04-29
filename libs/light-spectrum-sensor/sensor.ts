namespace sensors {
    export interface LightSpectrum {
        full: number;
        infrared: number;
        visible: number;
    }

    export interface LightSpectrumSensor {
        spectrum(): LightSpectrum;
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
}