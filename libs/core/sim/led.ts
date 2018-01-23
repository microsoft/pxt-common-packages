namespace pxsim.visuals {

    const LED_PART_XOFF = -8;
    const LED_PART_YOFF = 0;
    const LED_PART_WIDTH = 30;
    const LED_PART_HEIGHT = 100;
    const LED_PART = `<svg xmlns="http://www.w3.org/2000/svg" width="30mm" height="100mm" viewBox="0 0 30 100" id="svg8">
    <g id="layer1" transform="translate(0 -197)" stroke="#000">
      <rect id="rect4508-3" width="6.054" height="52.917" x="19.039" y="225.563" rx="3.027" fill="#666" stroke-width=".392"/>
      <rect id="rect4508" width="6.054" height="81.258" x="5.157" y="197.221" rx="2.744" fill="#666" stroke-width=".486"/>
      <path d="M5.64 270.542h19.942a1.93 1.93 0 0 1 1.935 1.935v19.942a1.93 1.93 0 0 1-1.935 1.935H5.639a1.93 1.93 0 0 1-1.935-1.935v-19.942a1.93 1.93 0 0 1 1.935-1.935z" id="LED" fill="#6f0" stroke-width=".251"/>
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
        private parsePinString: (s: string) => Pin;
        private color: string = "rgb(0,255,0)"; // green color by default

        private part: SVGElAndSize;
        private bus: EventBus;
        public style: string;

        private state: ToggleState;
        private pin: Pin;

        private currentlyOn: boolean = false;
        private currentValue: number;

        constructor(parsePinString:(s: string) => Pin) {
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
            this.element.appendChild(image);

        }

        public moveToCoord(xy: Coord) {
            translateEl(this.element, [xy[0] + LED_PART_XOFF, xy[1] + LED_PART_YOFF]);
        }

        public updateTheme() {
        }

        public updateState() {
            if (this.currentValue === this.pin.value) {
                return;
            }

            this.currentValue = this.pin.value;
            (<any>this.led).style.fill = this.currentValue ? "#00ff00" : "#ffffff";
            (<any>this.led).style.opacity = "0.9";
        }
    }
}