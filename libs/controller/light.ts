namespace controller {
    const ANIM_KEY = "ctrllightanim";
    const ANIM_TIME_KEY = "ctrllightanimend";
    /**
     * Shows an animation on the controller lights
     * @param animation 
     * @param duration 
     */
    //% blockId=controller_show_animation block="start light animation %animation=light_animation_picker|for %duration=timePicker|ms"
    //% weight=30 blockGap=8
    //% group="Extras"
    export function startLightAnimation(animation: light.NeoPixelAnimation, duration: number) {
        if (duration <= 0) return;

        const strip = light.defaultStrip();
        if (!strip || !strip.length()) return;

        // don't blind users
        const brightess = control.getConfigValue(DAL.CFG_CONTROLLER_LIGHT_MAX_BRIGHTNESS, 32);
        strip.setBrightness(brightess);

        const scene = game.currentScene();
        let anim = scene.data[ANIM_KEY] as light.NeoPixelAnimation;
        // schedule animation
        if (anim === undefined) // undefined means the game.update hasn't been registered yet
            game.onUpdateInterval(50, renderLightFrame);

        // record data for animation
        scene.data[ANIM_KEY] = animation;
        scene.data[ANIM_TIME_KEY] = game.runtime() + duration;
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

        const strip = light.defaultStrip();
        if (anim)
            strip.showAnimationFrame(anim);
        else
            strip.clear();
    }
}

//% advanced=true
namespace light {

}