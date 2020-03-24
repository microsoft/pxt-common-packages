namespace jacdac {
    //% fixedInstances
    export class LightClient extends Client {
        constructor(name: string) {
            super(name, jd_class.LIGHT);
        }

        private setState(cmd: number, value: number) {
            this.start()
            this.sendCommand(JDPacket.packed(CMD_SET_STATE, 0, "bI", [cmd, value]))
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 20
         */
        //% blockId="jdlight_set_brightness" block="set %strip brightness %brightness"
        //% brightness.min=0 brightness.max=255
        //% weight=2 blockGap=8
        //% group="Light"
        setBrightness(brightness: number): void {
            this.start()
            this.sendCommand(JDPacket.onlyHeader(CMD_SET_INTENSITY, brightness))
        }

        /**
         * Set all of the pixels on the strip to one RGB color.
         * @param rgb RGB color of the LED
         */
        //% blockId="jdlight_set_strip_color" block="set %strip all pixels to %rgb=colorNumberPicker"
        //% weight=80 blockGap=8
        //% group="Light"
        setAll(rgb: number) {
            this.setState(JDLightCommand.SetAll, rgb);
        }

        /**
         * Show an animation or queue an animation in the animation queue
         * @param animation the animation to run
         * @param duration the duration to run in milliseconds, eg: 500
         */
        //% blockId=jdlight_show_animation block="show %strip animation %animation for %duration=timePicker ms"
        //% weight=90 blockGap=8
        //% group="Light"
        showAnimation(animation: JDLightAnimation, duration: number) {
            this.setState(animation, duration);
        }
    }

    //% fixedInstance whenUsed block="light client"
    export const lightClient = new LightClient("light");
}