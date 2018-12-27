/// <reference path="../../../node_modules/pxt-core/built/pxtsim.d.ts" />

namespace pxsim.visuals {
    export class ScreenView implements IBoardPart<ScreenState> {
        bus: pxsim.EventBus;
        style: string;
        element: SVGElement;
        overElement?: SVGElement;
        defs: SVGElement[];
        state: ScreenState;
        canvas: SVGImageElement;
        lastLocation: Coord;

        constructor() {
            
        }

        init(bus: EventBus, state: ScreenState, svgEl: SVGSVGElement, otherParams: Map<string>): void { 
            this.bus = bus;
            this.state = state;
            this.element = svgEl;
            this.overElement = undefined;
            this.defs = [];
            this.lastLocation = [0, 0];

            const partSvg = svg.parseString(`
            <svg xmlns="http://www.w3.org/2000/svg" id="svg8" width="147.01" height="138.588" viewBox="0 0 147.01 138.588">
            <g id="layer1" transform="translate(-18.95 -27.866)">
              <path id="rect4487" fill="#00f" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.222" d="M19.561 28.477h145.788v137.366H19.561z"/>
              <image id="thescreen" width="136.673" height="102.505" x="24.118" y="60.353" fill="#c8beb7" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width=".427"/>
              <path id="GND" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M23.177 31.189h11.864v11.864H23.177z"/>
              <path id="VCC" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M43.741 31.189h11.864v11.864H43.741z"/>
              <path id="DISPLAY_DC" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M64.304 31.189h11.864v11.864H64.304z"/>
              <path id="DISPLAY_CS" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M84.868 31.189h11.864v11.864H84.868z"/>
              <path id="DISPLAY_MOSI" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M105.432 31.189h11.864v11.864h-11.864z"/>
              <path id="DISPLAY_SCK" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M125.996 31.189h11.864v11.864h-11.864z"/>
              <path id="DISPLAY_MISO" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M146.559 31.189h11.864v11.864h-11.864z"/>
              <text id="text4619" x="45.309" y="-27.057" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
                <tspan id="tspan4617" x="45.309" y="-27.057">Gnd</tspan>
              </text>
              <text id="text4619-4" x="45.51" y="-47.802" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
                <tspan id="tspan4617-3" x="45.51" y="-47.802">VCC</tspan>
              </text>
              <text id="text4619-4-9" x="45.17" y="-68.584" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
                <tspan id="tspan4617-3-1" x="45.17" y="-68.584">D/C</tspan>
              </text>
              <text id="text4619-4-9-2" x="45.225" y="-88.98" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
                <tspan id="tspan4617-3-1-5" x="45.225" y="-88.98">CS</tspan>
              </text>
              <text id="text4619-4-9-8" x="45.364" y="-109.57" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
                <tspan id="tspan4617-3-1-9" x="45.364" y="-109.57">MOSI</tspan>
              </text>
              <text id="text4619-4-9-3" x="45.163" y="-130.159" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
                <tspan id="tspan4617-3-1-7" x="45.163" y="-130.159">SCK</tspan>
              </text>
              <text id="text4619-4-9-0" x="45.364" y="-150.748" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
                <tspan id="tspan4617-3-1-72" x="45.364" y="-150.748">MISO</tspan>
              </text>
            </g>
          </svg>
`);

            this.element.appendChild(partSvg);
            this.canvas = partSvg.getElementById('thescreen') as SVGImageElement;
            this.state.bindToSvgImage(this.canvas);
        }

        moveToCoord(xy: visuals.Coord): void { 
            let [x, y] = xy;
            const loc: Coord = [x, y];
            this.lastLocation = loc;
            this.updateLoc();
        }

        private updateLoc() {
            let [x, y] = this.lastLocation;
            //this.canvas.setLoc([x + ScreenView.CANVAS_LEFT, y + ScreenView.CANVAS_TOP]);
            //svg.hydrate(this.part.el, { transform: `translate(${x} ${y})` }); //TODO: update part's l,h, etc.
        }

        updateState(): void { }

        updateTheme(): void { }
    }
}
