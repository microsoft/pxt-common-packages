enum ControllerLightCondition {
    //% block="bright"
    Bright = LightCondition.Bright,
    //% block="dark"
    Dark = LightCondition.Dark
}

namespace controller {
    /**
     * Read the light level applied to the LED screen in a range from 0 (dark) to 255 (bright).
     */
    //% blockId=ctrllightlevel block="light level"
    //% parts="lightsensor"
    //% weight=30 blockGap=8
    //% group="Extras"
    export function lightLevel(): number {
        return input.lightLevel();
    }


    /**
     * Register an event that runs when light conditions (darker or brighter) change.
     * @param condition the condition that event triggers on
     */
    //% blockId=ctrlonlightcondition block="on light %condition"
    //% parts="lightsensor"
    //% weight=84 blockGap=12
    //% group="Extras"
    export function onLightConditionChanged(condition: ControllerLightCondition, handler: () => void): void {
        const state = sceneState();
        if (!state.lightHandlers) state.lightHandlers = {};
        state.lightHandlers[condition] = handler;
        input.onLightConditionChanged(<LightCondition><number>condition, function() {
            const st = sceneState();
            st.lastLightCondition = condition;
        })
    } 
}