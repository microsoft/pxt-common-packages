namespace jacdac {
    //% fixedInstances
    export class LightClient extends Client {
        constructor(requiredDevice: string = null) {
            super("light", jd_class.LIGHT, requiredDevice);
        }

        setStrip(numpixels: number, type = 0, maxpower = 500): void {
            this.setRegInt(JDLightReg.NumPixels, numpixels)
            this.setRegInt(JDLightReg.LightType, type)
            this.setRegInt(REG_MAX_POWER, maxpower)
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
            this.setRegInt(REG_INTENSITY, brightness)
        }

        private startAnimation(anim: number) {
            this.config.send(JDPacket.packed(JDLightCommand.StartAnimation, "b", [anim]))
        }

        /**
         * Set all of the pixels on the strip to one RGB color.
         * @param rgb RGB color of the LED
         */
        //% blockId="jdlight_set_strip_color" block="set %strip all pixels to %rgb=colorNumberPicker"
        //% weight=80 blockGap=8
        //% group="Light"
        setAll(rgb: number) {
            this.setRegInt(JDLightReg.Color, rgb)
            this.startAnimation(1)
        }

        /**
         * Show an animation or queue an animation in the animation queue
         * @param animation the animation to run
         * @param duration the duration to run in milliseconds, eg: 500
         */
        //% blockId=jdlight_show_animation block="show %strip animation %animation for %duration=timePicker ms"
        //% weight=90 blockGap=8
        //% group="Light"
        showAnimation(animation: JDLightAnimation, duration: number, color = 0) {
            this.setRegInt(JDLightReg.Duration, duration)
            this.setRegInt(JDLightReg.Color, color)
            this.startAnimation(animation)
        }
    }

    //% fixedInstance whenUsed block="light client"
    export const lightClient = new LightClient();
}