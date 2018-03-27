namespace pxsim.visuals {
    type SVGStylable = any;

    const PHOTOCELL_PART_XOFF = -8;
    const PHOTOCELL_PART_YOFF = -7;
    const PHOTOCELL_PART_WIDTH = 68;
    const PHOTOCELL_PART_HEIGHT = 180;
    const PHOTOCELL_PART = `
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" viewBox="0 0 33.6 90" width="33.599998" height="90">
    <path id="rect4526" fill="#fff" stroke-width="3.938615" stroke-linecap="round" stroke-linejoin="round" d="M.837924 79.609749H32.84661v9.55233H.837924z"/>
    <path id="path9" d="M12.7 60.500002l1.2 1.4h-1l-2.4-1.4v-34.6c0-.3.5-.5 1.1-.5.6 0 1.1.2 1.1.5z" class="st1" fill="#8c8c8c"/>
    <path id="path11" d="M3.4 61.900002h1.905509L4.8.700002c-.003304-.399986-.5-.7-1.1-.7-.6 0-1.1.3-1.1.7z" class="st1" fill="#8c8c8c"/>
    <text id="text4514" y="11.124916" x="14.103056" style="line-height:1.25;-inkscape-font-specification:consolas" font-weight="400" font-size="7.744442" font-family="consolas" letter-spacing="0" word-spacing="0" fill="#666" stroke-width=".968055">
      <tspan y="11.124916" x="14.103056" id="tspan4512">10kΩ</tspan>
    </text>
    <path id="rect41" class="st1" fill="#8c8c8c" d="M11.6 15.800001h21.700001v1.9H11.6z"/>
    <path class="st10" id="rect45" fill="none" d="M12 15.800001h3.2v1.9H12z"/>
    <path class="st11" d="M19 13.900002c-.3-.2-.6-.3-.9-.3h-1.4c-.3 0-.5.3-.5.7v4.9c0 .4.2.7.5.7h1.4c.3 0 .6-.1.9-.3.3-.2.6-.3.9-.3h5c.3 0 .6.1.9.3h.1c.3.2.6.3.9.3h1.4c.3 0 .5-.3.5-.7v-4.9c0-.4-.2-.7-.5-.7h-1.4c-.3 0-.6.1-.9.3h-.1c-.3.2-.6.3-.9.3h-5c-.2 0-.5-.1-.9-.3z" id="path47" fill="#d6bf90"/>
    <path class="st12" d="M28.4 17.400002c-.1.1-.1.2-.2.3-.3.5-.7.8-1.2.8s-.9-.1-1.4-.3c-.6-.1-1.1-.1-1.7-.1-2 0-3.9 0-5.9.2-.4.1-.8 0-1.1-.1-.2-.1-.4-.2-.5-.5v1.5c0 .2.1.3.2.3H18c.3 0 .6-.1.9-.3.3-.2.7-.3 1.1-.3h5c.4 0 .8.1 1.1.3.3.1.6.2.8.2h1.4c.1 0 .2-.1.2-.3v-1.9c0 .1-.1.2-.1.2z" id="path49" fill="#aa936b"/>
    <g id="g51" transform="translate(0 -1.099998)">
      <path class="st13" id="rect53" fill="#ad9f4e" d="M27.200001 14.7h.7v6.2h-.7z"/>
      <path class="st14" id="rect55" opacity=".4" d="M27.200001 17.799999h.7v2.5h-.7z"/>
      <path class="st15" id="rect57" opacity=".5" fill="#ff3" d="M27.200001 15h.7v1.3h-.7z"/>
      <path class="st16" id="rect59" opacity=".5" fill="#fff" d="M27.200001 15.3h.7v.7h-.7z"/>
    </g>
    <path class="st17" id="rect61" fill="#ff9700" d="M23.1 14.200002h1.3v5.1h-1.3z"/>
    <path class="st18" id="rect63" d="M20.6 14.200002h1.3v5.1h-1.3z"/>
    <path class="st18" d="M19.3 14.000002c-.1 0-.1-.1-.2-.1-.3-.2-.6-.3-.9-.3H18v6.3h.1c.3 0 .6-.1.9-.3.1 0 .1-.1.2-.1v-5.5z" id="path65" fill="#aa4518"/>
    <path class="st19" d="M18.7 14.600002c.4.1.8.2 1.2.2H21c1.2-.1 2.4-.1 3.6 0 .4 0 .9 0 1.3-.1.3-.1.6-.2.8-.3.6-.2 1.2-.3 1.8-.2 0-.1-.1-.3-.2-.3h-1.4c-.3 0-.6.1-.9.3-.3.2-.7.3-1.1.3h-5c-.4 0-.8-.1-1.1-.3-.3-.1-.6-.2-.8-.2h-1.4c-.1 0-.2.1-.2.3v.2c.8-.1 1.5 0 2.3.1z" id="path67" opacity=".74" fill="#fffdfa"/>
    <ellipse id="path4569" ry="5.949258" rx="6.745286" cy="64.610916" cx="8.085964" fill="#aa4518" stroke-width="3.558676" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse id="path4569-5" ry="5.488401" rx="6.222764" cy="64.652809" cx="8.024301" fill="#e7e1df" stroke-width="3.283004" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse id="path4607" cx="3.393591" cy="65" rx=".628443" ry="1.016842" fill="#4d4d4d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse id="path4607-3" cx="12.568855" cy="65" rx=".628443" ry="1.016842" fill="#4d4d4d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.865466 60.253708c2.521642.258451 5.042396.51681 4.411086.820414-.63131.303603-4.416986.652835-4.224443.970671.192542.317835 4.36002.604044 4.24887.991436-.111149.387393-4.504242.87629-4.482809 1.204577.021434.328287 4.454339.49583 4.535187.914613.08085.418783-4.193489 1.089267-4.318738 1.529318-.125249.44005 3.895722.649476 4.19647 1.008916.300747.359441-3.121579.869298-3.749962 1.183637-.628384.314339 1.535952.433028 3.699646.551682" id="path4630" fill="none" stroke="#9e4c34" stroke-width=".245669" stroke-linecap="round"/>
  </svg>
        `;

    // For the intructions
    export function mkPhotoCellPart(xy: Coord = [0, 0]): SVGElAndSize {
        let [x, y] = xy;
        let l = x + PHOTOCELL_PART_XOFF;
        let t = y + PHOTOCELL_PART_YOFF;
        let w = PHOTOCELL_PART_WIDTH;
        let h = PHOTOCELL_PART_HEIGHT;
        let img = <SVGGElement>svg.elt("image");
        svg.hydrate(img, {
            class: "sim-led", x: l, y: t, width: w, height: h,
            href: svg.toDataUri(PHOTOCELL_PART)
        });
        return { el: img, x: l, y: t, w: w, h: h };
    }

    export class PhotoCellView implements IBoardPart<EdgeConnectorState> {
        element: SVGElement;
        defs: SVGElement[];

        //private led: SVGPathElement;
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
            const image = new DOMParser().parseFromString(PHOTOCELL_PART, "image/svg+xml").querySelector("svg") as SVGSVGElement;
            svg.hydrate(image, {
                class: "sim-led", width: PHOTOCELL_PART_WIDTH, height: PHOTOCELL_PART_HEIGHT,
            });
            //this.led = image.getElementById('LED') as SVGPathElement;
            this.text = image.getElementById('tspan4522') as SVGTSpanElement;
            this.element.appendChild(image);

        }

        public moveToCoord(xy: Coord) {
            translateEl(this.element, [xy[0] + PHOTOCELL_PART_XOFF, xy[1] + PHOTOCELL_PART_YOFF]);
        }

        public updateTheme() {
        }

        public updateState() {
            if (this.currentValue === this.pin.value && this.currentMode == this.pin.mode)
                return;

            this.currentValue = this.pin.value;
            this.currentMode = this.pin.mode;
            //const style = (<SVGStylable><any>this.led).style;
            if (this.currentMode & PinFlags.Digital) {
                //style.fill = this.currentValue ? "#00ff00" : "#ffffff";
                //style.opacity = "0.9";
              //  this.text.textContent = this.currentValue ? "1" : "0";
            } else {
                //style.fill = "#00ff00";
                //style.opacity = (0.1 + Math.max(0, Math.min(1023, this.currentValue)) / 1023 * 0.8).toString();
               // this.text.textContent = `~${this.currentValue}`
            }
        }
    }
}