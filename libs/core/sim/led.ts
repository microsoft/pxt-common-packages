namespace pxsim.visuals {
    type SVGStylable = any;

    const LED_PART_XOFF = -8;
    const LED_PART_YOFF = -7;
    const LED_PART_WIDTH = 68;
    const LED_PART_HEIGHT = 180;
    const LED_PART = `
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" viewBox="0 0 33.6 90" width="33.599998" height="90">
    <path class="st0" d="M1.3 65.000002v5.9C1.3 74.800002 4.5 78 8.4 78c3.9 0 7.1-3.199998 7.1-7.099998v-13.7c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9v1.5c0 1.2.5 2.3 1.3 3.2z" id="path5" opacity=".65" fill="#ececec"/>
    <g id="g7" transform="translate(0 10.900002)">
      <path id="rect4526" fill="#fff" stroke-width="3.938615" stroke-linecap="round" stroke-linejoin="round" d="M.837924 68.709747H32.84661v9.55233H.837924z"/>
      <path class="st1" d="M12.7 49.6l1.2 1.4h-1l-2.4-1.4V15c0-.3.5-.5 1.1-.5.6 0 1.1.2 1.1.5z" id="path9" fill="#8c8c8c"/>
      <path class="st1" d="M2.6 42.9c0 .7 1.1 1.3 2.1 1.8.4.2 1.2.6 1.2.9V49l-2.5 2h.9L8 49v-3.5c0-.7-.9-1.2-1.9-1.7-.4-.2-1.3-.8-1.3-1.1v-52.9c0-.4-.5-.7-1.1-.7-.6 0-1.1.3-1.1.7z" id="path11" fill="#8c8c8c"/>
      <path class="sim-led-main" d="M1.3 54.1V60c0 3.9 3.2 7.1 7.1 7.1 3.9 0 7.1-3.2 7.1-7.1V46.3c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9v1.5c0 1.2.5 2.3 1.3 3.2z" id="LED" opacity=".3" fill="#ccc"/>
      <path class="st3" d="M1.3 54.1V51c0-2.7 3.2-5 7.1-5 3.9 0 7.1 2.2 7.1 5v-4.6c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9V51c0 1.1.5 2.2 1.3 3.1z" id="path15" opacity=".9" fill="#d1d1d1"/>
      <path class="st4" d="M1.3 54.1V51c0-2.7 3.2-5 7.1-5 3.9 0 7.1 2.2 7.1 5v-4.6c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9V51c0 1.1.5 2.2 1.3 3.1z" id="path17" opacity=".7" fill="#e6e6e6"/>
      <path class="st5" d="M1.3 54.1V51c0-2.7 3.2-5 7.1-5 3.9 0 7.1 2.2 7.1 5v-3.1c-1.9-1.9-4.4-2.9-7.1-2.8C3.8 45.1 0 47.7 0 51c0 1.1.5 2.2 1.3 3.1z" id="path19" opacity=".25" fill="#e6e6e6"/>
      <ellipse class="st5" cx="8.3" cy="51" rx="7.1" ry="5" id="ellipse21" opacity=".25" fill="#e6e6e6"/>
      <ellipse class="st5" cx="8.3" cy="51" rx="7.1" ry="5" id="ellipse23" opacity=".25" fill="#e6e6e6"/>
      <g class="st8" id="g29" transform="translate(0 -12)" opacity=".61">
        <path class="st9" d="M8.3 57.1c4.3 0 6.1 2 6.1 2l-.7.7s-1.6-1.7-5.4-1.7C5.9 58 3.6 59 2 60.8l-.8-.6c1.9-2.1 4.4-3.2 7.1-3.1z" id="path31" fill="#fff"/>
      </g>
      <g class="st8" id="g33" transform="translate(0 -12)" opacity=".61">
        <path class="st9" d="M12.9 75.9c1.1-1.1 1.7-2.6 1.7-4.2V61.4l-1.9-1.5v10.4c.9 2.8.3 4.2-.7 5.2.3.1.6.2.9.4z" id="path35" fill="#fff"/>
        <path class="st9" d="M5.6 77.5l.3-.9c-1.5-.7-2.6-2.1-2.8-3.7h-1c.3 2 1.6 3.7 3.5 4.6z" id="path37" fill="#fff"/>
      </g>
      <text style="line-height:1.25;-inkscape-font-specification:consolas" x="14.103056" y=".224915" id="text4514" font-weight="400" font-size="7.744442" font-family="consolas" letter-spacing="0" word-spacing="0" fill="#666" stroke-width=".968055">
        <tspan id="tspan4512" x="14.103056" y=".224915">330Ω</tspan>
      </text>
      <text style="line-height:1.25;-inkscape-font-specification:consolas" x="1.868053" y="77.579796" id="text4524" font-weight="400" font-size="32.793365" font-family="consolas" letter-spacing="0" word-spacing="0" stroke-width=".819834">
        <tspan id="tspan4522" x="1.868053" y="77.579796" font-size="10.931121"></tspan>
      </text>
    </g>
    <g id="g39" transform="translate(0 -1.099998)">
      <path class="st1" id="rect41" fill="#8c8c8c" d="M11.6 16.9h21.700001v1.9H11.6z"/>
      <g id="g43">
        <path class="st10" id="rect45" fill="none" d="M12 16.9h3.2v1.9H12z"/>
        <path class="st11" d="M19 15c-.3-.2-.6-.3-.9-.3h-1.4c-.3 0-.5.3-.5.7v4.9c0 .4.2.7.5.7h1.4c.3 0 .6-.1.9-.3.3-.2.6-.3.9-.3h5c.3 0 .6.1.9.3h.1c.3.2.6.3.9.3h1.4c.3 0 .5-.3.5-.7v-4.9c0-.4-.2-.7-.5-.7h-1.4c-.3 0-.6.1-.9.3h-.1c-.3.2-.6.3-.9.3h-5c-.2 0-.5-.1-.9-.3z" id="path47" fill="#d6bf90"/>
        <path class="st12" d="M28.4 18.5c-.1.1-.1.2-.2.3-.3.5-.7.8-1.2.8s-.9-.1-1.4-.3c-.6-.1-1.1-.1-1.7-.1-2 0-3.9 0-5.9.2-.4.1-.8 0-1.1-.1-.2-.1-.4-.2-.5-.5v1.5c0 .2.1.3.2.3H18c.3 0 .6-.1.9-.3.3-.2.7-.3 1.1-.3h5c.4 0 .8.1 1.1.3.3.1.6.2.8.2h1.4c.1 0 .2-.1.2-.3v-1.9c0 .1-.1.2-.1.2z" id="path49" fill="#aa936b"/>
        <g id="g51">
          <path class="st13" id="rect53" fill="#ad9f4e" d="M27.200001 14.7h.7v6.2h-.7z"/>
          <path class="st14" id="rect55" opacity=".4" d="M27.200001 17.799999h.7v2.5h-.7z"/>
          <path class="st15" id="rect57" opacity=".5" fill="#ff3" d="M27.200001 15h.7v1.3h-.7z"/>
          <path class="st16" id="rect59" opacity=".5" fill="#fff" d="M27.200001 15.3h.7v.7h-.7z"/>
        </g>
        <path class="st17" id="rect61" fill="#aa4518" d="M23.1 15.3h1.3v5.1h-1.3z"/>
        <path class="st18" id="rect63" fill="#ff9700" d="M20.6 15.3h1.3v5.1h-1.3z"/>
        <path class="st18" d="M19.3 15.1c-.1 0-.1-.1-.2-.1-.3-.2-.6-.3-.9-.3H18V21h.1c.3 0 .6-.1.9-.3.1 0 .1-.1.2-.1v-5.5z" id="path65" fill="#ff9700"/>
        <path class="st19" d="M18.7 15.7c.4.1.8.2 1.2.2H21c1.2-.1 2.4-.1 3.6 0 .4 0 .9 0 1.3-.1.3-.1.6-.2.8-.3.6-.2 1.2-.3 1.8-.2 0-.1-.1-.3-.2-.3h-1.4c-.3 0-.6.1-.9.3-.3.2-.7.3-1.1.3h-5c-.4 0-.8-.1-1.1-.3-.3-.1-.6-.2-.8-.2h-1.4c-.1 0-.2.1-.2.3v.2c.8-.1 1.5 0 2.3.1z" id="path67" opacity=".74" fill="#fffdfa"/>
      </g>
    </g>
  </svg>
      `;

    // For the intructions
    export function mkLedPart(xy: Coord = [0, 0]): SVGElAndSize {
        let [x, y] = xy;
        let l = x + LED_PART_XOFF;
        let t = y + LED_PART_YOFF;
        let w = LED_PART_WIDTH;
        let h = LED_PART_HEIGHT;
        let img = <SVGGElement>svg.elt("image");
        svg.hydrate(img, {
            class: "sim-led", x: l, y: t, width: w, height: h,
            href: svg.toDataUri(LED_PART)
        });
        return { el: img, x: l, y: t, w: w, h: h };
    }

    export class LedView implements IBoardPart<EdgeConnectorState> {
        element: SVGElement;
        defs: SVGElement[];

        private led: SVGPathElement;
        private text: SVGTSpanElement;
        private parsePinString: (s: string) => Pin;
        private color: string = "rgb(0,255,0)"; // green color by default

        private part: SVGElAndSize;
        private bus: EventBus;
        public style: string;

        private state: ToggleState;
        private pin: Pin;

        private currentValue: number;
        private currentMode: PinFlags;

        constructor(parsePinString: (s: string) => Pin) {
            this.parsePinString = parsePinString;
        }

        public init(bus: EventBus, state: EdgeConnectorState, svgEl: SVGSVGElement, otherParams: Map<string>): void {
            this.pin = this.parsePinString(otherParams["name"] || otherParams["pin"]);
            this.bus = bus;
            this.initDom();
            this.updateState();
        }

        initDom() {
            this.element = svg.elt("g");
            const image = new DOMParser().parseFromString(LED_PART, "image/svg+xml").querySelector("svg") as SVGSVGElement;
            svg.hydrate(image, {
                class: "sim-led", width: LED_PART_WIDTH, height: LED_PART_HEIGHT,
            });
            this.led = image.getElementById('LED') as SVGPathElement;
            this.text = image.getElementById('tspan4522') as SVGTSpanElement;
            this.element.appendChild(image);

        }

        public moveToCoord(xy: Coord) {
            translateEl(this.element, [xy[0] + LED_PART_XOFF, xy[1] + LED_PART_YOFF]);
        }

        public updateTheme() {
        }

        public updateState() {
            if (this.currentValue === this.pin.value && this.currentMode == this.pin.mode)
                return;

            this.currentValue = this.pin.value;
            this.currentMode = this.pin.mode;
            const style = (<SVGStylable><any>this.led).style;
            if (this.currentMode & PinFlags.Digital) {
                style.fill = this.currentValue ? "#00ff00" : "#ffffff";
                style.opacity = "0.9";
                this.text.textContent = this.currentValue ? "1" : "0";
            } else {
                style.fill = "#00ff00";
                style.opacity = (0.1 + Math.max(0, Math.min(1023, this.currentValue)) / 1023 * 0.8).toString();
                this.text.textContent = `~${this.currentValue}`
            }
        }
    }
}