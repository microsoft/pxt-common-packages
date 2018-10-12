/**
 * Well known colors
 */
enum Colors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFF7F00,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xA033E5,
    //% block=pink
    Pink = 0xFF007F,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

/**
 * Well known color hues
 */
enum ColorHues {
    //% block=red
    Red = 0,
    //% block=orange
    Orange = 29,
    //% block=yellow
    Yellow = 43,
    //% block=green
    Green = 86,
    //% block=aqua
    Aqua = 125,
    //% block=blue
    Blue = 170,
    //% block=purple
    Purple = 191,
    //% block=magenta
    Magenta = 213,
    //% block=pink
    Pink = 234
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

/**
 * A determines the mode of the photon
 */
enum PhotonMode {
    //% block="pen up"
    PenUp,
    //% block="pen down"
    PenDown,
    //% block="eraser"
    Eraser,
    //% block="off"
    Off
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
        _pin: DigitalInOutPin;
        _buf: Buffer; // unscaled color buffer
        // per pixel scaling. This buffer is allocated on-demand when per-pixel brightness is needed.
        // when rendering, if this buffer is null, use _brightness instead
        _brightnessBuf: Buffer;
        _sendBuf: Buffer; // scaled color buffer
        _brightness: number; // global brightness for this strip
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
        _photonDir: number;
        _photonPenColor: number;
        // last animation used by showAnimationFrame
        _lastAnimation: NeoPixelAnimation;
        _lastAnimationRenderer: () => boolean;

        /**
         * Gets the underlying color buffer for the entire strip
         */
        get buf(): Buffer {
            if (this._parent) return this._parent.buf;
            if (!this._buf)
                this.reallocateBuffer();
            return this._buf;
        }

        get brightnessBuf(): Buffer {
            if (this._parent) return this._parent.brightnessBuf;
            if (!this._brightnessBuf) {
                const b = this.buf; // force allocate buffer
                this._brightnessBuf = pins.createBuffer(this._length);
                this._brightnessBuf.fill(this._brightness, 0, this._brightnessBuf.length);
            }
            return this._brightnessBuf;
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
        //% blockId="light_set_strip_color" block="%strip|set all pixels to %rgb=colorNumberPicker"
        //% parts="neopixel"
        //% help="light/neopixelstrip/set-all"
        //% weight=80 blockGap=8
        setAll(rgb: number) {
            const red = unpackR(rgb);
            const green = unpackG(rgb);
            const blue = unpackB(rgb);

            const end = this._start + this._length;
            const stride = this.stride();
            for (let i = this._start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
            this.autoShow();
        }

        /**
         * Display a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, 0 to autoscale
         */
        //% blockId=light_show_bar_graph block="%strip|graph %value||up to %high" icon="\uf080"
        //% help=light/neopixelstrip/graph
        //% parts="neopixel"
        //% weight=70
        graph(value: number, high?: number): void {
            console.logValue("", value);
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
            const nhalf = n / 2;
            const v = Math.round((value * n) / this._barGraphHigh);
            if (v == 0) {
                this.setAll(0);
            } else {
                for (let i = 0; i < n; ++i) {
                    if (i + 1 <= v) {
                        if (i < nhalf) {
                            const b = (i * 255 / nhalf) >> 0;
                            this.setPixelColor(i, light.rgb(0, b, 255 - b));
                        } else {
                            const b = ((i - nhalf) * 255 / nhalf) >> 0;
                            this.setPixelColor(i, light.rgb(b, 255 - b, 0));
                        }
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
        //% blockId="light_set_pixel_color" block="%strip|set pixel color at %pixeloffset|to %rgb=colorNumberPicker"
        //% help="light/neopixelstrip/set-pixel-color"
        //% parts="neopixel"
        //% weight=79
        setPixelColor(pixeloffset: number, color: number): void {
            pixeloffset = pixeloffset >> 0;
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            const stride = this.stride();
            pixeloffset = (pixeloffset + this._start) * stride;
            const red = unpackR(color);
            const green = unpackG(color);
            const blue = unpackB(color);
            this.setBufferRGB(pixeloffset, red, green, blue)
            this.autoShow();
        }

        /**
         * Gets the pixel color.
         * @param pixeloffset position of the NeoPixel in the strip
         */
        //% blockId="light_get_pixel_color" block="%strip|pixel color at %pixeloffset"
        //% help="light/neopixelstrip/pixel-color"
        //% parts="neopixel"
        //% group="More" weight=9 blockGap=8
        pixelColor(pixeloffset: number): number {
            pixeloffset = pixeloffset >> 0;
            if (pixeloffset < 0
                || pixeloffset >= this._length) {
                return 0;
            }

            const stride = this.stride();
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
        //% blockId="light_set_pixel_white_led" block="%strip|set pixel white LED at %pixeloffset|to %white"
        //% help="light/neopixelstrip/set-pixel-white-led"
        //% parts="neopixel"
        //% group="More" weight=5 blockGap=8
        setPixelWhiteLED(pixeloffset: number, white: number): void {
            if (this._mode != NeoPixelMode.RGBW) return;

            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this._start) * 4;
            white = white & 0xff;
            const buf = this.buf;
            buf[pixeloffset + 3] = white;
            this.autoShow();
        }

        /**
         * Make the strip show all the new changes for the pixels.
         */
        //% blockId="light_show" block="%strip|show"
        //% help="light/neopixelstrip/show"
        //% parts="neopixel"
        //% group="More" weight=86 blockGap=8
        show(): void {
            if (this._parent) this._parent.show();
            else if (this._pin) {
                const b = this.buf;
                // bb may be undefined if the brightness
                // is uniform over the strip and has not been allocated
                const _bb = this._brightnessBuf;
                if (!this._sendBuf) this._sendBuf = pins.createBuffer(b.length);
                const sb = this._sendBuf;
                const stride = this.stride();
                // apply brightness
                for (let i = 0; i < this._length; ++i) {
                    const offset = (this._start + i) * stride;
                    for (let j = 0; j < stride; ++j)
                        sb[offset + j] = (b[offset + j] * (_bb ? _bb[i] : this._brightness)) >> 8;
                }
                // apply photon
                if (this._photonPenColor) {
                    // draw head and trail
                    const tailn = Math.min(2, Math.max(8, this._length / 10));
                    let pi = this._photonPos * stride;
                    let c = Math.max(128, this._brightness);
                    let dc = (c - 32) / tailn;
                    for (let bi = 0; bi < tailn && c > 0; ++bi) {
                        if (this._mode == NeoPixelMode.RGBW)
                            sb[pi + 3] = c;
                        else
                            sb[pi] = sb[pi + 1] = sb[pi + 2] = c;

                        c -= dc;
                        pi += (-this._photonDir * stride) % sb.length;
                        if (pi < 0) pi += sb.length;
                    }
                }
                light.sendBuffer(this._pin, this._mode, sb);
            }
        }

        /**
         * Turn off all pixel LEDs.
         */
        //% blockId="light_clear" block="%strip|clear"
        //% parts="neopixel"
        //% help="light/neopixelstrip/clear"
        //% group="More" weight=85
        clear(): void {
            const stride = this.stride();
            this.buf.fill(0, this._start * stride, this._length * stride);
            this.autoShow();
        }

        /**
         * Get the number of pixels on the strip
         */
        //% blockId="light_length" block="%strip|length"
        //% help="light/neopixelstrip/length"
        //% group="More" weight=8 blockGap=8
        length() {
            return this._length;
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 20
         */
        //% blockId="light_set_brightness" block="%strip|set brightness %brightness"
        //% brightness.min=0 brightness.max=255
        //% help="light/neopixelstrip/set-brightness"
        //% parts="neopixel"
        //% weight=2 blockGap=8
        setBrightness(brightness: number): void {
            this._brightness = Math.max(0, Math.min(0xff, brightness >> 0));
            // if this is a top level strip clear any existing brightness buffer
            if (!this._parent)
                this._brightnessBuf = undefined;
            // if this is a NOT top-level strip or if brightness buff has been allocated,
            else if (this._parent || this._brightnessBuf)
                this.brightnessBuf.fill(this._brightness, this._start, this._length);
            this.autoShow();
        }

        /**
         * Get the brightness of the pixel strip.
         */
        //% blockId="light_get_brightness" block="%strip|brightness"
        //% help="light/neopixelstrip/brightness"
        //% parts=neopixel
        //% group="More" weight=7
        brightness(): number {
            return this._brightness;
        }

        /**
         * Create a range of pixels.
         * @param start offset in the NeoPixel strip to start the range
         * @param length number of pixels in the range, eg: 4
         */
        //% blockId="light_range" block="%strip|range from %start|with %length|pixels"
        //% help="light/neopixelstrip/range"
        //% parts="neopixel"
        //% weight=99 blockGap=30
        range(start: number, length: number): NeoPixelStrip {
            let strip = new NeoPixelStrip();
            strip._parent = this;
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
        //% blockId="light_move_pixels" block="%strip|%kind=MoveKind|by %offset"
        //% help="light/neopixelstrip/move"
        //% parts="neopixel"
        //% group="More" weight=87 blockGap=8
        move(kind: LightMove, offset: number = 1): void {
            const stride = this.stride();
            if (kind === LightMove.Shift) {
                this.buf.shift(-offset * stride, this._start * stride, this._length * stride)
            }
            else {
                this.buf.rotate(-offset * stride, this._start * stride, this._length * stride)
            }
            this.autoShow();
        }

        private stride(): number {
            return this._mode === NeoPixelMode.RGBW ? 4 : 3;
        }

        initPhoton() {
            if (this._photonPos === undefined) {
                this._photonMode = PhotonMode.PenDown;
                this._photonPos = 0;
                this._photonDir = 1;
                this._photonPenColor = Colors.Red;
            }
        }

        /**
         * Move a photon effect along the pixel strip by a number of steps.
         * @param steps number of steps (lights) to move, eg: 1
         */
        //% blockId=light_photon_fd block="%strip|photon forward by %steps"
        //% help="light/neopixelstrip/photon-forward"
        //% parts="neopixel"
        //% group="Photon" weight=41 blockGap=8
        photonForward(steps: number) {
            this.setPhotonPosition(this._photonPos + this._photonDir * steps);
        }

        /**
         * Switch the direction of the photon pulse.
         */
        //% blockId=light_photon_flip block="%strip|photon flip"
        //% help="light/neopixelstrip/photon-flip"
        //% parts="neopixel"
        //% group="Photon" weight=40 blockGap=8
        photonFlip() {
            this.initPhoton();
            this._photonDir *= -1;
        }

        /**
         * Sets the photon position to a given light index
         * @param index index of the light, if out of bound, the index is wrapped
         */
        //% blockId=light_photon_set_position block="%strip|photon set position %index"
        //% help="light/neopixelstrip/set-photon-position"
        //% parts="neopixel"
        //% group="Photon" weight=39 blockGap=8
        setPhotonPosition(index: number) {
            this.initPhoton();

            // disable buffering
            const buffered = this.buffered();
            this.setBuffered(false);

            // move
            this._photonPos = (index >> 0) % this._length;
            if (this._photonPos < 0) this._photonPos += this._length;

            // paint under photon
            if (this._photonMode == PhotonMode.PenDown)
                this.setPixelColor(this._photonPos, this._photonPenColor);
            else if (this._photonMode == PhotonMode.Eraser)
                this.setPixelColor(this._photonPos, 0); // erase led

            // restoring buffer
            this.setBuffered(buffered);

            this.autoShow();
        }

        /**
         * Set the photon color.
         * @param color the color of the photon
         */
        //% blockId=light_photon_set_pen_color block="%strip=variables_get|photon set pen color %color=colorNumberPicker"
        //% help="light/neopixelstrip/set-photon-pen-color"
        //% parts="neopixel"
        //% group="Photon" weight=38 blockGap=8
        setPhotonPenColor(color: number) {
            this.initPhoton();
            this._photonPenColor = color;
            this.photonForward(0);
        }

        /**
         * Sets the photon hue.
         * @param hue the hue of the photon color
         */
        //% blockId=light_photon_set_pen_hue block="%strip=variables_get|photon set pen hue %hue=colorWheelHsvPicker"
        //% help="light/neopixelstrip/set-photon-pen-hue"
        //% parts="neopixel"
        //% group="Photon" weight=39 blockGap=8
        setPhotonPenHue(hue: number) {
            this.setPhotonPenColor(hsv(hue, 0xff, 0xff));
        }

        //% deprecated=1 blockHidden=1
        setPhotonColor(hue: number) {
            this.setPhotonPenHue(hue);
        }

        /**
         * Set the photon mode to pen up, pen down, or eraser.
         * @param mode the desired mode
         */
        //% blockId=light_photon_set_photon block="%strip|photon %mode"
        //% help="light/neopixelstrip/set-photon-mode"
        //% parts="neopixel"
        //% group="Photon" weight=38
        setPhotonMode(mode: PhotonMode) {
            if (mode == PhotonMode.Off) {
                this._photonPos = undefined;
                this.show();
            } else {
                this.initPhoton();
                if (this._photonMode != mode) {
                    this._photonMode = mode;
                    this.photonForward(0);
                }    
            }
        }

        /**
         * Show an animation or queue an animation in the animation queue
         * @param animation the animation to run
         * @param duration the duration to run in milliseconds, eg: 500
         */
        //% blockId=light_show_animation block="%strip|show animation %animation=light_animation_picker|for %duration=timePicker|ms"
        //% help="light/neopixelstrip/show-animation"
        //% parts="neopixel"
        //% weight=90 blockGap=8
        showAnimation(animation: NeoPixelAnimation, duration: number) {
            if (!animation) return;

            // if a previous renderer for the same animation was used, keep using it
            let animationRenderer = this._lastAnimationRenderer;
            if (!animationRenderer || this._lastAnimation != animation) {
                animationRenderer = animation.createRenderer(this);
                if (!animationRenderer) return;
            }

            let start = -1;
            const render: () => boolean = () => {
                // keep track of whose running
                this._lastAnimation = animation;
                this._lastAnimationRenderer = animationRenderer;
                // execute animation
                if (start < 0) start = control.millis();
                const now = control.millis() - start;
                const buf = this.buffered();
                this.setBuffered(true);
                const keepRendering = animationRenderer();
                this.setBuffered(buf);
                this.show();
                return duration > 0
                    ? now <= duration
                    : keepRendering;
            };
            this.queueAnimation(render);
        }

        /**
         * Show a single animation frame.
         * @param animation the animation to run
         */
        //% blockId=light_show_animation_frame block="%strip|show frame of %animation=light_animation_picker|animation"
        //% help="light/neopixelstrip/show-animation-frame"
        //% parts="neopixel"
        //% weight=87 blockGap=8
        showAnimationFrame(animation: NeoPixelAnimation) {
            if (!animation) {
                this._lastAnimation = undefined;
                this._lastAnimationRenderer = undefined;
                return;
            }
            let renderer = this._lastAnimationRenderer;
            if (!renderer || this._lastAnimation != animation) {
                this._lastAnimation = animation;
                renderer = this._lastAnimationRenderer = animation.createRenderer(this);
            }
            if (renderer) {
                const buf = this.buffered();
                this.setBuffered(true);
                renderer();
                this.setBuffered(buf);
                this.autoShow();
            }
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
                            pause(interval);
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
            if (!this._animationQueue) {
                this._animationQueue = new control.AnimationQueue();
                this._animationQueue.interval = 50;
                this._lastAnimation = undefined;
                this._lastAnimationRenderer = undefined;
            }
            this._animationQueue.runUntilDone(render);
        }

        /**
         * Stop the current animation and any other animations ready to show.
         */
        //% blockId=light_stop_all_animations block="%strip|stop all animations"
        //% parts="neopixel"
        //% help="light/neopixelstrip/stop-all-animations"
        //% weight=85
        stopAllAnimations() {
            if (this._animationQueue) {
                this._animationQueue.cancel();
                this._lastAnimation = undefined;
                this._lastAnimationRenderer = undefined;
            }
        }

        /**
         * Enables or disables automatically calling show when a change is made
         * @param on call show whenever a light is modified
         */
        //% blockId=light_set_buffered block="%strip|set buffered  %on"
        //% help="light/neopixelstrip/set-buffered"
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
        //% blockId=light_set_mode block="%strip|set mode %mode"
        //% help="light/neopixelstrip/set-mode"
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
            const b = this.buf;
            if (this._mode === NeoPixelMode.RGB_RGB) {
                b[offset + 0] = red;
                b[offset + 1] = green;
            } else {
                b[offset + 0] = green;
                b[offset + 1] = red;
            }
            b[offset + 2] = blue;
        }

        private reallocateBuffer(): void {
            const stride = this.stride();
            this._buf = pins.createBuffer(this._length * stride);
            this._brightnessBuf = undefined;
            this._sendBuf = undefined;
        }

        // From here onwards, these block definitions are there for compatibility with old blocks
        // (that have the default instance logic)

        /**
         * Set all of the pixels on the strip to one RGB color.
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_strip_color" block="set all pixels to %rgb=colorNumberPicker"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __setAll(rgb: number) {
            this.setAll(rgb);
        }

        /**
         * Display a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, 0 to autoscale
         */
        //% blockId=neopixel_show_bar_graph block="graph %value |up to %high" icon="\uf080"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __graph(value: number, high: number): void {
            this.graph(value, high);
        }

        /**
         * Set the pixel to a given color.
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the NeoPixel in the strip
         * @param color RGB color of the LED
         */
        //% blockId="neopixel_set_pixel_color" block="set pixel color at %pixeloffset|to %rgb=colorNumberPicker"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __setPixelColor(pixeloffset: number, color: number): void {
            this.setPixelColor(pixeloffset, color);
        }

        /**
         * Gets the pixel color.
         * @param pixeloffset position of the NeoPixel in the strip
         */
        //% blockId="neopixel_get_pixel_color" block="pixel color at %pixeloffset"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __pixelColor(pixeloffset: number): number {
            return this.pixelColor(pixeloffset);
        }

        /**
         * Set the white brightness of a pixel in a NeoPixel strip of RGB+W LEDs.
         * This only works for RGB+W NeoPixels.
         * @param pixeloffset position of the LED in the strip
         * @param white brightness of the white LED
         */
        //% blockId="neopixel_set_pixel_white_led" block="set pixel white LED at %pixeloffset|to %white"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __setPixelWhiteLED(pixeloffset: number, white: number): void {
            this.setPixelWhiteLED(pixeloffset, white);
        }

        /**
         * Make the strip show all the new changes for the pixels.
         */
        //% blockId="neopixel_show" block="show"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __show(): void {
            this.show();
        }

        /**
         * Turn off all pixel LEDs.
         */
        //% blockId="neopixel_clear" block="clear"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __clear(): void {
            this.clear();
        }

        /**
         * Get the number of pixels on the strip
         */
        //% blockId="neopixel_length" block="length"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __length() {
            return this.length();
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 20
         */
        //% blockId="neopixel_set_brightness" block="set brightness %brightness"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __setBrightness(brightness: number): void {
            this.setBrightness(brightness);
        }

        /**
         * Get the brightness of the pixel strip.
         */
        //% blockId="neopixel_get_brightness" block="brightness"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __brightness(): number {
            return this.brightness();
        }

        /**
         * Create a range of pixels.
         * @param start offset in the NeoPixel strip to start the range
         * @param length number of pixels in the range. eg: 4
         */
        //% blockId="neopixel_range" block="range from %start|with %length|pixels"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __range(start: number, length: number): NeoPixelStrip {
            return this.range(start, length);
        }

        /**
         * Shift LEDs forward and clear with zeros.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to shift forward, eg: 1
         */
        //% blockId="neopixel_move_pixels" block="%kind=MoveKind|by %offset"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __move(kind: LightMove, offset: number = 1): void {
            this.move(kind, offset);
        }

        /**
         * Move a photon effect along the pixel strip by a number of steps.
         * @param steps number of steps (lights) to move, eg: 1
         */
        //% blockId=neophoton_fd block="photon forward by %steps"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __photonForward(steps: number) {
            this.photonForward(steps);
        }

        /**
         * Switch the direction of the photon pulse.
         */
        //% blockId=neophoton_flip block="photon flip"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __photonFlip() {
            this.photonFlip();
        }

        /**
         * Set the photon color.
         * @param color the color of the photon
         */
        //% blockId=neophoton_set_color block="photon set pen color %color"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __setPhotonColor(color: number) {
            // The photon color has since changed, and we now use setPhotonPenHue to set the hue of the photon color
            this.setPhotonPenHue(color);
        }

        /**
         * Set the photon mode to pen up, pen down, or eraser.
         * @param mode the desired mode
         */
        //% blockId=neophoton_set_photon block="photon %mode"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __setPhotonMode(mode: PhotonMode) {
            this.setPhotonMode(mode);
        }

        /**
         * Show an animation or queue an animation in the animation queue
         * @param animation the animation to run
         * @param duration the duration to run in milliseconds, eg: 500
         */
        //% blockId=neopixel_show_animation block="show %animation=light_animation|animation for %duration=timePicker|ms"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __showAnimation(animation: NeoPixelAnimation, duration: number) {
            this.showAnimation(animation, duration);
        }

        /**
         * Show a single animation frame
         * @param animation the animation to run
         */
        //% blockId=neopixel_show_animation_frame block="show animation frame %animation=light_animation"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __showAnimationFrame(animation: NeoPixelAnimation) {
            this.showAnimationFrame(animation);
        }

        /**
         * Stop the current animation and any other animations ready to show.
         */
        //% blockId=neopixel_stop_all_animations block="stop all animations"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __stopAllAnimations() {
            this.stopAllAnimations();
        }

        /**
         * Enables or disables automatically calling show when a change is made
         * @param on call show whenever a light is modified
         */
        //% blockId=neopixel_set_buffered block="set buffered  %on"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __setBuffered(on: boolean): void {
            this.setBuffered(on);
        }

        /**
         * Sets the color mode and clears the colors.
         * @param mode the kind of color encoding required by the programmable lights
         */
        //% blockId=neopixel_set_mode block="set mode %mode"
        //% deprecated=1
        //% defaultInstance=light.pixels
        __setMode(mode: NeoPixelMode): void {
            this.setMode(mode);
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
        pin: DigitalInOutPin = null,
        numleds: number = 10,
        mode?: NeoPixelMode
    ): NeoPixelStrip {
        if (!mode)
            mode = NeoPixelMode.RGB

        const strip = new NeoPixelStrip();
        strip._buffered = false;
        strip._mode = mode;
        strip._length = Math.max(0, numleds);
        strip._brightness = 20;
        strip._start = 0;
        strip._pin = pin ? pin : defaultPin();
        if (strip._pin) // board with no-board LEDs won't have a default pin
            strip._pin.digitalWrite(false);
        strip._barGraphHigh = 0;
        strip._barGraphHighLast = 0;

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
    export function hsv(hue: number, sat: number = 255, val: number = 255): number {
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
     * An animation of a NeoPixel
     */
    //% fixedInstances
    export class NeoPixelAnimation {
        constructor() { }

        /**
         * Creates an animator instance
         * @param strip the strip to execute on
         */
        createRenderer(strip: NeoPixelStrip): () => boolean {
            return undefined;
        }
    }

    class RainbowCycleAnimation extends NeoPixelAnimation {
        public delay: number;
        constructor(delay: number) {
            super();
            this.delay = delay;
        }

        public createRenderer(strip: NeoPixelStrip): () => boolean {
            const n = strip.length();
            let offset = 0;
            return () => {
                for (let i = 0; i < n; i++) {
                    strip.setPixelColor(i, hsv(((i * 256) / (n - 1) + offset) % 0xff, 0xff, 0xff));
                }
                offset += 128 / n;
                if (offset >= 0xff) {
                    offset = 0;
                    return false;
                } else {
                    return true;
                }
            }
        }
    }

    //% fixedInstance block="rainbow" whenUsed jres blockIdentity="light._animationPicker"
    export const rainbowAnimation: NeoPixelAnimation = new RainbowCycleAnimation(50);

    class RunningLightsAnimation extends NeoPixelAnimation {
        public red: number;
        public green: number;
        public blue: number;
        public delay: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super();
            this.red = red;
            this.green = green;
            this.blue = blue;

            this.delay = delay;
        }

        public createRenderer(strip: NeoPixelStrip): () => boolean {
            const l = strip.length();
            let iteration = 0;
            let step = 0;
            return () => {
                if (iteration < l * 2) {
                    step++;
                    for (let i = 0; i < l; i++) {
                        const level = (Math.isin(i + step) * 127) + 128;
                        strip.setPixelColor(i, rgb(level * this.red / 255, level * this.green / 255, level * this.blue / 255));
                    }
                    iteration++;
                    return true;
                } else {
                    step = 0;
                    iteration = 0;
                    return false;
                }
            }
        }
    }

    //% fixedInstance block="running lights" jres blockIdentity="light._animationPicker"
    export const runningLightsAnimation: NeoPixelAnimation = new RunningLightsAnimation(0xff, 0, 0, 50);

    class CometAnimation extends NeoPixelAnimation {
        public red: number;
        public green: number;
        public blue: number;
        public delay: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super();
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.delay = delay;
        }

        public createRenderer(strip: NeoPixelStrip): () => boolean {
            const l = strip.length();
            const spacing = (255 / l) >> 0;
            let start = -1;
            let step = 0;
            const offsets: number[] = [];
            for (let i = 0; i < l; i++) {
                offsets[i] = spacing * i;
            }
            return () => {
                for (let i = 0; i < l; i++) {
                    offsets[i] = (offsets[i] + (step * 2)) % 255
                    strip.setPixelColor(i, rgb(255 - offsets[i], this.green, this.blue));
                }
                step++;
                if (step * 2 > 0xff) {
                    step = 0;
                    return false;
                }
                return true;
            }
        }
    }

    //% fixedInstance block="comet" jres blockIdentity="light._animationPicker"
    export const cometAnimation: NeoPixelAnimation = new CometAnimation(0xff, 0, 0xff, 50);

    class SparkleAnimation extends NeoPixelAnimation {
        public rgb: number;
        public delay: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super();
            this.rgb = rgb(red, green, blue);
            this.delay = delay;
        }

        public createRenderer(strip: NeoPixelStrip): () => boolean {
            const l = strip.length();
            let count = 0;
            let pixel = -1;
            let pixelColor = 0;
            return () => {
                if (count == 0)
                    strip.clear();
                if (pixel < 0) {
                    pixel = Math.randomRange(0, l - 1);
                    pixelColor = strip.pixelColor(pixel);
                    strip.setPixelColor(pixel, this.rgb);

                } else {
                    strip.setPixelColor(pixel, pixelColor);
                    pixel = -1;
                }
                count++;
                if (count > 50) {
                    count = 0;
                    return false;
                } else {
                    return true;
                }
            }
        }
    }

    //% fixedInstance block="sparkle" jres blockIdentity="light._animationPicker"
    export const sparkleAnimation: NeoPixelAnimation = new SparkleAnimation(0xff, 0xff, 0xff, 50);

    class ColorWipeAnimation extends NeoPixelAnimation {
        public rgb: number;
        public delay: number;

        constructor(rgb: number, delay: number) {
            super();
            this.rgb = rgb;
            this.delay = delay;
        }

        public createRenderer(strip: NeoPixelStrip): () => boolean {
            const l = strip.length();
            let i = 0;
            let reveal = true;
            return () => {
                if (i < l) {
                    if (reveal) {
                        strip.setPixelColor(i, this.rgb);
                    } else {
                        strip.setPixelColor(i, 0);
                    }
                    i++;
                } else {
                    reveal = !reveal;
                    i = 0;
                    if (reveal)
                        return false;
                }
                return true;
            }
        }
    }

    //% fixedInstance block="color wipe" jres blockIdentity="light._animationPicker"
    export const colorWipeAnimation: NeoPixelAnimation = new ColorWipeAnimation(0x0000ff, 50);

    class TheatreChaseAnimation extends NeoPixelAnimation {
        public rgb: number;
        public delay: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super();
            this.rgb = rgb(red, green, blue);
            this.delay = delay;
        }

        public createRenderer(strip: NeoPixelStrip): () => boolean {
            const l = strip.length();
            let j = 0;
            let q = 0;
            let on = false;
            return () => {
                if (j < 10) { // 10 cycles of chasing
                    if (q < 3) {
                        if (on) {
                            for (let i = 0; i < l; i = i + 3) {
                                strip.setPixelColor(i + q, this.rgb); // every third pixel on
                            }
                        }
                        else {
                            for (let i = 0; i < l; i = i + 3) {
                                strip.setPixelColor(i + q, 0); // every third pixel off
                            }
                        }
                        on = !on;
                        q++;
                    } else {
                        q = 0;
                    }
                    j++;
                } else {
                    j = 0;
                    return false;
                }
                return true;
            }
        }
    }

    //% fixedInstance block="theater chase" jres blockIdentity="light._animationPicker"
    export const theaterChaseAnimation: NeoPixelAnimation = new TheatreChaseAnimation(0xff, 0, 0, 50);

    /**
     * An animation that can be shown on a light strip
     * @param animation The animation type
     */
    //% blockId=light_animation_picker block="%animation" shim=TD_ID
    //% animation.fieldEditor="imagedropdown"
    //% animation.fieldOptions.columns=3
    //% group="More" weight=0
    export function _animationPicker(animation: NeoPixelAnimation): NeoPixelAnimation {
        return animation;
    }
}
