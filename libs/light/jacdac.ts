namespace jacdac {
    //% fixedInstances
    export class LightService extends ActuatorService {
        strip: light.NeoPixelStrip;
        constructor(name: string, strip: light.NeoPixelStrip) {
            super(name, jd_class.LIGHT, 8);
            this.strip = strip;
        }

        protected handleCustomCommand(pkt: JDPacket): void {
            switch (pkt.service_command) {
                case CMD_SET_INTENSITY:
                    this.strip.setBrightness(pkt.service_argument)
                    break
            }
        }


        protected handleStateChanged() {
            const [animation, padding, duration, color] = this.state.unpack("<BBHI")
            const range = this.strip;
            // TODO use color in animations
            switch (animation) {
                case JDLightCommand.SetAll: range.setAll(color); break;
                case JDLightCommand.Rainbow: range.showAnimation(light.rainbowAnimation, duration); break;
                case JDLightCommand.RunningLights: range.showAnimation(light.runningLightsAnimation, duration); break;
                case JDLightCommand.ColorWipe: range.showAnimation(light.colorWipeAnimation, duration); break;
                case JDLightCommand.TheaterChase: range.showAnimation(light.theaterChaseAnimation, duration); break;
                case JDLightCommand.Comet: range.showAnimation(light.cometAnimation, duration); break;
                case JDLightCommand.Sparkle: range.showAnimation(light.sparkleAnimation, duration); break;
            }
        }
    }
}