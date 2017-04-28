/**
 * A determines the mode of the photon
 */
enum PhotonMode {
    //% block="on"
    On,
    //% block="off"
    Off,
    //% block="erase"
    Erase
}
/**
 * Control a photon of light to paint animation on colored LEDs.
 * Inspired from MIT LightLogo.
 */
//% color="#9933ff" icon="\uf185" weight=90
namespace photon {
    let _strip: light.NeoPixelStrip;
    let _pos: number;
    let _ccw: number;
    let _color: number;
    let _show: boolean;
    let _stamp: number; // color under turtle
    let _mode: PhotonMode;
    let _tone: number;

    function reset() {
        _pos = 0;
        _ccw = 1;
        _color = NeoPixelColors.Red;
        _stamp = NeoPixelColors.Red;
        _show = true;
        _mode = PhotonMode.On;
        if (_strip) {
            _strip.clear();
            _strip.setPixelColor(0, NeoPixelColors.White);
            _strip.show();
        }
    }

    function initStrip(): light.NeoPixelStrip {
        if (!_strip) {
            _strip = light.pixels;
            reset();
        }
        return _strip;
    }

    /**
     * Moves the photon forward a number of steps (lights).
     * @param steps number of steps to move, eg: 1
     */
    //% weight=95 blockGap=8
    //% blockId=photon_forward block="photon forward %steps"
    export function forward(steps: number) {
        const strip = initStrip();

        if (_show) {
            // restore previous color
            strip.setPixelColor(_pos, _stamp);
        }

        // compute new pos
        _pos = (_pos + _ccw * steps) % strip.length();
        if (_pos < 0) _pos += strip.length();

        // store color      
        switch (_mode) {
            case PhotonMode.On: _stamp = _color; break;
            case PhotonMode.Off: _stamp = strip.pixelColor(_pos); break;
            default: _stamp = 0; break;
        }

        // update drawing
        strip.setPixelColor(_pos, _show ? NeoPixelColors.White : _stamp);

        strip.show();
        control.pause(1);
    }

    /**
     * Moves the photon backward a number of steps (lights).
     * @param steps number of steps to move, eg: 1
     */
    //% weight=94 blockGap=8
    //% blockId=photon_backward block="photon backward %steps"
    export function backward(steps: number) {
        forward(-steps);
    }

    /**
     * Flips the photon's direction from clockwise to counterclokwise and vice-versa.  
     */
    //% weight=93 blockGap=8
    //% blockId=photon_flip block="photon flip"
    export function flip() {
        const strip = initStrip();
        _ccw = - _ccw;
    }

    /**
     * Test if the next position already have a color
     */
    //% weight=92
    //% blockId=photon_test_for_color block="photon test for color"
    export function testForColor(): boolean {
        const strip = initStrip();
        let ahead = (_pos + 1) % strip.length();
        let c = strip.pixelColor(ahead);

        return c > 0;
    }

    /**
     * Sets the color of the light under the turtle to the current pen color. 
     */
    //% blockId=photon_stamp block="photon stamp"
    export function stamp() {
        const strip = initStrip();
        _color = _stamp;
    }

    /**
     * Changes the photon pen color
     * @param color the color
     */
    //% weight=85 blockGap=8
    //% blockId=photon_set_color block="photon set color %color"
    export function setColor(color: number) {
        const strip = initStrip();
        _color = color;
        if (PhotonMode.On)
            _stamp = color;
    }

    /**
     * Turns all the lights to the color specified by all's input. 
     */
    //% blockId=photon_all block="photon all %color"
    export function all(color: number) {
        const strip = initStrip();
        _color = color;
        _stamp = color;
        strip.showColor(_color);
        if (_show) {
            strip.setPixelColor(_pos, NeoPixelColors.White);
            strip.show();
        }
    }

    /**
     * Sets the photon mode to on, off or erase.
     * @param mode 
     */
    export function setMode(mode: PhotonMode) {
        _mode = mode;
    }

    /**
     * Resets the light and moves the photon back to the first light
     */
    //% blockId=photon_clean block="photon clean"
    export function clean() {
        const strip = initStrip();
        reset();
    }

    /**
     * Gets the position of the photon
     */
    //% blockGap=8 weight=69
    //% blockId=pothon_position block="photon position"
    export function position() {
        const strip = initStrip();
        return _pos;
    }

    /**
     * Sets the position of the photon
     * @param pos position of the photon starting at 0
     */
    //% blockGap=8 weight=68
    //% blockId=photon_position block="photon set position %pos"
    export function setPosition(pos: number) {
        const strip = initStrip();
        _pos = pos % strip.length();
        if (_pos < 0) _pos += strip.length();
    }

    /**
     * Sets the heading of the photon
     * @param ccw counter-clockwise heading
     */
    //% blockId=photon_set_heading block="photon set heading %direction"
    export function setHeading(direction: boolean) {
        _ccw = direction ? 1 : -1;
    }

    /**
     * Shows or hides the photon that shows as a white LED
     */
    //% weight=66
    //% blockId=photon_set_visible block="photon set visible %on"
    export function setVisible(on: boolean) {
        const strip = initStrip();
        if (_show != on) {
            _show = on;
            if (_show)
                strip.setPixelColor(_pos, NeoPixelColors.White);
            else
                strip.setPixelColor(_pos, _stamp);
            strip.show();
        }
    }

    /**
     * Attaches the photon to a custom strip
     * @param strip the strip to use for the photon
     */
    //% blockId=photon_set_strip block="photon set strip %strip"
    //% advanced=true
    export function setStrip(strip: light.NeoPixelStrip) {
        _strip = strip;
        clean();
    }
}
