namespace jacdac {
    //% fixedInstances
    export class LightService extends ActuatorService {
        strip: light.NeoPixelStrip;
        constructor(name: string, strip: light.NeoPixelStrip) {
            super(name, jacdac.LIGHT_DEVICE_CLASS, 5);
            this.strip = strip;
        }

        handleStateChanged(): boolean {
            const animation = this.state.getNumber(NumberFormat.UInt8LE, 0);
            const value = this.state.getNumber(NumberFormat.UInt32LE, 1);

            const range = this.strip;
            switch (animation) {
                case JDLightCommand.SetAll: range.setAll(value); break;
                case JDLightCommand.SetBrightness: range.setBrightness(value);
                case JDLightCommand.Rainbow: range.showAnimation(light.rainbowAnimation, value); break;
                case JDLightCommand.RunningLights: range.showAnimation(light.runningLightsAnimation, value); break;
                case JDLightCommand.ColorWipe: range.showAnimation(light.colorWipeAnimation, value); break;
                case JDLightCommand.TheaterChase: range.showAnimation(light.theaterChaseAnimation, value); break;
                case JDLightCommand.Comet: range.showAnimation(light.cometAnimation, value); break;
                case JDLightCommand.Sparkle: range.showAnimation(light.sparkleAnimation, value); break;
            }

            return true;
        }
    }
}