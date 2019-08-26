namespace controller {
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