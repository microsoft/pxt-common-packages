namespace controller {
    /**
     * Shows an animation on the controller lights
     * @param animation 
     * @param duration 
     */
    //% blockId=controller_show_animation block="show light animation %animation=light_animation_picker|for %duration=timePicker|ms"
    //% weight=30 blockGap=8
    //% group="Extras"
    export function showLightAnimation(animation: light.NeoPixelAnimation, duration: number) {
        const strip = light.defaultStrip();
        if (!strip) return;

        // don't blind users
        const brightess = control.getConfigValue(DAL.CFG_CONTROLLER_LIGHT_MAX_BRIGHTNESS, 32);
        strip.setBrightness(brightess);

        // run animation and clear
        strip.stopAllAnimations();
        strip.showAnimation(animation, duration);
        strip.clear();
    }
}

//% advanced=true
namespace light {
    
}