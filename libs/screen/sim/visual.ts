/// <reference path="../../../node_modules/pxt-core/built/pxtsim.d.ts" />

namespace pxsim.visuals {
  const SCREEN_PART_WIDTH = 159;
  const SCREEN_PART_HEIGHT = 146;
  const SCREEN_PART = `
    <svg xmlns="http://www.w3.org/2000/svg" id="svg8" width="158.439" height="146.803" viewBox="0 0 158.439 146.803">
    <g id="layer1" transform="translate(-18.95 -27.866)">
      <path id="rect4487" fill="#00f" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.306" d="M19.603 28.519h157.133v145.497H19.603z"/>
      <image id="thescreen" width="136.673" height="109.33" x="26.118" y="61.528" fill="#c8beb7" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width=".427"/>
      <path id="GND" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M23.177 31.031h11.864v11.864H23.177z"/>
      <path id="VCC" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M42.834 31.031h11.864v11.864H42.834z"/>
      <path id="DISPLAY_DC" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M82.147 31.031h11.864v11.864H82.147z"/>
      <path id="DISPLAY_CS" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M101.804 31.031h11.864v11.864h-11.864z"/>
      <path id="DISPLAY_MOSI" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M121.46 31.031h11.864v11.864H121.46z"/>
      <path id="DISPLAY_SCK" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M141.117 31.031h11.864v11.864h-11.864z"/>
      <path id="DISPLAY_MISO" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M160.774 31.745h11.864v11.864h-11.864z"/>
      <text id="text4619" x="45.309" y="-27.057" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
        <tspan id="tspan4617" x="45.309" y="-27.057">Gnd</tspan>
      </text>
      <text id="text4619-4" x="45.51" y="-46.88" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
        <tspan id="tspan4617-3" x="45.51" y="-46.88">VCC</tspan>
      </text>
      <text id="text4619-4-9" x="45.17" y="-86.417" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
        <tspan id="tspan4617-3-1" x="45.17" y="-86.417">D/C</tspan>
      </text>
      <text id="text4619-4-9-2" x="45.225" y="-105.921" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
        <tspan id="tspan4617-3-1-5" x="45.225" y="-105.921">CS</tspan>
      </text>
      <text id="text4619-4-9-8" x="45.364" y="-125.602" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
        <tspan id="tspan4617-3-1-9" x="45.364" y="-125.602">MOSI</tspan>
      </text>
      <text id="text4619-4-9-3" x="45.163" y="-145.282" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
        <tspan id="tspan4617-3-1-7" x="45.163" y="-145.282">SCK</tspan>
      </text>
      <text id="text4619-4-9-0" x="46.078" y="-164.962" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
        <tspan id="tspan4617-3-1-72" x="46.078" y="-164.962">MISO</tspan>
      </text>
      <path id="DISPLAY_RST" fill="#d4d4d4" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.139" d="M62.49 31.031h11.864v11.864H62.49z"/>
      <text id="text4619-4-94" x="44.972" y="-66.56" fill="#fff" stroke-width=".226" font-family="consolas" font-size="6.63" font-weight="400" letter-spacing="0" style="line-height:1.25;-inkscape-font-specification:consolas" transform="rotate(90)" word-spacing="0">
        <tspan id="tspan4617-3-6" x="44.972" y="-66.56">RST</tspan>
      </text>
    </g>
    </svg>`;

  export function mkScreenPart(xy: Coord = [0, 0]): SVGElAndSize {
    let [x, y] = xy;
    let l = x;
    let t = y;
    let w = SCREEN_PART_WIDTH;
    let h = SCREEN_PART_HEIGHT;
    let img = <SVGGElement>svg.elt("image");
    svg.hydrate(img, {
      class: "sim-screen", x: l, y: t, width: w, height: h,
      href: svg.toDataUri(SCREEN_PART)
    });
    return { el: img, x: l, y: t, w: w, h: h };
  }

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
      this.overElement = undefined;
      this.defs = [];
      this.lastLocation = [0, 0];

      const partSvg = svg.parseString(SCREEN_PART);
      this.element = svg.elt("g");
      this.element.appendChild(partSvg.firstElementChild as SVGElement);
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
      translateEl(this.element, [x, y])
    }

    updateState(): void { }

    updateTheme(): void { }
  }
}
