/**
 * Well known colors for a NeoPixel strip
 */
enum NeoPixelColors {
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

enum MoveKind {
    //% block="rotate"
    Rotate,
    //% block="shift"
    Shift
}

enum Easing {
    //% linear
    Linear
}

/**
 * Functions to operate NeoPixel strips.
 */
//% weight=98 color="#0078d7" icon="\uf00a"
namespace light {
    /**
     * Turns the status LED on or off.
     * @param on a value indicating if the LED is on
     */
    //% weight=1
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
        pin: DigitalPin;
        // TODO: encode as bytes instead of 32bit
        _brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _mode: NeoPixelMode;
        _animation: () => void;
        _animationType: number;
        _buf: Buffer;
        // what's the current high value
        _barGraphHigh: number;
        // when was the current high value recorded
        _barGraphHighLast: number;

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
        //% blockId="neopixel_set_strip_color" block="show color %rgb=neopixel_colors"
        //% weight=85 blockGap=8
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        showColor(rgb: number) {
            this.setAllRGB(rgb);
            this.show();
        }

        /**
         * Shows a color gradient between LEDs
         * @param start RGB color to start the gradient
         * @param end RGB color to start the gradient, eg: NeoPixelColors.Blue
         * @param easing how
         */
        //% blockId="neopixel_show_gradient" block="show gradient|from %start=neopixel_colors|to %end=neopixel_colors"
        //% weight=84 blockGap=8
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        showGradient(start: number, end: number, easing?: Easing) {
            const sr = unpackR(start);
            const sg = unpackG(start);
            const sb = unpackB(start);
            const er = unpackR(end);
            const eg = unpackG(end);
            const eb = unpackB(end);
            const l = this._length;
            const l1 = l - 1;
            for (let i = 0; i < l; i++) {
                const r = (i * sr + (l1 - i) * er) / (l1);
                const g = (i * sg + (l1 - i) * eg) / (l1);
                const b = (i * sb + (l1 - i) * eb) / (l1);
                this.setPixelColor(i, rgb(r, g, b))
            }
            this.show();
        }
        /**
         * Displays a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, 0 to autoscale
         */
        //% weight=84 blockGap=8
        //% blockId=neopixel_show_bar_graph block="show bar graph of %value |up to %high" icon="\uf080" blockExternalInputs=true
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        showBarGraph(value: number, high: number): void {
            const now = control.millis();
            serial.writeString(value + "\n"); // auto chart
            value = Math.abs(value);

            if (high > 0) this._barGraphHigh = high;
            else if (value > this._barGraphHigh || now - this._barGraphHighLast > 10000) {
                this._barGraphHigh = value;
                this._barGraphHighLast = now;
            }

            const n = this._length;
            const n1 = n - 1;
            const v = (value * n) / this._barGraphHigh;
            if (v == 0) {
                this.setPixelColor(0, 0x000033);
                for (let i = 1; i < n; ++i)
                    this.setPixelColor(i, 0);
            } else {
                for (let i = 0; i < n; ++i) {
                    if (i <= v) {
                        let b = i * 255 / n1;
                        this.setPixelColor(i, light.rgb(b, 0, 255 - b));
                    }
                    else this.setPixelColor(i, 0);
                }
            }
            this.show();
        }

        /**
         * Set the pixel to a given color.
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the NeoPixel in the strip
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_pixel_color" block="set pixel color at %pixeloffset|to %rgb=neopixel_colors"
        //% blockGap=8
        //% weight=5
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        setPixelColor(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            let stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

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
            const offset = (pixeloffset + this.start) * stride;
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
            if (this._mode === NeoPixelMode.RGBW) {
                this.setPixelW(pixeloffset, white);
            }
        }

        /**
         * Send all the changes to the strip.
         */
        //% blockId="neopixel_show" block="show" blockGap=8
        //% weight=4
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        show() {
            control.pause(1)
            sendBuffer(this.pin, this.buf);
        }

        /**
         * Turn off all LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% blockId="neopixel_clear" block="clear"
        //% weight=3
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        clear(): void {
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
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
        //% weight=59
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        setBrightness(brightness: number): void {
            this._brightness = brightness & 0xff;
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
         * Apply brightness to current colors using a quadratic easing function.
         **/
        //% blockId="neopixel_each_brightness" block="ease brightness" blockGap=8
        //% weight=58
        //% parts="neopixel" advanced=true
        //% defaultInstance=light.pixels
        easeBrightness(): void {
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            const br = this._brightness;
            const buf = this.buf;
            const end = this.start + this._length;
            const mid = this._length / 2;
            for (let i = this.start; i < end; ++i) {
                const k = i - this.start;
                const ledoffset = i * stride;
                const br = k > mid ? 255 * (this._length - 1 - k) * (this._length - 1 - k) / (mid * mid) : 255 * k * k / (mid * mid);
                serial.writeLine(k + ":" + br);
                const r = (buf[ledoffset + 0] * br) >> 8; buf[ledoffset + 0] = r;
                const g = (buf[ledoffset + 1] * br) >> 8; buf[ledoffset + 1] = g;
                const b = (buf[ledoffset + 2] * br) >> 8; buf[ledoffset + 2] = b;
                if (stride == 4) {
                    const w = (buf[ledoffset + 3] * br) >> 8; buf[ledoffset + 3] = w;
                }
            }
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
            strip.buf = this.buf;
            strip.pin = this.pin;
            strip._brightness = this._brightness;
            strip.start = this.start + Math.clamp(0, this._length - 1, start);
            strip._length = Math.clamp(0, this._length - (strip.start - this.start), length);
            return strip;
        }

        /**
         * Shift LEDs forward and clear with zeros.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to shift forward, eg: 1
         */
        //% blockId="neopixel_move_pixels" block="%kind=MoveKind |pixels by %offset" blockGap=8
        //% weight=40
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        movePixels(kind: MoveKind, offset: number = 1): void {
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            if (kind === MoveKind.Shift) {
                this.buf.shift(-offset * stride, this.start * stride, this._length * stride)
            }
            else {
                this.buf.rotate(-offset * stride, this.start * stride, this._length * stride)
            }
        }

        /**
         * Set the current animation
         */
        //% blockId="neopixel_draw_animation_frame" block="show frame of %animation=neopixel_animation_rainbow |animation"
        //% weight=90
        //% parts="neopixel"
        //% defaultInstance=light.pixels
        showAnimationFrame(animation: NeoPixelAnimation): void {
            if (!this._animation || this._animationType != animation.type) {
                this.clear();
                this._animationType = animation.type;
                this._animation = animation.create(this);
            }
            this._animation();
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

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this._brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this.start + this._length;
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
        }
        private setAllW(white: number) {
            if (this._mode !== NeoPixelMode.RGBW)
                return;

            const br = this._brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            let end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                let ledoffset = i * 4;
                buf[ledoffset + 3] = white;
            }
        }
        private setPixelW(pixeloffset: number, white: number): void {
            if (this._mode !== NeoPixelMode.RGBW)
                return;

            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * 4;

            const br = this._brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            buf[pixeloffset + 3] = white;
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
        strip.start = 0;
        strip.pin = pin ? pin : (defaultPin() || pins.D0);
        strip.pin.digitalWrite(0)
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
    //% advanced=true
    export function rgb(red: number, green: number, blue: number): number {
        return ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 blockGap=8 advanced=true
    //% blockId=neopixel_colors block="%color"
    //% shim=TD_ID
    export function colors(color: NeoPixelColors): number {
        return color;
    }

    /**
     * Gets an RGB color given the value of an angle between 0 and 255. Useful
     * for performing math with colors.
    */
    //% weight=1 blockGap=8 advanced=true
    //% blockId="neopixel_color_wheel" block="color wheel %angle"
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
        let b = (rgb) & 0xFF;
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
    //% advanced=true
    export function hsv(hue: number, sat: number, val: number): number {
        let h = hue % 255;
        // scale down to 0..192
        h = h * 192 / 255;

        //reference: based on FastLED's hsv2rgb rainbow algorithm [https://github.com/FastLED/FastLED](MIT)
        let invsat = 255 - sat;
        let brightness_floor = (val * invsat) / 256;
        let color_amplitude = val - brightness_floor;
        let section = h / 0x40; // [0..2]
        let offset = h % 0x40; // [0..63]

        let rampup = offset;
        let rampdown = (0x40 - 1) - offset;

        let rampup_amp_adj = (rampup * color_amplitude) / (256 / 4);
        let rampdown_amp_adj = (rampdown * color_amplitude) / (256 / 4);

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
     * Return a new instance of the rainbow animation
     */
    //% blockId="neopixel_animation_rainbow" block="rainbow"
    //% weight=100 blockGap=8
    //% parts="neopixel"
    export function rainbowCycleAnimation(): NeoPixelAnimation {
        return NeopixelAnimatonFactory.getRainbow();
    }

    /**
     * Return a new instance of the running lights animation
     */
    //% blockId="neopixel_animation_runninglights" block="running lights"
    //% weight=99 blockGap=8
    //% parts="neopixel"
    export function runningLightsAnimation(): NeoPixelAnimation {
        return NeopixelAnimatonFactory.getRunningLights();
    }

    /**
     * Return a new instance of the theatre chase animation
     */
    //% blockId="neopixel_animation_theatrechase" block="theatre chase"
    //% weight=99 blockGap=8
    //% parts="neopixel"
    export function theatreChaseAnimation(): NeoPixelAnimation {
        return NeopixelAnimatonFactory.getTheatreChase();
    }

    /**
     * Return a new instance of the comet animation
     */
    //% blockId="neopixel_animation_comet" block="comet"
    //% weight=98 blockGap=8
    //% parts="neopixel"
    export function cometAnimation(): NeoPixelAnimation {
        return NeopixelAnimatonFactory.getComet();
    }

    /**
     * Return a new instance of the sparkle animation
     */
    //% blockId="neopixel_animation_sparkle" block="sparkle"
    //% weight=97 blockGap=8
    //% parts="neopixel"
    export function sparkleAnimation(): NeoPixelAnimation {
        return NeopixelAnimatonFactory.getSparkle();
    }

    /**
     * Return a new instance of the color wipe animation
     */
    //% blockId="neopixel_animation_colorwipe" block="%rgb=neopixel_colors| color wipe "
    //% weight=96 blockGap=8
    //% parts="neopixel"
    export function colorWipeAnimation(rgb: number): NeoPixelAnimation {
        return NeopixelAnimatonFactory.getColorWipe(rgb);
    }

    //%
    export const pixels = light.createNeoPixelStrip();

    class NeopixelAnimatonFactory {
        private static rainbowSingleton: RainbowCycleAnimation;
        static getRainbow(): RainbowCycleAnimation {
            if (!NeopixelAnimatonFactory.rainbowSingleton) NeopixelAnimatonFactory.rainbowSingleton = new RainbowCycleAnimation();
            return NeopixelAnimatonFactory.rainbowSingleton;
        }
        private static runningLightsSingleton: RunningLightsAnimation;
        static getRunningLights(): RunningLightsAnimation {
            if (!NeopixelAnimatonFactory.runningLightsSingleton) NeopixelAnimatonFactory.runningLightsSingleton = new RunningLightsAnimation(0xff, 0xff, 0x00, 50);
            return NeopixelAnimatonFactory.runningLightsSingleton;
        }

        private static cometSingleton: CometAnimation;
        static getComet(): CometAnimation {
            if (!NeopixelAnimatonFactory.cometSingleton) NeopixelAnimatonFactory.cometSingleton = new CometAnimation(0, 0, 40);
            return NeopixelAnimatonFactory.cometSingleton;
        }

        private static sparkleSingleton: SparkleAnimation;
        static getSparkle(): SparkleAnimation {
            if (!NeopixelAnimatonFactory.sparkleSingleton) NeopixelAnimatonFactory.sparkleSingleton = new SparkleAnimation(0xff, 0xff, 0xff, 0);
            return NeopixelAnimatonFactory.sparkleSingleton;
        }

        private static colorWipeSingleton: ColorWipeAnimation;
        static getColorWipe(rgb: number): ColorWipeAnimation {
            if (!NeopixelAnimatonFactory.colorWipeSingleton) NeopixelAnimatonFactory.colorWipeSingleton = new ColorWipeAnimation(rgb, 50);
            NeopixelAnimatonFactory.colorWipeSingleton.rgb = rgb;
            return NeopixelAnimatonFactory.colorWipeSingleton;
        }

        private static theatreChaseSingleton: TheatreChaseAnimation;
        static getTheatreChase(): TheatreChaseAnimation {
            if (!NeopixelAnimatonFactory.theatreChaseSingleton) NeopixelAnimatonFactory.theatreChaseSingleton = new TheatreChaseAnimation(0xff, 0, 0, 50);
            return NeopixelAnimatonFactory.theatreChaseSingleton;
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
                    strip.setPixelColor(i, colorWheel(((i * 256 / l) + offset) & 255));
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
                    control.pause(this.delay);
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
            const spacing = 255 / l;
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
                control.pause(this.delay);
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
                        strip.setPixelColor(i, rgb(0, 0, 0));
                    }
                    strip.show();
                    control.pause(this.delay);
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
                        control.pause(this.delay);
                        for (let i = 0; i < l; i = i + 3) {
                            strip.setPixelColor(i + q, 0); // every third pixel off
                        }
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
