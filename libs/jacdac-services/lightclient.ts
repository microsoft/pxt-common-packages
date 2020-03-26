namespace jacdac {
    //% fixedInstances
    export class LightClient extends Client {
        _state: Buffer
        _config: Buffer

        constructor(name: string) {
            super(name, jd_class.LIGHT);
        }

        private syncConfig() {
            if (this._config)
                this.sendCommand(JDPacket.from(CMD_SET_CONFIG, 0, this._config))
        }

        private syncState() {
            if (this._state)
                this.sendCommand(JDPacket.from(CMD_SET_STATE, 0, this._state))
        }

        private setState(cmd: number, duration: number, color: number) {
            if (!this._config)
                this.setStrip(10)
            this._state = Buffer.pack("BxHI", [cmd, duration, color])
            this.syncState()
        }

        setStrip(numpixels: number, type = 0, maxpower = 500): void {
            this._config = Buffer.pack("HHB", [numpixels, maxpower, type])
            this.syncConfig()
        }

        protected onAttach() {
            this.syncConfig()
            this.syncState()
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
            this._state[1] = brightness
            this.syncState()
        }

        /**
         * Set all of the pixels on the strip to one RGB color.
         * @param rgb RGB color of the LED
         */
        //% blockId="jdlight_set_strip_color" block="set %strip all pixels to %rgb=colorNumberPicker"
        //% weight=80 blockGap=8
        //% group="Light"
        setAll(rgb: number) {
            this.setState(JDLightCommand.SetAll, 0, rgb);
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
            this.setState(animation, duration, color);
        }
    }

    //% fixedInstance whenUsed block="light client"
    export const lightClient = new LightClient("light");
}