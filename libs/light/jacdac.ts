enum JDLightCommand {
    SetAll,
    SetBrightness,
    Rainbow,
    RunningLights,
    ColorWipe,
    Comet,
    TheaterChase,
    Sparkle    
}

enum JDLightAnimation {
    Rainbow =JDLightCommand.Rainbow,
    RunningLights = JDLightCommand.RunningLights,
    ColorWipe = JDLightCommand.ColorWipe,
    Comet = JDLightCommand.Comet,
    TheaterChase = JDLightCommand.TheaterChase,
    Sparkle = JDLightCommand.Sparkle
}

namespace jacdac {
    //% fixedInstances
    export class LightService extends ActuatorService {
        strip: light.NeoPixelStrip;
        constructor(name: string, strip: light.NeoPixelStrip) {
            super(name, jacdac.LIGHT_DEVICE_CLASS, 1);
            this.strip = strip;
        }

        handleStateChanged(): boolean {
            const animation = this.state.getNumber(NumberFormat.UInt8LE, 0);
            const value = this.state.getNumber(NumberFormat.UInt32LE, 1);

            switch (animation) {
                case JDLightCommand.SetAll: this.strip.setAll(value); break;
                case JDLightCommand.SetBrightness: this.strip.setBrightness(value);
                case JDLightCommand.Rainbow: this.strip.showAnimation(light.rainbowAnimation, value); break;
                case JDLightCommand.RunningLights: this.strip.showAnimation(light.runningLightsAnimation, value); break;
                case JDLightCommand.ColorWipe: this.strip.showAnimation(light.colorWipeAnimation, value); break;
                case JDLightCommand.TheaterChase: this.strip.showAnimation(light.theaterChaseAnimation, value); break;
                case JDLightCommand.Comet: this.strip.showAnimation(light.cometAnimation, value); break;
                case JDLightCommand.Sparkle: this.strip.showAnimation(light.sparkleAnimation, value); break;
            }

            return true;
        }
    }
}