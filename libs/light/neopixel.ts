/**
 * Well known colors for a NeoPixel strip
 */
enum Colors {
    //% block=red blockIdentity=light.colors
    Red = 0xFF0000,
    //% block=orange blockIdentity=light.colors
    Orange = 0xFF7F00,
    //% block=yellow blockIdentity=light.colors
    Yellow = 0xFFFF00,
    //% block=green blockIdentity=light.colors
    Green = 0x00FF00,
    //% block=blue blockIdentity=light.colors
    Blue = 0x0000FF,
    //% block=indigo blockIdentity=light.colors
    Indigo = 0x4b0082,
    //% block=violet blockIdentity=light.colors
    Violet = 0x8a2be2,
    //% block=purple blockIdentity=light.colors
    Purple = 0xA033E5,
    //% block=pink blockIdentity=light.colors
    Pink = 0xFF007F,
    //% block=white blockIdentity=light.colors
    White = 0xFFFFFF,
    //% block=black  blockIdentity=light.colors
    Black = 0x000000
}

/**
 * Different modes for RGB or RGB+W NeoPixel strips
 */
enum NeoPixelMode {
    //% block="RGB (GRB format)"
    RGB = 1,
    //% block="RGB+W"
    RGBW = 2,
    //% block="RGB (RGB format)"
    RGB_RGB = 3
}

enum LightMove {
    //% block="rotate"
    Rotate,
    //% block="shift"
    Shift
}

enum LightAnimation {
    //% blockImage=1
    //% block="rainbow"
    Rainbow,
    //% blockImage=1
    //% block="running lights"
    RunningLights,
    //% blockImage=1
    //% block="comet"
    Comet,
    //% blockImage=1
    //% block="sparkle"
    Sparkle,
    //% blockImage=1
    //% block="theater chase"
    TheaterChase,
    //% blockImage=1
    //% block="color wipe"
    ColorWipe
}

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
 * Functions to operate colored LEDs.
 */
//% weight=100 color="#0078d7" icon="\uf00a"
//% groups='["other", "Color", "Photon", "More"]'
namespace light {
    /**
     * A NeoPixel strip
     */
    export class NeoPixelStrip {
        _parent: NeoPixelStrip;
        _pin: DigitalPin;
        _buf: Buffer;
        _brightness: number;
        _start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _mode: NeoPixelMode;
        _buffered: boolean;
        _animationQueue: control.AnimationQueue;
        // what's the current high value
        _barGraphHigh: number;
        // when was the current high value recorded
        _barGraphHighLast: number;
        // the current photon color, undefined = no photon
        _photonMode: number;
        _photonPos: number;
        _photonMasked: number;
        _photonDir: number;
        _photonColor: number;

        get buf(): Buffer {
            // Lazily allocate to conserve memory
            if (!this._buf) {
                this.reallocateBuffer();
            }
            return this._buf;
        }

        set buf(b: Buffer) {
            this._buf = b;
        }

        /**
         * Gets the LED data layout mode
         */
        get mode(): NeoPixelMode {
            return this._mode;
        }

        /**
         * Set all of the pixels on the strip to one RGB color.
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_strip_color" block="%strip|set all pixels to %rgb=colorNumberPicker"         
        //% parts="neopixel"
        //% help="light/set-all"
        //% weight=80 blockGap=8
        setAll(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const bfr = this.buffered();
            this.setBuffered(true);
            const br = this._brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this._start + this._length;
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            for (let i = this._start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
            this.setBuffered(bfr);
            this.autoShow();
        }

        /**
         * Display a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, 0 to autoscale
         */
        //% blockId=neopixel_show_bar_graph block="%strip|graph of %value |up to %high" icon="\uf080"       
        //% help=light/graph
        //% parts="neopixel"
        //% weight=70
        graph(value: number, high: number): void {
            serial.writeString(value + "\n"); // auto chart
            value = Math.abs(value);

            const now = control.millis();
            if (high > 0) {
                this._barGraphHigh = high;
            }
            else if (value > this._barGraphHigh || now - this._barGraphHighLast > 10000) {
                this._barGraphHigh = value;
                this._barGraphHighLast = now;
            }

            const bfr = this.buffered();
            this.setBuffered(true);
            const n = this._length;
            const n1 = n - 1;
            const v = ((value * n) / this._barGraphHigh) >> 0;
            if (v == 0) {
                this.setAll(0);
                this.setPixelColor(0, 0x000033);
            } else {
                for (let i = 0; i < n; ++i) {
                    if (i <= v) {
                        let b = (i * 255 / n1) >> 0;
                        this.setPixelColor(i, light.rgb(b, 0, 255 - b));
                    }
                    else {
                        this.setPixelColor(i, 0);
                    }
                }
            }
            this.show();
            this.setBuffered(bfr);
        }

        /**
         * Set the pixel to a given color.
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the NeoPixel in the strip
         * @param color RGB color of the LED
         */
        //% blockId="neopixel_set_pixel_color" block="%strip|set pixel color at %pixeloffset|to %rgb=colorNumberPicker"
        //% help="light/set-pixel-color"
        //% parts="neopixel"
        //% weight=79
        setPixelColor(pixeloffset: number, color: number): void {
            pixeloffset = pixeloffset >> 0;
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            let stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this._start) * stride;
            const br = this._brightness;
            if (br < 255)
                color = fade(color, br);
            let red = unpackR(color);
            let green = unpackG(color);
            let blue = unpackB(color);
            this.setBufferRGB(pixeloffset, red, green, blue)
            this.autoShow();
        }

        /**
         * Gets the pixel color.
         * @param pixeloffset position of the NeoPixel in the strip
         */
        //% blockId="neopixel_get_pixel_color" block="%strip|pixel color at %pixeloffset"
        //% help="light/pixel-color"
        //% parts="neopixel"
        //% group="More" weight=9 blockGap=8
        pixelColor(pixeloffset: number): number {
            pixeloffset = pixeloffset >> 0;
            if (pixeloffset < 0
                || pixeloffset >= this._length) {
                return 0;
            }

            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            const offset = (pixeloffset + this._start) * stride;
            const b = this.buf;
            let red = 0, green = 0, blue = 0;
            if (this._mode === NeoPixelMode.RGB_RGB) {
                red = this.buf[offset + 0];
                green = this.buf[offset + 1];
            } else {
                green = this.buf[offset + 0];
                red = this.buf[offset + 1];
            }
            blue = this.buf[offset + 2];

            return rgb(red, green, blue);
        }

        /**
         * Set the white brightness of a pixel in a NeoPixel strip of RGB+W LEDs.
         * This only works for RGB+W NeoPixels.
         * @param pixeloffset position of the LED in the strip
         * @param white brightness of the white LED
         */
        //% blockId="neopixel_set_pixel_white_led" block="%strip|set pixel white LED at %pixeloffset|to %white"
        //% help="light/set-pixel-white-led"
        //% parts="neopixel"
        //% group="More" weight=5 blockGap=8
        setPixelWhiteLED(pixeloffset: number, white: number): void {
            if (this._mode != NeoPixelMode.RGBW) return;

            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this._start) * 4;
            white = white & 0xff;
            const br = this._brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            buf[pixeloffset + 3] = white;
            this.autoShow();
        }

        /**
         * Make the strip show all the new changes for the pixels.
         */
        //% blockId="neopixel_show" block="%strip|show"
        //% help="light/show"
        //% parts="neopixel"
        //% group="More" weight=86 blockGap=8
        show(): void {
            if (this._pin)
                sendBuffer(this._pin, this.buf);
        }

        /**
         * Turn off all pixel LEDs.
         */
        //% blockId="neopixel_clear" block="%strip|clear"
        //% parts="neopixel"
        //% help="light/clear"
        //% group="More" weight=85
        clear(): void {
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.fill(0, this._start * stride, this._length * stride);
            this.autoShow();
        }

        /**
         * Get the number of pixels on the strip
         */
        //% blockId="neopixel_length" block="%strip|length"
        //% help="light/length"
        //% group="More" weight=8 blockGap=8
        length() {
            return this._length;
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 20
         */
        //% blockId="neopixel_set_brightness" block="%strip|set brightness %brightness"
        //% brightness.min=0 brightness.max=255
        //% help="light/set-brightness"
        //% parts="neopixel"
        //% weight=2 blockGap=8
        setBrightness(brightness: number): void {
            this._brightness = Math.max(0, Math.min(0xff, brightness >> 0));
        }

        /**
         * Get the brightness of the pixel strip.
         */
        //% blockId="neopixel_get_brightness" block="%strip|brightness"
        //% help="light/brightness"
        //% parts=neopixel
        //% group="More" weight=7
        brightness(): number {
            return this._brightness;
        }

        /**
         * Create a range of pixels.
         * @param start offset in the NeoPixel strip to start the range
         * @param length number of pixels in the range. eg: 4
         */
        //% blockId="neopixel_range" block="%strip|range from %start|with %length|pixels"
        //% help="light/range"   
        //% parts="neopixel"
        //% weight=99 blockGap=30
        range(start: number, length: number): NeoPixelStrip {
            let strip = new NeoPixelStrip();
            strip._parent = this;
            strip.buf = this.buf;
            strip._pin = this._pin;
            strip._brightness = this._brightness;
            strip._start = this._start + Math.clamp(0, this._length - 1, start);
            strip._length = Math.clamp(0, this._length - (strip._start - this._start), length);
            return strip;
        }

        /**
         * Shift LEDs forward and clear with zeros.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to shift forward, eg: 1
         */
        //% blockId="neopixel_move_pixels" block="%strip|%kind=MoveKind|by %offset"
        //% help="light/move"
        //% parts="neopixel"
        //% group="More" weight=87 blockGap=8
        move(kind: LightMove, offset: number = 1): void {
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            if (kind === LightMove.Shift) {
                this.buf.shift(-offset * stride, this._start * stride, this._length * stride)
            }
            else {
                this.buf.rotate(-offset * stride, this._start * stride, this._length * stride)
            }
            this.autoShow();
        }

        initPhoton() {
            if (this._photonPos === undefined) {
                this._photonMode = PhotonMode.PenDown;
                this._photonPos = 0;
                this._photonDir = 1;
                this._photonColor = 0;
                this._photonMasked = light.hsv(this._photonColor, 0xff, 0xff);
            }
        }

        /**
         * Move a photon effect along the pixel strip by a number of steps.
         * @param steps number of steps (lights) to move, eg: 1
         */
        //% blockId=neophoton_fd block="%strip|photon forward by %steps"
        //% help="light/photon-forward"
        //% parts="neopixel"
        //% group="Photon" weight=41 blockGap=8
        photonForward(steps: number) {
            this.initPhoton();

            // store current brightness
            const br = this.brightness();
            this.setBrightness(0xff);

            // unpaint current pixel
            this.setPixelColor(this._photonPos, this._photonMasked);

            // move
            this._photonPos = ((this._photonPos + this._photonDir * steps) % this._length) >> 0;
            if (this._photonPos < 0) this._photonPos += this._length;

            // store current color
            if (this._photonMode == PhotonMode.PenDown) {
                this._photonMasked = light.fade(light.hsv(this._photonColor, 0xff, 0xff), br);
            }
            else if (this._photonMode == PhotonMode.Eraser)
                this._photonMasked = 0; // erase led
            else this._photonMasked = this.pixelColor(this._photonPos);

            // paint photon
            this.setPixelColor(this._photonPos, light.fade(0xffffff, br + 32));

            // restore brightness
            this.setBrightness(br);
        }

        /**
         * Switch the direction of the photon pulse.
         */
        //% blockId=neophoton_flip block="%strip|photon flip"
        //% help="light/photon-flip"
        //% parts="neopixel"
        //% group="Photon" weight=40 blockGap=8
        photonFlip() {
            this.initPhoton();
            this._photonDir *= -1;
        }

        /**
         * Set the photon color.
         * @param color the color of the photon
         */
        //% blockId=neophoton_set_color block="%strip=variables_get| photon set pen color %color=colorWheelPicker"
        //% help="light/set-photon-color"
        //% parts="neopixel"
        //% group="Photon" weight=39 blockGap=8
        setPhotonColor(color: number) {
            this.initPhoton();
            this._photonColor = color & 0xff;
            this.photonForward(0);
        }

        /**
         * Set the photon mode to pen up, pen down, or eraser.
         * @param mode the desired mode
         */
        //% blockId=neophoton_set_photon block="%strip|photon %mode"
        //% help="light/set-photon-mode"
        //% parts="neopixel"
        //% group="Photon" weight=38
        setPhotonMode(mode: PhotonMode) {
            this.initPhoton();
            if (this._photonMode != mode) {
                this._photonMode = mode;
                this.photonForward(0);
            }
        }

        /**
         * Show an animation or queue an animation in the animation queue
         * @param animation the animation to run, eg: light.animation(LightAnimation.Rainbow)
         * @param duration the duration to run in milliseconds, eg: 500
         */
        //% blockId=neopixel_show_animation block="%strip|show %animation=light_animation|animation for %duration=timePicker|ms"
        //% help="light/show-animation"
        //% parts="neopixel"
        //% weight=90 blockGap=8
        showAnimation(animation: NeoPixelAnimation, duration: number) {
            let start = -1;
            const render = () => {
                if (start < 0) start = control.millis();
                const now = control.millis() - start;
                animation.showFrame(this);
                return now < duration;
            };
            this.queueAnimation(render);
        }

        /**
         * Show a single animation frame
         * @param animation the animation to run, eg: light.animation(LightAnimation.Rainbow)
         */
        //% blockId=neopixel_show_animation_frame block="%strip|show animation frame %animation=light_animation"
        //% help="light/show-animation-frame"
        //% parts="neopixel"
        //% weight=87 blockGap=8
        showAnimationFrame(animation: NeoPixelAnimation) {
            if (!animation) return;
            animation.showFrame(this);
        }

        /**
         * Renders a pattern of colors on the strip
         */
        showColors(leds: string, interval: number = 400) {
            const n = this._length;
            let tempColor = "";
            let i = 0;
            let pi = 0;

            this.queueAnimation(() => {
                const bf = this.buffered();
                this.setBuffered(true);

                while (i < leds.length) {
                    const currChar = leds.charAt(i++);
                    const isSpace = currChar == ' ' || currChar == '\n' || currChar == '\r';
                    if (!isSpace)
                        tempColor += currChar;

                    if ((isSpace || i == leds.length) && tempColor) {
                        this.setPixelColor(pi++, parseColor(tempColor))
                        tempColor = "";
                        if (pi == n) {
                            this.show();
                            loops.pause(interval);
                            pi = 0;
                            break;
                        }
                    }
                }

                this.setBuffered(bf);
                return i < leds.length;
            });
        }

        //%
        private queueAnimation(render: () => boolean) {
            if (!this._animationQueue)
                this._animationQueue = new control.AnimationQueue();
            this._animationQueue.runUntilDone(() => {
                const bf = this.buffered();
                this.setBuffered(true);
                const r = render();
                this.setBuffered(bf);
                return r;
            });
        }

        /**
         * Stop the current animation and any other animations ready to show.
         */
        //% blockId=neopixel_stop_all_animations block="%strip|stop all animations"
        //% parts="neopixel"
        //% help="light/stop-all-animations"
        //% weight=85
        stopAllAnimations() {
            if (this._animationQueue)
                this._animationQueue.cancel();
        }

        /**
         * Enables or disables automatically calling show when a change is made
         * @param on call show whenever a light is modified
         */
        //% blockId=neopixel_set_buffered block="%strip|set buffered  %on"
        //% help="light/set-buffered"
        //% parts="neopixel"
        //% group="More" weight=86
        setBuffered(on: boolean): void {
            if (this._parent) this._parent.setBuffered(on);
            else this._buffered = on;
        }

        /**
         * Gets a value indicated if the changes are buffered
         */
        //% weight=85 group="More"
        buffered(): boolean {
            return this._parent ? this._parent.buffered() : this._buffered;
        }

        /**
         * Sets the color mode and clears the colors.
         * @param mode the kind of color encoding required by the programmable lights
         */
        //% blockId=neopixel_set_mode block="%strip|set mode %mode"
        //% help="light/set-mode"
        //% parts="neopixel"
        //% group="More" weight=1
        setMode(mode: NeoPixelMode): void {
            this._mode = mode;
            this.reallocateBuffer();
        }

        private autoShow() {
            if (!this.buffered())
                this.show();
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._mode === NeoPixelMode.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        private reallocateBuffer(): void {
            let stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this._buf = pins.createBuffer(this._length * stride);
        }
    }

    /**
     * This block is deprecated, use ``light.createStrip`` instead.
     */
    //% blockId="neopixel_create" block="create strip|pin %pin|pixels %numleds|mode %mode"
    //% help="light/create-neo-pixel-strip"
    //% trackArgs=0,2
    //% parts="neopixel"
    //% weight=100 deprecated=true blockHidden=true
    export function createNeoPixelStrip(
        pin: DigitalPin = null,
        numleds: number = 10,
        mode?: NeoPixelMode
    ): NeoPixelStrip {
        if (!mode)
            mode = NeoPixelMode.RGB

        const strip = new NeoPixelStrip();
        strip._mode = mode;
        strip._length = Math.max(0, numleds);
        strip._start = 0;
        strip._pin = pin ? pin : defaultPin();
        if (strip._pin) // board with no-board LEDs won't have a default pin
            strip._pin.digitalWrite(false);
        strip._barGraphHigh = 0;
        strip._barGraphHighLast = 0;
        strip.setBrightness(20)
        return strip;
    }
    
    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% blockId="neopixel_rgb" block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% help="light/rgb"
    //% red.shadowOptions.color="#FF6680"
    //% green.shadowOptions.color="#59C059"
    //% blue.shadowOptions.color="#4C97FF"
    //% group="Color" weight=19 blockGap=8
    export function rgb(red: number, green: number, blue: number): number {
        return ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF);
    }

    /**
     * Get the RGB value of a known color
    */
    //% blockId=neopixel_colors block="%color"
    //% help="light/colors"
    //% shim=TD_ID
    //% group="Color" weight=20 blockGap=8
    export function colors(color: Colors): number {
        return color;
    }

    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb >> 0) & 0xFF;
        return b;
    }

    /**
     * Convert an HSV (hue, saturation, value) color to RGB
     * @param hue value of the hue channel between 0 and 255. eg: 255
     * @param sat value of the saturation channel between 0 and 255. eg: 255
     * @param val value of the value channel between 0 and 255. eg: 255
     */

    //% blockId="neopixel_hsv" block="hue %hue|sat %sat|val %val"
    //% hue.min=0 hue.max=255 sat.min=0 sat.max=255 val.min=0 val.max=255
    //% help="light/hsv"
    //% group="Color" weight=17
    export function hsv(hue: number, sat: number, val: number): number {
        let h = (hue % 255) >> 0;
        if (h < 0) h += 255;
        // scale down to 0..192
        h = (h * 192 / 255) >> 0;

        //reference: based on FastLED's hsv2rgb rainbow algorithm [https://github.com/FastLED/FastLED](MIT)
        let invsat = 255 - sat;
        let brightness_floor = ((val * invsat) / 255) >> 0;
        let color_amplitude = val - brightness_floor;
        let section = (h / 0x40) >> 0; // [0..2]
        let offset = (h % 0x40) >> 0; // [0..63]

        let rampup = offset;
        let rampdown = (0x40 - 1) - offset;

        let rampup_amp_adj = ((rampup * color_amplitude) / (255 / 4)) >> 0;
        let rampdown_amp_adj = ((rampdown * color_amplitude) / (255 / 4)) >> 0;

        let rampup_adj_with_floor = (rampup_amp_adj + brightness_floor);
        let rampdown_adj_with_floor = (rampdown_amp_adj + brightness_floor);

        let r: number;
        let g: number;
        let b: number;
        if (section) {
            if (section == 1) {
                // section 1: 0x40..0x7F
                r = brightness_floor;
                g = rampdown_adj_with_floor;
                b = rampup_adj_with_floor;
            } else {
                // section 2; 0x80..0xBF
                r = rampup_adj_with_floor;
                g = brightness_floor;
                b = rampdown_adj_with_floor;
            }
        } else {
            // section 0: 0x00..0x3F
            r = rampdown_adj_with_floor;
            g = rampup_adj_with_floor;
            b = brightness_floor;
        }
        return rgb(r, g, b);
    }

    /**
     * Fade the color by the brightness
     * @param color color to fade
     * @param brightness the amount of brightness to apply to the color, eg: 128
     */
    //% blockId="neopixel_fade" block="fade %color=neopixel_colors|by %brightness"
    //% brightness.min=0 brightness.max=255
    //% help="light/fade"
    //% group="Color" weight=18 blockGap=8
    //% blockHidden=true
    export function fade(color: number, brightness: number): number {
        brightness = Math.max(0, Math.min(255, brightness >> 0));
        if (brightness < 255) {
            let red = unpackR(color);
            let green = unpackG(color);
            let blue = unpackB(color);

            red = (red * brightness) >> 8;
            green = (green * brightness) >> 8;
            blue = (blue * brightness) >> 8;

            color = rgb(red, green, blue);
        }
        return color;
    }

    function parseColor(color: string) {
        switch (color) {
            case "RED":
            case "red":
                return Colors.Red;
            case "GREEN":
            case "green":
                return Colors.Green;
            case "BLUE":
            case "blue":
                return Colors.Blue;
            case "WHITE":
            case "white":
                return Colors.White;
            case "ORANGE":
            case "orange":
                return Colors.Orange;
            case "PURPLE":
            case "purple":
                return Colors.Purple;
            case "YELLOW":
            case "yellow":
                return Colors.Yellow;
            case "PINK":
            case "pink":
                return Colors.Pink;
            default:
                return parseInt(color) || 0;
        }
    }

    /**
     * Creates a builtin animation
     * @param kind the type of animation
     */
    //% kind.fieldEditor="imagedropdown"
    //% kind.fieldOptions.columns=3 blockGap=8
    //% blockId=light_animation block="%kind"
    //% group="More" weight=25
    //% help="light/animation"
    export function animation(kind: LightAnimation): NeoPixelAnimation {
        switch (kind) {
            case LightAnimation.RunningLights: return new RunningLightsAnimation(0xff, 0, 0, 50);
            case LightAnimation.Comet: return new CometAnimation(0xff, 0, 0xff, 50);
            case LightAnimation.ColorWipe: return new ColorWipeAnimation(0x0000ff, 50);
            case LightAnimation.TheaterChase: return new TheatreChaseAnimation(0xff, 0, 0, 50)
            case LightAnimation.Sparkle: return new SparkleAnimation(0xff, 0xff, 0xff, 50)
            default: return new RainbowCycleAnimation(50);
        }
    }

    /**
     * An animation of a NeoPixel
     */
    export class NeoPixelAnimation {
        protected start: number;
        constructor() {
            this.start = -1;
        }

        /**
         * Shows a frame of the animation on the given strip.
         * @param strip the neopixel strip to apply the render the frame
         */
        //%
        public showFrame(strip: NeoPixelStrip): void { }
    }

    class RainbowCycleAnimation extends NeoPixelAnimation {
        public delay: number;
        constructor(delay: number) {
            super();
            this.delay = delay;
        }

        public showFrame(strip: NeoPixelStrip): void {
            const n = strip.length();
            if (this.start < 0) this.start = control.millis();
            const now = control.millis() - this.start;
            const offset = (now / this.delay) * (256 / (n - 1));
            for (let i = 0; i < n; i++) {
                strip.setPixelColor(i, hsv(((i * 256 / (n - 1)) + offset) % 0xff, 0xff, 0xff));
            }
            strip.show();
            loops.pause(this.delay);
        }
    }

    class RunningLightsAnimation extends NeoPixelAnimation {
        public red: number;
        public green: number;
        public blue: number;
        public delay: number;
        private iteration: number;
        private step: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super();
            this.red = red;
            this.green = green;
            this.blue = blue;

            this.delay = delay;
            this.iteration = 0;
            this.step = 0;
        }


        public showFrame(strip: NeoPixelStrip): void {
            const l = strip.length();
            if (this.start < 0) this.start = control.millis();
            const now = control.millis() - this.start;
            if (this.iteration < l * 2) {
                this.step++;
                for (let i = 0; i < l; i++) {
                    const level = (Math.isin(i + this.step) * 127) + 128;
                    strip.setPixelColor(i, rgb(level * this.red / 255, level * this.green / 255, level * this.blue / 255));
                }
                strip.show();
                loops.pause(this.delay);
                this.iteration++;
            } else {
                this.step = 0;
                this.iteration = 0;
            }
        }
    }

    class CometAnimation extends NeoPixelAnimation {
        public red: number;
        public green: number;
        public blue: number;
        public delay: number;
        private step: number;
        private offsets: number[];

        constructor(red: number, green: number, blue: number, delay: number) {
            super();
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.delay = delay;
            this.step = 0;
        }

        public showFrame(strip: NeoPixelStrip): void {
            const l = strip.length();
            const spacing = (255 / l) >> 0;
            if (!this.offsets || this.offsets.length != l) {
                this.offsets = [];
                for (let i = 0; i < l; i++) {
                    this.offsets[i] = spacing * i;
                }

            }
            if (this.start < 0) this.start = control.millis();
            const now = control.millis() - this.start;
            for (let i = 0; i < l; i++) {
                this.offsets[i] = (this.offsets[i] + (this.step * 2)) % 255
                strip.setPixelColor(i, rgb(255 - this.offsets[i], this.green, this.blue));
            }
            this.step++;
            strip.show();
            loops.pause(this.delay);
        }
    }

    class SparkleAnimation extends NeoPixelAnimation {
        public rgb: number;
        public delay: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super();
            this.rgb = rgb(red, green, blue);
            this.delay = delay;
        }

        public showFrame(strip: NeoPixelStrip): void {
            const l = strip.length();
            if (this.start < 0) {
                this.start = control.millis();
                strip.clear();
            }
            const now = control.millis() - this.start;
            const pixel = Math.randomRange(0, l - 1);
            strip.setPixelColor(pixel, this.rgb);
            strip.show();
            loops.pause(this.delay);
            strip.setPixelColor(pixel, 0);
            strip.show();
        }
    }

    class ColorWipeAnimation extends NeoPixelAnimation {
        public rgb: number;
        public delay: number;

        private i: number;
        private reveal: boolean;

        constructor(rgb: number, delay: number) {
            super();
            this.rgb = rgb;
            this.delay = delay;

            this.i = 0;
            this.reveal = true;
        }

        public showFrame(strip: NeoPixelStrip): void {
            const l = strip.length();
            if (this.start < 0) this.start = control.millis();
            const now = control.millis() - this.start;
            if (this.i < l) {
                if (this.reveal) {
                    strip.setPixelColor(this.i, this.rgb);
                } else {
                    strip.setPixelColor(this.i, 0);
                }
                strip.show();
                loops.pause(this.delay);
                this.i++;
            } else {
                this.reveal = !this.reveal;
                this.i = 0;
            }
        }
    }

    class TheatreChaseAnimation extends NeoPixelAnimation {
        public rgb: number;
        public delay: number;
        private j: number;
        private q: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super();
            this.rgb = rgb(red, green, blue);
            this.delay = delay;
            this.j = 0;
            this.q = 0;
        }

        public showFrame(strip: NeoPixelStrip): void {
            const l = strip.length();
            if (this.start < 0) this.start = control.millis();
            const now = control.millis() - this.start;
            if (this.j < 10) { // 10 cycles of chasing
                if (this.q < 3) {
                    for (let i = 0; i < l; i = i + 3) {
                        strip.setPixelColor(i + this.q, this.rgb); // every third pixel on
                    }
                    strip.show();
                    loops.pause(this.delay);
                    for (let i = 0; i < l; i = i + 3) {
                        strip.setPixelColor(i + this.q, 0); // every third pixel off
                    }
                    strip.show();
                    this.q++;
                } else {
                    this.q = 0;
                }
                this.j++;
            } else {
                this.j = 0;
            }
        }
    }
}
