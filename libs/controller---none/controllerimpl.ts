namespace controller.__internal {
    export function onGesture(gesture: ControllerGesture, handler: () => void) {
    }

    export function onCustomGesture(id: number, update: () => boolean, handler: () => void) {
    }

    export function acceleration(dimension: ControllerDimension): number {
        return 0;
    }
}

namespace controller.__internal {
    export function crankPosition(): number {
        return 0;
    }

    //export function setCrankPins(pinA: DigitalInOutPin, pinB: DigitalInOutPin) {
    //}
}

namespace controller.__internal {
    //export function startLightAnimation(animation: light.NeoPixelAnimation, duration: number) {
    //}

    export function startLightPulse(rgb: number, duration: number) {
    }
}

namespace controller.__internal {
    export function lightLevel(): number {
        return 0;
    }


    export function onLightConditionChanged(condition: ControllerLightCondition, handler: () => void): void {
    }
}

namespace controller.__internal {
    export function temperature(unit: ControllerTemperatureUnit): number {
        return 0;
    }
}

namespace controller.__internal {
    export function vibrate(millis: number) {
    }
}