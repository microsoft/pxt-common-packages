namespace jacdac {
    export class PixelService extends ActuatorService {
        constructor(name: string) {
            super(name, jacdac.PIXEL_DEVICE_CLASS, 4);
        }

        protected handleStateChanged(): number {
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
            pixel.setBrightness(brightness)
            pixel.setColor(color);
            return jacdac.DEVICE_OK;
        }
    }

    //% fixedInstance whenUsed block="pixel service"
    export const pixelService = new PixelService("pixel");
}