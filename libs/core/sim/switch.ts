namespace pxsim.visuals {
    const SWITCH_PART_XOFF = -1 ;
    const SWITCH_PART_YOFF = -30;
    const SWITCH_PART_WIDTH = 100;
    const SWITCH_PART_HEIGHT = 100;
    const SWITCH_PART_PIN_DIST = 15;
    const SWITCH_PART_SVG_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100" id="svg8">
    <g id="layer1" transform="translate(0 -197)">
      <rect id="rect4508-3" width="6.054" height="32.94" x="43.381" y="210.817" rx="2.811" fill="#666" stroke="#000" stroke-width=".309"/>
      <rect id="rect4508-3-3" width="6.054" height="32.94" x="58.321" y="210.817" rx="2.811" fill="#666" stroke="#000" stroke-width=".309"/>
      <rect id="rect4508" width="6.054" height="32.94" x="28.44" y="210.817" rx="2.811" fill="#666" stroke="#000" stroke-width=".309"/>
      <rect id="rect4485" width="100.542" height="40.611" y="237.763" rx="3.432" stroke="#000" stroke-width=".309"/>
      <rect id="rect4487" width="60.587" height="18.323" x="7.977" y="248.907" rx="2.46" fill="#b3b3b3" stroke="#000" stroke-width=".262"/>
      <rect id="rect4487-7" width="53.273" height="10.029" x="11.2" y="253.384" rx="2.163" fill="#999" stroke="#000" stroke-width=".182"/>
      <rect id="handle" width="19.243" height="30.007" x="11.924" y="256.572" rx="3.432" fill="#4d4d4d" stroke="#000" stroke-width=".309"/>
      <text style="line-height:1.25" x="71.848" y="259.158" id="text" transform="scale(.97895 1.0215)" font-weight="400" font-size="17.409" font-family="sans-serif" letter-spacing="0" word-spacing="0" fill="#fff" stroke-width=".435">
        <tspan id="tspan4558" x="71.848" y="259.158" style="-inkscape-font-specification:Consolas" font-family="Consolas">OFF</tspan>
      </text>
    </g>
  </svg>
  `;
  const SWITCH_PART_SVG_ON = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100" id="svg8">
  <g id="layer1" transform="translate(0 -197)">
    <g id="g4509" transform="matrix(1.14409 0 0 1.19383 -7.582 -50.118)">
      <rect rx="2.457" y="218.57" x="44.544" height="27.592" width="5.292" id="rect4508-3" fill="#666" stroke="#000" stroke-width=".265"/>
      <rect rx="2.457" y="218.57" x="57.604" height="27.592" width="5.292" id="rect4508-3-3" fill="#666" stroke="#000" stroke-width=".265"/>
      <rect rx="2.457" y="218.57" x="31.485" height="27.592" width="5.292" id="rect4508" fill="#666" stroke="#000" stroke-width=".265"/>
      <rect rx="3" y="241.141" x="6.627" height="34.018" width="87.879" id="rect4485" fill="#450" stroke="#000" stroke-width=".265"/>
      <rect rx="2.15" y="250.476" x="13.6" height="15.348" width="52.957" id="rect4487" fill="#b3b3b3" stroke="#000" stroke-width=".224"/>
      <rect rx="1.89" y="254.226" x="16.417" height="8.4" width="46.564" id="rect4487-7" fill="#999" stroke="#000" stroke-width=".156"/>
      <rect rx="3" y="256.897" x="46.189" height="25.135" width="16.82" id="handle" fill="#4d4d4d" stroke="#000" stroke-width=".265"/>
      <text id="text" y="263.731" x="68.105" style="line-height:1.25" font-weight="400" font-size="14.896" font-family="sans-serif" letter-spacing="0" word-spacing="0" fill="#fff" stroke-width=".372">
        <tspan style="-inkscape-font-specification:Consolas" y="263.731" x="68.105" id="tspan4558" font-family="Consolas">ON</tspan>
      </text>
    </g>
  </g>
</svg>
`;

    // For the intructions
    export function mkSideSwitchPart(xy: Coord = [0, 0]): SVGElAndSize {
        const [x, y] = xy;
        const l = x + SWITCH_PART_XOFF;
        const t = y + SWITCH_PART_YOFF;
        const w = SWITCH_PART_WIDTH;
        const h = SWITCH_PART_HEIGHT;
        const img = <SVGGElement>svg.elt("image");
        svg.hydrate(img, {
            class: "sim-led", x: l, y: t, width: w, height: h,
            href: svg.toDataUri(SWITCH_PART_SVG_OFF)
        });
        return { el: img, x: l, y: t, w: w, h: h };
    }

    export class ToggleComponentVisual implements IBoardPart<ToggleStateConstructor> {
        style: string;
        element: SVGElement;
        overElement: SVGElement;
        defs: SVGElement[];

        private onElement: SVGElement;
        private offElement: SVGElement;
        private state: ToggleState;
        private currentlyOn: boolean = false;
        private parsePinString: (str:string) => Pin;

        constructor(parsePinString: (str: string) => Pin) {
            this.element = svg.elt("g");
            this.element.onclick = () => {
                if (this.state) {
                    this.state.toggle();
                    runtime.queueDisplayUpdate();
                }
            }
            this.onElement = this.initImage(SWITCH_PART_SVG_ON);
            this.offElement = this.initImage(SWITCH_PART_SVG_OFF);
            this.element.appendChild(this.offElement);
            this.parsePinString = parsePinString;
        }

        moveToCoord(xy: Coord): void {
            const to: Coord = [xy[0] + SWITCH_PART_XOFF, xy[1] + SWITCH_PART_YOFF];
            translateEl(this.element, to);
        }

        init(bus: EventBus, state: ToggleStateConstructor, svgEl: SVGSVGElement, otherParams: Map<string>): void {
            this.state = state(this.parsePinString(otherParams["pin"]));
            this.updateState();
        }

        updateState(): void {
            if (this.state.on === this.currentlyOn) {
                return;
            }

            this.currentlyOn = this.state.on;

            if (this.state.on) {
                this.element.removeChild(this.offElement);
                this.element.appendChild(this.onElement)
            }
            else {
                this.element.removeChild(this.onElement);
                this.element.appendChild(this.offElement)
            }
        }

        updateTheme(): void { }

        private initImage(svgData: string) {
            const image = "data:image/svg+xml," + encodeURIComponent(svgData);
            let imgAndSize = mkImageSVG({
                image,
                width: SWITCH_PART_WIDTH,
                height: SWITCH_PART_HEIGHT,
                imageUnitDist: SWITCH_PART_PIN_DIST,
                targetUnitDist: PIN_DIST
            });
            return imgAndSize.el;
        }
    }
}
