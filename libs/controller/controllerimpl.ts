namespace controller.__internal {
    export function onGesture(gesture: ControllerGesture, handler: () => void) {
        const state = sceneState();
        if (!state.gestureHandlers) state.gestureHandlers = {};
        state.gestureHandlers[gesture] = handler;

        input.onGesture(<Gesture><number>gesture, function () {
            const st = sceneState();
            st.lastGesture = gesture;
        })
    }

    export function onCustomGesture(id: number, update: () => boolean, handler: () => void) {
        const state = sceneState();
        if (!state.customGestureHandlers) state.customGestureHandlers = {};
        state.customGestureHandlers[id] = <CustomGestureHandler>{ update, handler };

        input.onCustomGesture(id,
            function () {
                const st = sceneState();
                const h = st.customGestureHandlers && st.customGestureHandlers[id];
                return h && h.update();
            }, function () {
                const st = sceneState();
                st.lastCustomGesture = id;
            })
    }

    export function acceleration(dimension: ControllerDimension): number {
        return input.acceleration(<Dimension><number>dimension);
    }
}

namespace controller {
    /**
     * Configures the pins used by the crank
     * @param pinA 
     * @param pinB 
     */
    //% blockId=controller_crank_setpins block="set crank pinA $pinA pin B $pinB"
    //% weight=28 blockGap=8
    //% group="Extras"
    export function setCrankPins(pinA: DigitalInOutPin, pinB: DigitalInOutPin) {
        controller.__internal.setCrankPins(pinA, pinB);
    }
}

namespace controller.__internal {
    let crankEncoder: RotaryEncoder;
    export function crankPosition(): number {
        const crank = crankEncoder || encoders.defaultEncoder;
        return crank ? crank.position() : 0;
    }

    export function setCrankPins(pinA: DigitalInOutPin, pinB: DigitalInOutPin) {
        crankEncoder = encoders.createRotaryEncoder(pinA, pinB);
    }
}

namespace controller {
    /**
     * Shows an animation on the controller lights
     * @param animation 
     * @param duration 
     */
    //% blockId=controller_show_animation block="start light animation %animation=light_animation_picker|for %duration=timePicker|ms"
    //% weight=30 blockGap=8
    //% group="Extras"
    export function startLightAnimation(animation: light.NeoPixelAnimation, duration: number) {
        controller.__internal.startLightAnimation(animation, duration);
    }
}

namespace controller.__internal {
    const ANIM_KEY = "ctrllightanim";
    const ANIM_TIME_KEY = "ctrllightanimend";

    export function startLightAnimation(animation: light.NeoPixelAnimation, duration: number) {
        if (duration <= 0) return;

        const strip = light.onboardStrip();
        if (!strip || !strip.length()) return;

        const scene = game.currentScene();
        let anim = scene.data[ANIM_KEY] as light.NeoPixelAnimation;
        // schedule animation
        if (anim === undefined) { // undefined means the game.update hasn't been registered
            strip.setBuffered(true);
            game.onUpdateInterval(50, renderLightFrame);
        }

        // don't blind users
        strip.stopBrightnessTransition();
        const brightess = control.getConfigValue(DAL.CFG_CONTROLLER_LIGHT_MAX_BRIGHTNESS, 32);
        strip.setBrightness(brightess);
        // record data for animation
        scene.data[ANIM_KEY] = animation;
        scene.data[ANIM_TIME_KEY] = game.runtime() + duration;
    }

    export function startLightPulse(rgb: number, duration: number) {
        if (duration <= 0) return;

        const strip = light.onboardStrip();
        if (!strip || !strip.length()) return;

        const scene = game.currentScene();
        let anim = scene.data[ANIM_KEY] as light.NeoPixelAnimation;
        if (anim)
            scene.data[ANIM_KEY] = null; // stop any running animation

        // start a brightness transition
        const brightess = control.getConfigValue(DAL.CFG_CONTROLLER_LIGHT_MAX_BRIGHTNESS, 8);
        strip.setBrightness(0);
        strip.setAll(rgb);
        strip.startBrightnessTransition(0, brightess, duration, 2, true);
    }

    function renderLightFrame() {
        const scene = game.currentScene();
        if (!scene) return;

        // anything to animate?
        let anim = scene.data[ANIM_KEY] as light.NeoPixelAnimation;
        if (!anim) return;

        // expired?
        let animend = scene.data[ANIM_TIME_KEY] || 0;
        if (game.runtime() > animend) { // invalidate key
            anim = scene.data[ANIM_KEY] = null; // make sure to use null
        }

        const strip = light.onboardStrip();
        if (anim)
            strip.showAnimationFrame(anim);
        else
            strip.clear();
        strip.show();
    }
}

namespace controller.__internal {
    export function lightLevel(): number {
        return input.lightLevel();
    }


    export function onLightConditionChanged(condition: ControllerLightCondition, handler: () => void): void {
        const state = sceneState();
        if (!state.lightHandlers) state.lightHandlers = {};
        state.lightHandlers[condition] = handler;
        input.onLightConditionChanged(<LightCondition><number>condition, function () {
            const st = sceneState();
            st.lastLightCondition = condition;
        })
    }
}

namespace controller.__internal {
    export function temperature(unit: ControllerTemperatureUnit): number {
        return input.temperature(<TemperatureUnit><number>unit);
    }
}

namespace controller.__internal {
    let vibrationPin: DigitalInOutPin;
    let vibrationEnd: number;

    function updateVibration() {
        // turn off vibration if needed
        if (vibrationEnd > 0 && vibrationEnd < control.millis()) {
            if (vibrationPin)
                vibrationPin.digitalWrite(false);
            vibrationEnd = -1;
        }
    }

    function initVibration(s: scene.Scene) {
        if (!vibrationPin)
            vibrationPin = pins.pinByCfg(DAL.CFG_PIN_VIBRATION);
        vibrationEnd = -1;
        s.eventContext.registerFrameHandler(scene.UPDATE_PRIORITY, updateVibration);
    }

    export function vibrate(millis: number) {
        const off = vibrationEnd <= 0;
        vibrationEnd = millis <= 0 ? -1 : (control.millis() + Math.min(3000, millis));
        if (off) {
            if (vibrationPin)
                vibrationPin.digitalWrite(true);
        }
    }

    scene.Scene.initializers.push(initVibration);
}