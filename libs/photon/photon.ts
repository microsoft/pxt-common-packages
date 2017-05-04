/**
 * A determines the mode of the photon
 */
enum PhotonMode {
    //% block="pen up"
    PenUp,
    //% block="pen down"
    PenDown,
    //% block="eraser"
    Eraser
}
/**
 * Control a photon of light to paint animation on colored LEDs.
 * Inspired from MIT LightLogo.
 */
//% color="#9933ff" icon="\uf185" weight=98
namespace photon {
    let _strip: light.NeoPixelStrip;
    let _pos: number;
    let _ccw: number;
    let _color: number;
    let _show: boolean;
    let _buf: Buffer; // colors are encoded in a byte
    let _mode: PhotonMode;

    function reset() {
        _pos = 0;
        _ccw = 1;
        _color = 1;
        _show = true;
        _mode = PhotonMode.PenDown;
        if (_strip) {
            _strip.clear();
            _buf.fill(0);
            paintTurtle();
            _strip.show();
        }
    }

    function posColor(_pos: number): number {
        let c = _buf[_pos];
        if (c == 0) return 0;
        return light.colorWheel(((c - 1) * 255) / 100)
    }

    function paintTurtle() {
        if (_show) {
            const b = _strip.brightness();
            _strip.setBrightness(255);
            _strip.setPixelColor(_pos, Colors.White);
            _strip.setBrightness(b);
        } else
            _strip.setPixelColor(_pos, posColor(_pos));
    }

    function initStrip(): light.NeoPixelStrip {
        if (!_strip) {
            _strip = light.pixels;
            _buf = pins.createBuffer(_strip.length())
            reset();
        }
        return _strip;
    }

    /**
     * Moves the photon forward a number of steps (lights).
     * @param steps number of steps to move, eg: 1
     */
    //% help=photon/forward
    //% weight=95 blockGap=8
    //% blockId=photon_forward block="photon forward %steps"
    export function forward(steps: number) {
        const strip = initStrip();

        if (_show) {
            // restore previous color
            strip.setPixelColor(_pos, posColor(_pos));
        }

        // compute new pos
        _pos = (_pos + _ccw * steps) % strip.length();
        if (_pos < 0) _pos += strip.length();

        // store color      
        switch (_mode) {
            case PhotonMode.PenDown: _buf[_pos] = _color; break; // apply current color
            default: _buf[_pos] = 0; // erased
            break;
        }

        // update drawing
        paintTurtle();
        strip.show();
    }

    /**
     * Moves the photon backward a number of steps (lights).
     * @param steps number of steps to move, eg: 1
     */
    //% help=photon/backward
    //% weight=94 blockGap=8
    //% blockId=photon_backward block="photon backward %steps"
    export function backward(steps: number) {
        forward(-steps);
    }

    /**
     * Flips the photon's direction from clockwise to counterclokwise and vice-versa.  
     */
    //% help=photon/flip
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
        let c = _buf[ahead];
        return c > 0;
    }

    /**
     * Sets the photon mode to on, off or eraser.
     * @param mode 
     */
    //% weight=87 blockGap=8
    //% blockId=photon_set_mode block="photon %mode"
    export function setMode(mode: PhotonMode) {
        _mode = mode;
    }

    /**
     * Sets the color of the light under the turtle to the current pen color. 
     */
    //% weight=86 blockGap=8
    //% blockId=photon_stamp block="photon stamp"
    export function stamp() {
        const strip = initStrip();
        _buf[_pos] = _color;
        if (!_show) {
            strip.setPixelColor(_pos, posColor(_pos));
            strip.show();
        }
    }

    /**
     * Sets the photon pen color
     * @param color the color between 0 and 100.
     */
    //% help=reference/photon/set-color
    //% weight=85 blockGap=8
    //% blockId=photon_set_color block="photon set color %color"
    //% color.min=0 color.max=100
    export function setColor(color: number) {
        const strip = initStrip();
        _color = ((color % 101) + 101) % 101 + 1;
    }

    /**
     * Changes the pen color by the given delta
     * @param value the color change, eg: 1.
     */
    //% weight=84 blockGap=8
    //% blockId=photon_change_color block="photon change color by %value"
    export function changeColorBy(value: number) {
        setColor(_color + value);
    }

    /**
     * Turns all the lights to the color specified by all's input. 
     */
    //% weight=83
    //% blockId=photon_all block="photon all %color"
    //% color.min=0 color.max=100
    export function all(color: number) {
        const strip = initStrip();
        _color = ((color % 101) + 101) % 101;
        _buf.fill(_color);
        strip.setAll(_color);
        if (_show) {
            paintTurtle();
            strip.show();
        }
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
    //% weight=67 blockGap=8
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
            paintTurtle();
            strip.show();
        }
    }

    /**
     * Resets the light and moves the photon back to the first light
     */
    //% weight=20
    //% blockId=photon_clean block="photon clean"
    export function clean() {
        const strip = initStrip();
        reset();
    }

    /**
     * Gets the number of lights that the photon can move on
     */
    //% weight=19
    //% blockId=photon_length block="photon length"
    export function length() : number {
        const strip = initStrip();
        return strip.length();
    }

    /**
     * Attaches the photon to a custom strip
     * @param strip the strip to use for the photon
     */
    //% blockId=photon_set_strip block="photon set strip %strip"
    //% advanced=true
    export function setStrip(strip: light.NeoPixelStrip) {
        _strip = strip;
        _buf = pins.createBuffer(_strip.length());
        clean();
    }
}
