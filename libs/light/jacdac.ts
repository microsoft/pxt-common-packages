namespace jacdac {
    //% fixedInstances
    export class LightService extends ActuatorService {
        strip: light.NeoPixelStrip;
        duration = 500
        color = 0

        constructor(name: string, strip: light.NeoPixelStrip) {
            super(name, jd_class.LIGHT, 8);
            this.strip = strip;
        }

        protected handleCustomCommand(pkt: JDPacket): void {
            this.duration = this.handleRegInt(pkt, JDLightReg.Duration, this.duration)
            this.color = this.handleRegInt(pkt, JDLightReg.Color, this.color)

            switch (pkt.service_command) {
                case JDLightCommand.StartAnimation:
                    const range = this.strip
                    const duration = this.duration
                    // TODO use color in animations
                    switch (pkt.intData) {
                        case 1: range.setAll(this.color); break;
                        case JDLightAnimation.Rainbow: range.showAnimation(light.rainbowAnimation, duration); break;
                        case JDLightAnimation.RunningLights: range.showAnimation(light.runningLightsAnimation, duration); break;
                        case JDLightAnimation.ColorWipe: range.showAnimation(light.colorWipeAnimation, duration); break;
                        case JDLightAnimation.TheaterChase: range.showAnimation(light.theaterChaseAnimation, duration); break;
                        case JDLightAnimation.Comet: range.showAnimation(light.cometAnimation, duration); break;
                        case JDLightAnimation.Sparkle: range.showAnimation(light.sparkleAnimation, duration); break;
                    }
                    break
            }
        }

        protected handleStateChanged() {
            this.strip.setBrightness(this.intensity)
        }
    }
}