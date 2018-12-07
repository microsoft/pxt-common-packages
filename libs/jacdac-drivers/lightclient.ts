namespace jacdac {
    //% fixedInstances
    export class LightClient extends Client {
        constructor(name: string) {
            super(name, jacdac.LIGHT_DEVICE_CLASS);
        }

        private sendCmd(cmd: number, value: number) {
            const buf = control.createBuffer(5);
            buf.setNumber(NumberFormat.UInt8LE, 0, cmd);
            buf.setNumber(NumberFormat.UInt32LE, 1, value);
            this.sendPacket(buf);
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 20
         */
        //% blockId="jdlight_set_brightness" block="%strip|set brightness %brightness"
        //% brightness.min=0 brightness.max=255
        //% weight=2 blockGap=8
        setBrightness(brightness: number): void {
            this.sendCmd(JDLightCommand.SetBrightness, brightness);
        }

        /**
         * Set all of the pixels on the strip to one RGB color.
         * @param rgb RGB color of the LED
         */
        //% blockId="jdlight_set_strip_color" block="%strip|set all pixels to %rgb=colorNumberPicker"
        //% weight=80 blockGap=8
        setAll(rgb: number) {
            this.sendCmd(JDLightCommand.SetAll, rgb);
        }

        /**
         * Show an animation or queue an animation in the animation queue
         * @param animation the animation to run
         * @param duration the duration to run in milliseconds, eg: 500
         */
        //% blockId=light_shoxelstrip/show-animation"
        //% parts="neopixel"
        //% weight=90 blockGap=8
        showAnimation(animation: JDLightAnimation, duration: number) {
            this.sendCmd(animation, duration);
        }
    }

    //% fixedInstance whenUsed block="light"
    export const lightClient = new LightClient("light");
}