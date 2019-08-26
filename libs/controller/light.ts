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

    /**
     * Shows a color pulse
     * @param rgb RGB color of the LED
     */
    //% blockId="ctrllightpulse" block="start light pulse %rgb=colorNumberPicker|for %duration=timePicker|ms"
    //% weight=80 blockGap=8
    //% group="Extras"
    export function startLightPulse(rgb: number, duration: number) {
        controller.__internal.startLightPulse(rgb, duration);
    }
}

//% advanced=true
namespace light {

}