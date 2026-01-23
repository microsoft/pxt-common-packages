namespace pxsim {
    export enum NeoPixelMode {
        RGB = 1,
        RGBW = 2,
        RGB_RGB = 3,
        DotStar = 4
    }

    export class CommonNeoPixelState {
        public buffer: Uint8Array;
        public mode: number = NeoPixelMode.RGB; // GRB
        public width: number = 1;
        public get length() {
            return this.buffer ? (this.buffer.length / this.stride) | 0 : 0;
        }

        public get stride() {
            return this.mode == NeoPixelMode.RGBW || this.mode == NeoPixelMode.DotStar ? 4 : 3;
        }

        public pixelColor(pixel: number): number[] {
            const offset = pixel * this.stride;
            // RBG
            switch (this.mode) {
                case NeoPixelMode.RGBW:
                    return [this.buffer[offset + 1], this.buffer[offset], this.buffer[offset + 2], this.buffer[offset + 3]];
                case NeoPixelMode.RGB_RGB:
                    return [this.buffer[offset], this.buffer[offset + 1], this.buffer[offset + 2]];
                case NeoPixelMode.DotStar:
                    return [this.buffer[offset + 3], this.buffer[offset + 2], this.buffer[offset + 1]];
                default:
                    return [this.buffer[offset + 1], this.buffer[offset + 0], this.buffer[offset + 2]];
            }
        }
    }

    export interface CommonNeoPixelStateConstructor {
        (pin: Pin): CommonNeoPixelState;
    }

    export interface LightBoard {
        // Do not laze allocate state
        tryGetNeopixelState(pinId: number): CommonNeoPixelState;
        neopixelState(pinId: number): CommonNeoPixelState;
    }

    export function neopixelState(pinId: number) {
        return (board() as any as LightBoard).neopixelState(pinId);
    }

    export function sendBufferAsm(buffer: RefBuffer, pin: number) {
        BufferMethods.typeCheck(buffer);
        const b = board();
        if (!b) return;
        const p = b.edgeConnectorState.getPin(pin);
        if (!p) return;
        const lp = neopixelState(p.id);
        if (!lp) return;
        const mode = lp.mode;
        pxsim.light.sendBuffer(p, undefined, mode, buffer);
    }
}

namespace pxsim.light {
    // Currently only modifies the builtin pixels
    export function sendBuffer(pin: { id: number }, clk: { id: number }, mode: number, b: RefBuffer) {
        BufferMethods.typeCheck(b);
        const state = neopixelState(pin.id);
        if (!state) return;
        state.mode = mode & 0xff;
        state.buffer = b.data;

        runtime.queueDisplayUpdate();
    }
}

namespace pxsim.visuals {
    const PIXEL_SPACING = PIN_DIST * 2.5;  // 3
    const PIXEL_RADIUS = PIN_DIST;
    const CANVAS_WIDTH = 1.2 * PIN_DIST;
    const CANVAS_HEIGHT = 12 * PIN_DIST;
    const CANVAS_VIEW_PADDING = PIN_DIST * 4;
    const CANVAS_LEFT = 1.4 * PIN_DIST;
    const CANVAS_TOP = PIN_DIST;

    // For the instructions parts list
    export function mkNeoPixelPart(xy: Coord = [0, 0]): SVGElAndSize {
        const NP_PART_XOFF = -13.5;
        const NP_PART_YOFF = -11;
        const NP_PART_WIDTH = 87.5;
        const NP_PART_HEIGHT = 190;
        const NEOPIXEL_PART_IMG = `<svg viewBox="-5 -1 53 112" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
  <rect x="2.5" width="38" height="100" style="fill: rgb(68, 68, 68);"/>
  <rect x="11.748" y="3.2" width="1.391" height="2.553" style="fill: none; stroke-linejoin: round; stroke-width: 3; stroke: rgb(165, 103, 52);"/>
  <rect x="20.75" y="3.2" width="1.391" height="2.553" style="fill: none; stroke-linejoin: round; stroke-width: 3; stroke: rgb(165, 103, 52);"/>
  <rect x="29.75" y="3.2" width="1.391" height="2.553" style="fill: none; stroke-linejoin: round; stroke-width: 3; stroke: rgb(165, 103, 52);"/>
  <g>
    <rect x="9" y="16.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="22.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="28.563" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="11.607" y="14.833" width="19.787" height="18.697" style="fill: rgb(0, 0, 0);"/>
    <ellipse style="fill: rgb(216, 216, 216);" cx="21.5" cy="24.181" rx="7" ry="7"/>
  </g>
  <path d="M -7.25 -103.2 L -2.5 -100.003 L -12 -100.003 L -7.25 -103.2 Z" style="fill: rgb(68, 68, 68);" transform="matrix(-1, 0, 0, -1, 0, 0)" bx:shape="triangle -12 -103.2 9.5 3.197 0.5 0 1@ad6f5cac"/>
  <path d="M -16.75 -103.197 L -12 -100 L -21.5 -100 L -16.75 -103.197 Z" style="fill: rgb(68, 68, 68);" transform="matrix(-1, 0, 0, -1, 0, 0)" bx:shape="triangle -21.5 -103.197 9.5 3.197 0.5 0 1@07d73149"/>
  <path d="M -26.25 -103.2 L -21.5 -100.003 L -31 -100.003 L -26.25 -103.2 Z" style="fill: rgb(68, 68, 68);" transform="matrix(-1, 0, 0, -1, 0, 0)" bx:shape="triangle -31 -103.2 9.5 3.197 0.5 0 1@54403e2d"/>
  <path d="M -35.75 -103.197 L -31 -100 L -40.5 -100 L -35.75 -103.197 Z" style="fill: rgb(68, 68, 68);" transform="matrix(-1, 0, 0, -1, 0, 0)" bx:shape="triangle -40.5 -103.197 9.5 3.197 0.5 0 1@21c9b772"/>
  <g transform="matrix(1, 0, 0, 1, 0.000002, 29.999994)">
    <rect x="9" y="16.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="22.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="28.563" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="11.607" y="14.833" width="19.787" height="18.697" style="fill: rgb(0, 0, 0);"/>
    <ellipse style="fill: rgb(216, 216, 216);" cx="21.5" cy="24.181" rx="7" ry="7"/>
  </g>
  <g transform="matrix(1, 0, 0, 1, 0.000005, 59.999992)">
    <rect x="9" y="16.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="22.562" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="9" y="28.563" width="25" height="3.238" style="fill: rgb(216, 216, 216);"/>
    <rect x="11.607" y="14.833" width="19.787" height="18.697" style="fill: rgb(0, 0, 0);"/>
    <ellipse style="fill: rgb(216, 216, 216);" cx="21.5" cy="24.181" rx="7" ry="7"/>
  </g>
</svg>`;
        let [x, y] = xy;
        let l = x + NP_PART_XOFF;
        let t = y + NP_PART_YOFF;
        let w = NP_PART_WIDTH;
        let h = NP_PART_HEIGHT;
        let img = <SVGImageElement>svg.elt("image");
        svg.hydrate(img, {
            class: "sim-neopixel-strip", x: l, y: t, width: w, height: h,
            href: svg.toDataUri(NEOPIXEL_PART_IMG)
        });
        return { el: img, x: l, y: t, w: w, h: h };
    }
    export class NeoPixel {
        public el: SVGElement;
        public cy: number;

        constructor(xy: Coord = [0, 0], width: number = 1) {
            let el = <SVGElement>svg.elt("rect");
            let r = PIXEL_RADIUS;
            let [cx, cy] = xy;
            let y = cy - r;
            if (width <= 1)
                svg.hydrate(el, { x: "-50%", y: y, width: "100%", height: r * 2, class: "sim-neopixel" });
            else {
                let x = cx - r;
                svg.hydrate(el, { x: x, y: y, width: r * 2, height: r * 2, class: "sim-neopixel" });
            }
            this.el = el;
            this.cy = cy;
        }

        public setRgb(rgb: [number, number, number]) {
            let hsl = visuals.rgbToHsl(rgb);
            let [h, s, l] = hsl;
            // at least 70% luminosity
            l = Math.max(l, 60);
            let fill = `hsl(${h}, ${s}%, ${l}%)`;
            this.el.setAttribute("fill", fill);
        }
    }

    export class NeoPixelCanvas {
        public canvas: SVGSVGElement;
        private pixels: NeoPixel[];
        private viewBox: [number, number, number, number];
        private background: SVGRectElement;

        constructor(pin: number, public cols: number = 1) {
            this.pixels = [];
            let el = <SVGSVGElement>svg.elt("svg");
            svg.hydrate(el, {
                "class": `sim-neopixel-canvas`,
                "x": "0px",
                "y": "0px",
                "width": `${CANVAS_WIDTH}px`,
                "height": `${CANVAS_HEIGHT}px`,
            });
            this.canvas = el;
            this.background = <SVGRectElement>svg.child(el, "rect", { class: "sim-neopixel-background hidden" });
            this.updateViewBox(-CANVAS_WIDTH / 2, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }

        private updateViewBox(x: number, y: number, w: number, h: number) {
            this.viewBox = [x, y, w, h];
            svg.hydrate(this.canvas, { "viewBox": `${x} ${y} ${w} ${h}` });
            svg.hydrate(this.background, { "x": x, "y": y, "width": w, "height": h });
        }

        public update(colors: number[][]) {
            if (!colors || colors.length <= 0)
                return;

            if (this.pixels.length == 0 && this.cols > 1) {
                // first time, so redo width of canvas
                let rows = Math.ceil(colors.length / this.cols);
                let rt = CANVAS_HEIGHT / rows;
                let width = this.cols * rt;
                this.canvas.setAttributeNS(null, "width", `${width}px`)
                this.updateViewBox(0, 0, width, CANVAS_HEIGHT);
            }

            for (let i = 0; i < colors.length; i++) {
                let pixel = this.pixels[i];
                if (!pixel) {
                    let cxy: Coord = [0, CANVAS_VIEW_PADDING + i * PIXEL_SPACING];
                    if (this.cols > 1) {
                        const row = Math.floor(i / this.cols);
                        const col = i - row * this.cols;
                        cxy  = [(col + 1) * PIXEL_SPACING,  (row + 1) * PIXEL_SPACING]
                    }
                    pixel = this.pixels[i] = new NeoPixel(cxy, this.cols);
                    svg.hydrate(pixel.el, { title: `offset: ${i}` });
                    this.canvas.appendChild(pixel.el);
                }
                pixel.setRgb(colors[i] as [number, number, number]);
            }

            //show the canvas if it's hidden
            pxsim.U.removeClass(this.background, "hidden");

            // resize
            let [first, last] = [this.pixels[0], this.pixels[this.pixels.length - 1]]
            let yDiff = last.cy - first.cy;
            let newH = yDiff + CANVAS_VIEW_PADDING * 2;
            let [oldX, oldY, oldW, oldH] = this.viewBox;
            if (newH > oldH) {
                let scalar = newH / oldH;
                let newW = oldW * scalar;
                if (this.cols > 1) {
                    // different computation for matrix
                    let rows = Math.ceil(colors.length / this.cols);
                    newH = PIXEL_SPACING * (rows + 1);
                    newW = PIXEL_SPACING * (this.cols + 1);
                    this.updateViewBox(0, oldY, newW, newH);
                } else
                    this.updateViewBox(-newW / 2, oldY, newW, newH);
            }
        }

        public setLoc(xy: Coord) {
            let [x, y] = xy;
            svg.hydrate(this.canvas, { x: x, y: y });
        }
    };

    export class NeoPixelView implements IBoardPart<CommonNeoPixelStateConstructor> {
        public style: string = `
            .sim-neopixel-canvas {
            }
            .sim-neopixel-canvas-parent:hover {
                transform-origin: center;
                transform: scale(4) translateY(-220px);
                -moz-transform: scale(4) translateY(-220px);
            }
            .sim-neopixel-canvas .hidden {
                visibility:hidden;
            }
            .sim-neopixel-background {
                fill: rgba(255,255,255,0.9);
            }
            .sim-neopixel-strip {
            }
        `;
        public element: SVGElement;
        public overElement: SVGElement;
        public defs: SVGElement[];
        private state: CommonNeoPixelState;
        private canvas: NeoPixelCanvas;
        private part: SVGElAndSize;
        private stripGroup: SVGGElement;
        private lastLocation: Coord;
        private pin: Pin;

        constructor(public parsePinString: (name: string) => Pin) {

        }

        public init(bus: EventBus, state: CommonNeoPixelStateConstructor, svgEl: SVGSVGElement, otherParams: Map<string>): void {
            this.stripGroup = <SVGGElement>svg.elt("g");
            this.element = this.stripGroup;
            this.pin = this.parsePinString(otherParams["dataPin"] || otherParams["pin"])
                || this.parsePinString("pins.NEOPIXEL")
                || this.parsePinString("pins.MOSI");
            this.lastLocation = [0, 0];
            this.state = state(this.pin);
            let part = mkNeoPixelPart();
            this.part = part;
            this.stripGroup.appendChild(part.el);
            this.overElement = null;
            this.makeCanvas();
        }
        private makeCanvas() {
            let canvas = new NeoPixelCanvas(this.pin.id, this.state.width);
            if (this.overElement) {
                this.overElement.removeChild(this.canvas.canvas);
                this.overElement.appendChild(canvas.canvas)
            } else {
                let canvasG = svg.elt("g", { class: "sim-neopixel-canvas-parent" });
                canvasG.appendChild(canvas.canvas);
                this.overElement = canvasG;
            }
            this.canvas = canvas;
            this.updateStripLoc();
        }

        public moveToCoord(xy: Coord): void {
            let [x, y] = xy;
            let loc: Coord = [x, y];
            this.lastLocation = loc;
            this.updateStripLoc();
        }
        private updateStripLoc() {
            let [x, y] = this.lastLocation;
            U.assert(typeof x === "number" && typeof y === "number", "invalid x,y for NeoPixel strip");
            this.canvas.setLoc([x + CANVAS_LEFT, y + CANVAS_TOP]);
            svg.hydrate(this.part.el, { transform: `translate(${x} ${y})` }); //TODO: update part's l,h, etc.
        }
        public updateState(): void {
            if (this.state.width != this.canvas.cols) {
                this.makeCanvas();
            }
            let colors: number[][] = [];
            for (let i = 0; i < this.state.length; i++) {
                colors.push(this.state.pixelColor(i));
            }
           this.canvas.update(colors);
        }
        public updateTheme(): void { }
    }
}