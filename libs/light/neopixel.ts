/**
 * Well known colors for a NeoPixel strip
 */
enum Colors {
    //% block=red blockIdentity=light.colors
    Red = 0xFF0000,
    //% block=orange blockIdentity=light.colors
    Orange = 0xFFA500,
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
    Purple = 0xFF00FF,
    //% block=white blockIdentity=light.colors
    White = 0xFFFFFF
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
    //% block="rainbow"
    Rainbow,
    //% block="running lights"
    RunningLights,
    //% block="comet"
    Comet,
    //% block="sparkle"
    Sparkle,
    //% block="theater chase"
    TheaterChase,
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
namespace light {
    /**
     * Turns the status LED on or off.
     * @param on a value indicating if the LED is on
     */
    //% weight=1 advanced=true
    //% blockId=light_status_led block="status led %on"
    export function statusLED(on: boolean) {
        if (on) pins.LED.digitalWrite(1);
        else pins.LED.digitalWrite(0);
    }

    /**
     * A NeoPixel strip
     */
    //% autoCreate=light.createNeoPixelStrip
    export class NeoPixelStrip {
        _parent: NeoPixelStrip;
        _pin: DigitalPin;
        // TODO: encode as bytes instead of 32bit
        _brightness: number;
        _start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _mode: NeoPixelMode;
        _buffered: boolean;
        _animation: () => void;
        _animationType: number;
        _buf: Buffer;
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
         * Shows all LEDs to a given color (range 0-255 for r, g, b).
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_strip_color" block="set all pixels to %rgb=neopixel_colors"
        //% weight=90 blockGap=8
        //% parts="neopixel"
        //% defaultInstance=light.pixels
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
         * Displays a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, 0 to autoscale
         */
        //% weight=5 blockGap=8
        //% blockId=neopixel_show_bar_graph block="graph of %value |up to %high" icon="\uf080" blockExternalInputs=true
        //% parts="neopixel" advanced=true
        //% defaultInstance=light.pixels
        graph(value: number, high: number): void {
            serial.writeString(value + "\n"); // auto chart
            value = Math.abs(value);

            const now = control.millis();
            if (high > 0) this._barGraphHigh = high;
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
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_pixel_color" block="set pixel color at %pixeloffset|to %rgb=neopixel_colors"
        //% weight=89 advanced=true
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        setPixelColor(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            let stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this._start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this._brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
            this.autoShow();
        }

        /**
         * Gets the pixel color.
         * @param pixeloffset position of the NeoPixel in the strip
         */
        //% blockId="neopixel_get_pixel_color" block="pixel color at %pixeloffset"
        //% blockGap=8
        //% weight=4 advanced=true
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        pixelColor(pixeloffset: number): number {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return 0;

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
         * For NeoPixels with RGB+W LEDs, set the white LED brightness. This only works for RGB+W NeoPixels.
         * @param pixeloffset position of the LED in the strip
         * @param white brightness of the white LED
         */
        //% blockId="neopixel_set_pixel_white" block="set pixel white LED at %pixeloffset|to %white"
        //% blockGap=8
        //% weight=80
        //% parts="neopixel" advanced=true
        //% defaultInstance=light.pixels
        setPixelWhiteLED(pixeloffset: number, white: number): void {
            if (this._mode != NeoPixelMode.RGBW) return;

            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this._start) * 4;

            const br = this._brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            buf[pixeloffset + 3] = white;
            this.autoShow();
        }

        /**
         * Send all the changes to the strip.
         */
        //% blockId="neopixel_show" block="show" blockGap=8
        //% weight=4
        //% parts="neopixel"
        //% defaultInstance=light.pixels advanced=true
        show() {
            sendBuffer(this._pin, this.buf);
        }

        /**
         * Turn off all LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% blockId="neopixel_clear" block="clear"
        //% weight=88
        //% parts="neopixel" advanced=true
        //% defaultInstance=light.pixels
        clear(): void {
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.fill(0, this._start * stride, this._length * stride);
            this.autoShow();
        }

        /**
         * Gets the number of pixels declared on the strip
         */
        //% blockId="neopixel_length" block="length" blockGap=8
        //% weight=88 advanced=true
        //% defaultInstance=light.pixels
        length() {
            return this._length;
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 20
         */
        //% blockId="neopixel_set_brightness" block="set brightness %brightness" blockGap=8
        //% weight=59 advanced=true
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        setBrightness(brightness: number): void {
            this._brightness = Math.max(0, Math.min(0xff, brightness >> 0));
        }

        /**
         * Gets the brightness of the strip.
         */
        //% blockId="neopixel_get_brightness" block="brightness"
        //% weight=58 advanced=true
        //% parts=neopixel
        //% defaultInstance=light.pixels
        brightness(): number {
            return this._brightness;
        }

        /**
         * Create a range of pixels.
         * @param start offset in the NeoPixel strip to start the range
         * @param length number of pixels in the range. eg: 4
         */
        //% weight=89
        //% blockId="neopixel_range" block="range from %start|with %length|pixels"
        //% parts="neopixel" advanced=true
        //% defaultInstance=light.pixels
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
        //% blockId="neopixel_move_pixels" block="%kind=MoveKind|by %offset" blockGap=8
        //% weight=30
        //% parts="neopixel" advanced=true
        //% defaultInstance=light.pixels
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
                this.paintPhoton();
            }
        }

        paintPhoton() {
            const br = this.brightness();
            this.setBrightness(br + 64);
            this.setPixelColor(this._photonPos, 0xffffff);
            this.setBrightness(br);
        }

        /**
         * Moves the light photon and paints the leds
         * @param action forward or backward
         * @param steps number of steps (lights) to move, eg: 1
         */
        //% blockGap=8 weight=40
        //% blockId=neophoton_fd block="photon forward by %steps"
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        photonForward(steps: number) {
            this.initPhoton();

            // unpaint current pixel
            this.setPixelColor(this._photonPos, this._photonMasked);

            // move
            this._photonPos = (this._photonPos + this._photonDir * steps) >> 0;
            this._photonPos = this._photonPos % this._length;
            if (this._photonPos < 0) this._photonPos += this._length;

            // store current color
            if (this._photonMode == PhotonMode.PenDown)
                this._photonMasked = light.colorWheel(this._photonColor);
            else if (this._photonMode == PhotonMode.Eraser)
                this._photonMasked = 0; // erase led
            else this._photonMasked = this.pixelColor(this._photonPos);

            // paint photon
            this.paintPhoton();
        }

        /**
         * Flips the direction of the photon
         */
        //% blockGap=8 weight=40
        //% blockId=neophoton_flip block="photon flip"
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        photonFlip() {
            this.initPhoton();
            this._photonDir *= -1;
        }

        /**
         * Sets the photon color
         * @param color the color of the photon
         */
        //% weight=39
        //% blockId=neophoton_set_color block="photon set color %color"
        //% parts="neopixel" blockGap=8
        //% defaultInstance=light.pixels
        //% color.min=0 color.max=255
        setPhotonColor(color: number) {
            this.initPhoton();
            this._photonColor = color & 0xff;
        }

        /**
         * Sets the desired mode of the photon, pen up, pen down or eraser
         * @param mode the desired mode
         */
        //% weight=38
        //% blockId=neophoton_set_photon block="photon %mode"
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        setPhotonMode(mode: PhotonMode) {
            this.initPhoton();
            if (this._photonMode != mode) {
                this._photonMode = mode;
                this.photonForward(0);
            }
        }

        /**
         * Set the current animation
         */
        //% blockId="neopixel_draw_animation_frame" block="show frame of %animation=neopixel_animation|animation"
        //% weight=70
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        showAnimationFrame(animation: NeoPixelAnimation): void {
            if (!this._animation || this._animationType != animation.type) {
                this.clear();
                this._animationType = animation.type;
                this._animation = animation.create(this);
            }
            const brf = this.buffered();
            this.setBuffered(true);
            this._animation();
            this.setBuffered(brf);
        }

        /**
         * Set the current animation
         */
        //% blockId="neopixel_animation" block="%value"
        //% weight=1 advanced=true
        //% defaultInstance=light.pixels
        animation(kind: LightAnimation): NeoPixelAnimation {
            switch (kind) {
                case LightAnimation.RunningLights: return AnimationFactory.getRunningLights();
                case LightAnimation.Comet: return AnimationFactory.getComet();
                case LightAnimation.ColorWipe: return AnimationFactory.getColorWipe(0x0000ff);
                case LightAnimation.TheaterChase: return AnimationFactory.getTheatreChase();
                case LightAnimation.Sparkle: return AnimationFactory.getSparkle();
                default: return AnimationFactory.getRainbow();
            }
        }

        /**
         * Enables or disables automatically calling show when a change is made
         * @param on call show whenever a light is modified
         */
        setBuffered(on: boolean) {
            if (this._parent) this._parent.setBuffered(on);
            else this._buffered = on;
        }

        /**
         * Gets a value indicated if the changes are buffered
         */
        buffered(): boolean {
            return this._parent ? this._parent.buffered() : this._buffered;
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
     * Create a new NeoPixel driver for `numleds` LEDs.
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the strip, eg: 24,30,60,64
     */
    //% blockId="neopixel_create" block="create NeoPixel strip|pin %pin|pixels %numleds|mode %mode"
    //% weight=90 blockGap=8 advanced=true blockExternalInputs=1
    //% parts="neopixel"
    //% trackArgs=0,2
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
        strip._pin = pin ? pin : (defaultPin() || pins.D0);
        strip._pin.digitalWrite(0);
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
    //% weight=4 blockGap=8
    //% blockId="neopixel_rgb" block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% subcategory="Colors"
    export function rgb(red: number, green: number, blue: number): number {
        return ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 blockGap=8
    //% blockId=neopixel_colors block="%color"
    //% shim=TD_ID
    //% subcategory="Colors"
    export function colors(color: Colors): number {
        return color;
    }

    /**
     * Gets an RGB color given the value of an angle between 0 and 255. Useful
     * for performing math with colors.
    */
    //% weight=1 blockGap=8
    //% blockId="neopixel_color_wheel" block="color wheel %angle"
    //% angle.min=0 angle.max=255
    //% subcategory="Colors"
    export function colorWheel(angle: number): number {
        return hsv(angle, 255, 255);
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
     * Converts an HSV (hue, saturation, value) color to RGB
     * @param hue value of the hue channel between 0 and 255. eg: 255
     * @param sat value of the saturation channel between 0 and 255. eg: 255
     * @param val value of the value channel between 0 and 255. eg: 255
     */
    //% weight=3 blockGap=8
    //% blockId="neopixel_hsv" block="hue %hue|sat %sat|val %val"
    //% hue.min=0 hue.max=255 sat.min=0 sat.max=255 val.min=0 val.max=255
    //% subcategory="Colors"
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

    //%
    export const pixels = light.createNeoPixelStrip();

    class AnimationFactory {
        private static rainbowSingleton: RainbowCycleAnimation;
        static getRainbow(): RainbowCycleAnimation {
            if (!AnimationFactory.rainbowSingleton) AnimationFactory.rainbowSingleton = new RainbowCycleAnimation();
            return AnimationFactory.rainbowSingleton;
        }
        private static runningLightsSingleton: RunningLightsAnimation;
        static getRunningLights(): RunningLightsAnimation {
            if (!AnimationFactory.runningLightsSingleton) AnimationFactory.runningLightsSingleton = new RunningLightsAnimation(0xff, 0xff, 0x00, 50);
            return AnimationFactory.runningLightsSingleton;
        }

        private static cometSingleton: CometAnimation;
        static getComet(): CometAnimation {
            if (!AnimationFactory.cometSingleton) AnimationFactory.cometSingleton = new CometAnimation(0, 0, 40);
            return AnimationFactory.cometSingleton;
        }

        private static sparkleSingleton: SparkleAnimation;
        static getSparkle(): SparkleAnimation {
            if (!AnimationFactory.sparkleSingleton) AnimationFactory.sparkleSingleton = new SparkleAnimation(0xff, 0xff, 0xff, 0);
            return AnimationFactory.sparkleSingleton;
        }

        private static colorWipeSingleton: ColorWipeAnimation;
        static getColorWipe(rgb: number): ColorWipeAnimation {
            if (!AnimationFactory.colorWipeSingleton) AnimationFactory.colorWipeSingleton = new ColorWipeAnimation(rgb, 50);
            AnimationFactory.colorWipeSingleton.rgb = rgb;
            return AnimationFactory.colorWipeSingleton;
        }

        private static theatreChaseSingleton: TheatreChaseAnimation;
        static getTheatreChase(): TheatreChaseAnimation {
            if (!AnimationFactory.theatreChaseSingleton) AnimationFactory.theatreChaseSingleton = new TheatreChaseAnimation(0xff, 0, 0, 50);
            return AnimationFactory.theatreChaseSingleton;
        }
    }

    export class NeoPixelAnimation {
        public type: number;
        constructor(type: number) {
            this.type = type;
        }
        public create(strip: NeoPixelStrip): () => void {
            return null;
        }
    }

    class RainbowCycleAnimation extends NeoPixelAnimation {
        private _speed: number;

        constructor(speed: number = 10) {
            super(1001);
            this._speed = speed;
        }

        public create(strip: NeoPixelStrip): () => void {
            const l = strip.length();
            const speed = this._speed;
            return () => {
                const offset = control.millis() / speed;
                for (let i = 0; i < l; i++) {
                    strip.setPixelColor(i, colorWheel(((i * 256 / l) + offset) & 0xff));
                }
                strip.show();
            }
        }
    }

    class RunningLightsAnimation extends NeoPixelAnimation {
        public red: number;
        public green: number;
        public blue: number;
        public delay: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super(1002);
            this.red = red;
            this.green = green;
            this.blue = blue;

            this.delay = delay;
        }


        public create(strip: NeoPixelStrip): () => void {
            let j = 0;
            let step = 0;
            const l = strip.length();
            return () => {
                if (j < l * 2) {
                    step++;
                    for (let i = 0; i < l; i++) {
                        const level = (Math.sin(i + step) * 127) + 128;
                        strip.setPixelColor(i, rgb(level * this.red / 255, level * this.green / 255, level * this.blue / 255));
                    }
                    strip.show();
                    loops.pause(this.delay);
                    j++;
                } else {
                    step = 0;
                    j = 0;
                }
            }
        }
    }

    class CometAnimation extends NeoPixelAnimation {
        public red: number;
        public green: number;
        public blue: number;

        constructor(red: number, green: number, blue: number) {
            super(1003);
            this.red = red;
            this.green = green;
            this.blue = blue;
        }

        public create(strip: NeoPixelStrip): () => void {
            const offsets: number[] = [];
            const l = strip.length();
            const spacing = (255 / l) >> 0;
            for (let i = 0; i < l; i++) {
                offsets[i] = spacing * i;
            }
            let step = 0
            return () => {
                const l = strip.length();
                for (let i = 0; i < l; i++) {
                    offsets[i] = (offsets[i] + (step * 2)) % 255
                    strip.setPixelColor(i, rgb(255 - offsets[i], this.green, this.blue));
                }
                step++;
                strip.show();
            }
        }
    }

    class SparkleAnimation extends NeoPixelAnimation {
        public rgb: number;
        public delay: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super(1004);
            this.rgb = rgb(red, green, blue);
            this.delay = delay;
        }

        public create(strip: NeoPixelStrip): () => void {
            const l = strip.length();
            return () => {
                const pixel = Math.random(l);
                strip.setPixelColor(pixel, this.rgb);
                strip.show();
                loops.pause(this.delay);
                strip.setPixelColor(pixel, 0);
            }
        }
    }

    class ColorWipeAnimation extends NeoPixelAnimation {
        public rgb: number;
        public delay: number;

        constructor(rgb: number, delay: number) {
            super(1005);
            this.rgb = rgb;
            this.delay = delay;
        }

        public create(strip: NeoPixelStrip): () => void {
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
                    strip.show();
                    loops.pause(this.delay);
                    i++;
                } else {
                    reveal = !reveal;
                    i = 0;
                }
            }
        }
    }

    class TheatreChaseAnimation extends NeoPixelAnimation {
        public rgb: number;
        public delay: number;

        constructor(red: number, green: number, blue: number, delay: number) {
            super(1005);
            this.rgb = rgb(red, green, blue);
            this.delay = delay;
        }

        public create(strip: NeoPixelStrip): () => void {
            const l = strip.length();
            let j = 0;
            let q = 0;
            return () => {
                if (j < 10) { // 10 cycles of chasing
                    if (q < 3) {
                        for (let i = 0; i < l; i = i + 3) {
                            strip.setPixelColor(i + q, this.rgb); // every third pixel on
                        }
                        strip.show();
                        loops.pause(this.delay);
                        for (let i = 0; i < l; i = i + 3) {
                            strip.setPixelColor(i + q, 0); // every third pixel off
                        }
                        strip.show();
                        q++;
                    } else {
                        q = 0;
                    }
                    j++;
                } else {
                    j = 0;
                }
            }
        }
    }
}
