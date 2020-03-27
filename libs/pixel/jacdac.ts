namespace jacdac {
    export class PixelService extends ActuatorService {
        constructor(name: string) {
            super(name, jd_class.PIXEL, 4);
        }

        protected handleStateChanged() {
            let brightness = 0;
            let color = 0;
            if (this.state.length >= 4) {
                brightness = this.state.getNumber(NumberFormat.UInt8LE, 0);
                color = pixel.rgb(
                    this.state.getNumber(NumberFormat.UInt8LE, 1),
                    this.state.getNumber(NumberFormat.UInt8LE, 2),
                    this.state.getNumber(NumberFormat.UInt8LE, 3)
                );
            }
            pixel.setBrightness(this.intensity ? brightness : 0)
            pixel.setColor(color);
        }
    }

    //% fixedInstance whenUsed block="pixel service"
    export const pixelService = new PixelService("pixel");
}