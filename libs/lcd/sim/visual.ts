namespace pxsim.visuals {    
    // For the intructions
    export function mkLCDPart(xy: Coord = [0, 0]): SVGElAndSize {
        let [x, y] = xy;
        let l = x;
        let t = y;
        let w = LCD_PART_WIDTH;
        let h = LCD_PART_HEIGHT;
        let img = <SVGGElement>svg.elt("image");
        svg.hydrate(img, {
            class: "sim-lcd", x: l, y: t, width: w, height: h,
            href: svg.toDataUri(LCD_PART)
        });
        return { el: img, x: l, y: t, w: w, h: h };
    }

    export class LCDView implements IBoardPart<LCDState> {
        style: string;
        element: SVGElement;
        defs: SVGElement[];
        image: SVGSVGElement;
        
        private backlight: SVGGElement;
        private screen: SVGGElement;
        private part: SVGElAndSize;
        private bus: EventBus;

        private state: LCDState;

        constructor() {
        }

        public init(bus: EventBus, state: LCDState, svgEl: SVGSVGElement, otherParams: Map<string>): void {
            this.state = state
            this.bus = bus;
            this.initDom();
            this.updateState();
        }

        initDom() {
            this.element = svg.elt("g");
            this.image = new DOMParser().parseFromString(LCD_PART, "image/svg+xml").querySelector("svg") as SVGSVGElement;
            svg.hydrate(this.image, {
                class: "sim-lcd", width: LCD_PART_WIDTH, height: LCD_PART_HEIGHT,
            });
            this.screen = this.image.getElementById('ecran') as SVGGElement;
            this.backlight = this.image.getElementById('backlight') as SVGGElement;
            this.backlight.style.fill = "#6e7d6e";
            this.element.appendChild(this.image);
        }

        setChar(column: number, line: number, value: string): void {
            let _case = this.image.getElementById("case"+line+""+column+"_text") as SVGTextElement;
            _case.innerHTML = value.charAt(0);
        }

        public moveToCoord(xy: Coord) {
            translateEl(this.element, [xy[0], xy[1]]);
        }

        public updateTheme() {
        }

        public updateState() {
            for (let line = 0; line < this.state.lines; line++) {
                for (let column = 0; column < this.state.columns; column++) {
                    if(!!this.state.text && !!this.state.text[line] && !!this.state.text[line][column])
                        this.setChar(column, line, this.state.text[line][column]);
                }  
            }
            this.backlight.style.fill = this.state.backLightColor;
        }
    }

    const LCD_PART_WIDTH = 322.79001;
    const LCD_PART_HEIGHT = 129.27348;

    const LCD_PART = `
    <svg xmlns="http://www.w3.org/2000/svg" id="LCD" width="322.8" height="129.3" viewBox="0 0 322.8 129.3">
    <defs id="defs2284">
      <style id="style2282">
        .cls-textCase{fill:#000;fill-opacity:.8;font-family:monospace;font-weight:100;font-size:24px}.cls-case{fill:#fff;fill-opacity:.1}
      </style>
    </defs>
    <path id="rect4820" fill="#6767ff" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".7" d="M.3.3h322.1v128.6H.3z"/>
    <path id="path132" fill="#303030" stroke-width=".9" d="M308.6 93c-1 0-1.9-.8-1.9-1.8V57.7c0-1 .9-1.8 1.9-1.8V29h-.9l-2.9-2.6v-1H18v1L15.1 29h-1V56h.1c1 0 1.9.8 1.9 1.8v33.5c0 1-.8 1.8-1.9 1.8v26.9h1l2.8 2.6v1h286.8v-1l2.9-2.6h1V93z"/>
    <g id="g140" transform="matrix(.95829 0 0 .88143 -10.2 -3.4)">
      <path id="backlight" d="M319.6 118.3a6 6 0 0 1-6 6h-269a6 6 0 0 1-6-6v-60a6 6 0 0 1 6-6h269a6 6 0 0 1 6 6z" class="cls-backlight"/>
      <g id="g138" opacity=".2">
        <path id="path136" fill="#22420d" d="M319.6 58.3v60-60zm-275-6a6 6 0 0 0-6 6v60a6 6 0 0 0 6 6H48a6 6 0 0 1-6-6v-58a6 6 0 0 1 6-6h270c-1-1.1-2.6-2-4.4-2h-269z"/>
      </g>
    </g>
    <g id="g146" transform="matrix(.95829 0 0 .88143 -10.2 -3.4)">
      <path id="path142" fill="#1a1a1a" d="M322 40.5c0-1-.8-2-1.9-2h-282c-1.1 0-2 1-2 2v1.1c0 1.1.9 2 2 2h282c1 0 2-.9 2-2v-1z"/>
      <path id="path144" fill="#424242" d="M321 42.3c0-.7-.6-1.3-1.3-1.3h-281c-.9 0-1.5.6-1.5 1.3 0 .7.6 1.3 1.4 1.3h281c.8 0 1.5-.6 1.5-1.3z"/>
    </g>
    <g id="g152" transform="matrix(.95829 0 0 .88143 -10.2 -3.4)">
      <path id="path148" fill="#1a1a1a" d="M322 134c0-1-.8-1.9-1.9-1.9h-282c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2h282c1 0 2-.9 2-2v-1z"/>
      <path id="path150" fill="#424242" d="M321 135.8c0-.7-.6-1.3-1.3-1.3h-281c-.9 0-1.5.6-1.5 1.3 0 .8.6 1.3 1.4 1.3h281c.8 0 1.5-.5 1.5-1.3z"/>
    </g>
    <g id="g158" fill-opacity="0" stroke="#f2f2f2" stroke-linecap="round" stroke-opacity=".2" stroke-width=".2" transform="matrix(.95829 0 0 .88143 -10.2 -3.4)">
      <path id="path154" d="M27 37.4l3.2-3"/>
      <path id="path156" d="M30.2 143.3l-3.1-3.1"/>
    </g>
    <g id="g164" fill-opacity="0" stroke="#f2f2f2" stroke-linecap="round" stroke-opacity=".2" stroke-width=".2" transform="matrix(.95829 0 0 .88143 -10.2 -3.4)">
      <path id="path160" d="M332.1 37.4l-3.1-3"/>
      <path id="path162" d="M329 143.3l3-3.1"/>
    </g>
    <path id="path166" fill-opacity="0" stroke="#1a1a1a" stroke-opacity=".4" stroke-width="1.3" d="M296.5 101.4c0 2.8-2.6 5.2-5.7 5.2H33c-3 0-5.6-2.4-5.6-5.2v-53c0-2.8 2.5-5.2 5.6-5.2h258c3 0 5.6 2.4 5.6 5.2z"/>
    <g id="ecran" transform="matrix(1.02697 0 0 1.04868 -20.3 -17.7)">
      <path id="case10" fill="#fff" fill-opacity=".1" d="M52.9 88.8h14.8v24.4H52.9z" class="cls-case"/>
      <path id="case11" fill="#fff" fill-opacity=".1" d="M68.7 88.8h14.8v24.4H68.7z" class="cls-case"/>
      <path id="case12" fill="#fff" fill-opacity=".1" d="M84.6 88.8h14.8v24.4H84.5z" class="cls-case"/>
      <path id="case13" fill="#fff" fill-opacity=".1" d="M100.4 88.8h14.8v24.4h-14.8z" class="cls-case"/>
      <path id="case14" fill="#fff" fill-opacity=".1" d="M116.3 88.8H131v24.4h-14.7z" class="cls-case"/>
      <path id="case15" fill="#fff" fill-opacity=".1" d="M132 88.8H147v24.4H132z" class="cls-case"/>
      <path id="case16" fill="#fff" fill-opacity=".1" d="M148 88.8h14.7v24.4H148z" class="cls-case"/>
      <path id="case17" fill="#fff" fill-opacity=".1" d="M163.8 88.8h14.8v24.4h-14.8z" class="cls-case"/>
      <path id="case18" fill="#fff" fill-opacity=".1" d="M179.6 88.8h14.8v24.4h-14.8z" class="cls-case"/>
      <path id="case19" fill="#fff" fill-opacity=".1" d="M195.5 88.8h14.7v24.4h-14.7z" class="cls-case"/>
      <path id="case110" fill="#fff" fill-opacity=".1" d="M211.3 88.8h14.8v24.4h-14.8z" class="cls-case"/>
      <path id="case111" fill="#fff" fill-opacity=".1" d="M227.1 88.8H242v24.4h-14.8z" class="cls-case"/>
      <path id="case112" fill="#fff" fill-opacity=".1" d="M243 88.8h14.8v24.4H243z" class="cls-case"/>
      <path id="case113" fill="#fff" fill-opacity=".1" d="M258.8 88.8h14.8v24.4h-14.8z" class="cls-case"/>
      <path id="case114" fill="#fff" fill-opacity=".1" d="M274.7 88.8h14.7v24.4h-14.7z" class="cls-case"/>
      <path id="case115" fill="#fff" fill-opacity=".1" d="M290.5 88.8h14.8v24.4h-14.8z" class="cls-case"/>
      <text id="case10_text" x="52.9" y="112.9" class="cls-textCase"/>
      <text id="case11_text" x="68.7" y="112.9" class="cls-textCase"/>
      <text id="case12_text" x="84.6" y="112.9" class="cls-textCase"/>
      <text id="case13_text" x="100.4" y="112.9" class="cls-textCase"/>
      <text id="case14_text" x="116.3" y="112.9" class="cls-textCase"/>
      <text id="case15_text" x="132.1" y="112.9" class="cls-textCase"/>
      <text id="case16_text" x="147.9" y="112.9" class="cls-textCase"/>
      <text id="case17_text" x="163.8" y="112.9" class="cls-textCase"/>
      <text id="case18_text" x="179.6" y="112.9" class="cls-textCase"/>
      <text id="case19_text" x="195.5" y="112.9" class="cls-textCase"/>
      <text id="case110_text" x="211.3" y="112.9" class="cls-textCase"/>
      <text id="case111_text" x="227.1" y="112.9" class="cls-textCase"/>
      <text id="case112_text" x="243" y="112.9" class="cls-textCase"/>
      <text id="case113_text" x="258.8" y="112.9" class="cls-textCase"/>
      <text id="case114_text" x="274.7" y="112.9" class="cls-textCase"/>
      <text id="case115_text" x="290.5" y="112.9" class="cls-textCase"/>
      <path id="case00" fill="#fff" fill-opacity=".1" d="M52.9 63.5h14.8v24.3H52.9z" class="cls-case"/>
      <path id="case01" fill="#fff" fill-opacity=".1" d="M68.7 63.5h14.8v24.3H68.7z" class="cls-case"/>
      <path id="case02" fill="#fff" fill-opacity=".1" d="M84.6 63.5h14.8v24.3H84.5z" class="cls-case"/>
      <path id="case03" fill="#fff" fill-opacity=".1" d="M100.4 63.5h14.8v24.3h-14.8z" class="cls-case"/>
      <path id="case04" fill="#fff" fill-opacity=".1" d="M116.3 63.5H131v24.3h-14.7z" class="cls-case"/>
      <path id="case05" fill="#fff" fill-opacity=".1" d="M132 63.5H147v24.3H132z" class="cls-case"/>
      <path id="case06" fill="#fff" fill-opacity=".1" d="M148 63.5h14.7v24.3H148z" class="cls-case"/>
      <path id="case07" fill="#fff" fill-opacity=".1" d="M163.8 63.5h14.8v24.3h-14.8z" class="cls-case"/>
      <path id="case08" fill="#fff" fill-opacity=".1" d="M179.6 63.5h14.8v24.3h-14.8z" class="cls-case"/>
      <path id="case09" fill="#fff" fill-opacity=".1" d="M195.5 63.5h14.7v24.3h-14.7z" class="cls-case"/>
      <path id="case010" fill="#fff" fill-opacity=".1" d="M211.3 63.5h14.8v24.3h-14.8z" class="cls-case"/>
      <path id="case011" fill="#fff" fill-opacity=".1" d="M227.1 63.5H242v24.3h-14.8z" class="cls-case"/>
      <path id="case012" fill="#fff" fill-opacity=".1" d="M243 63.5h14.8v24.3H243z" class="cls-case"/>
      <path id="case013" fill="#fff" fill-opacity=".1" d="M258.8 63.5h14.8v24.3h-14.8z" class="cls-case"/>
      <path id="case014" fill="#fff" fill-opacity=".1" d="M274.7 63.5h14.7v24.3h-14.7z" class="cls-case"/>
      <path id="case015" fill="#fff" fill-opacity=".1" d="M290.5 63.5h14.8v24.3h-14.8z" class="cls-case"/>
      <text id="case00_text" x="52.9" y="87.5" class="cls-textCase"/>
      <text id="case01_text" x="68.7" y="87.5" class="cls-textCase"/>
      <text id="case02_text" x="84.6" y="87.5" class="cls-textCase"/>
      <text id="case03_text" x="100.4" y="87.5" class="cls-textCase"/>
      <text id="case04_text" x="116.3" y="87.5" class="cls-textCase"/>
      <text id="case05_text" x="132.1" y="87.5" class="cls-textCase"/>
      <text id="case06_text" x="147.9" y="87.5" class="cls-textCase"/>
      <text id="case07_text" x="163.8" y="87.5" class="cls-textCase"/>
      <text id="case08_text" x="179.6" y="87.5" class="cls-textCase"/>
      <text id="case09_text" x="195.5" y="87.5" class="cls-textCase"/>
      <text id="case010_text" x="211.3" y="87.5" class="cls-textCase"/>
      <text id="case011_text" x="227.1" y="87.5" class="cls-textCase"/>
      <text id="case012_text" x="243" y="87.5" class="cls-textCase"/>
      <text id="case013_text" x="258.8" y="87.5" class="cls-textCase"/>
      <text id="case014_text" x="274.7" y="87.5" class="cls-textCase"/>
      <text id="case015_text" x="290.5" y="87.5" class="cls-textCase"/>
    </g>
    <g id="g238" fill="#606060" transform="matrix(.95829 0 0 .88143 -10.2 -3.4)">
      <path id="path234" d="M25.8 109.3v30.6h.4v-30.7h-.4z"/>
      <path id="path236" d="M26.2 67.5V36.7h-.4v30.7h.4z"/>
    </g>
    <g id="g248" fill="#212121" transform="matrix(.95829 0 0 .88143 -10.2 -3.4)">
      <path id="path244" d="M25.5 67.3h.4V36.8h-.5v30.6z"/>
      <path id="path246" d="M25.5 109.3h-.1V140h.5v-30.6h-.4z"/>
    </g>
    <path id="path250" fill="#212121" stroke-width=".9" d="M18 123.1h286.8v.5H18z"/>
    <path id="path252" fill="#606060" stroke-width=".9" d="M18 122.8h286.8v.3H18z"/>
    <g id="g258" fill="#212121" transform="matrix(.95829 0 0 .88143 -10.2 -3.4)">
      <path id="path254" d="M332.7 109.3h-.4v30.6h.5v-30.6z"/>
      <path id="path256" d="M332.7 67.3V36.7h-.4v30.7h.4z"/>
    </g>
    <g id="g264" fill="#606060" transform="matrix(.95829 0 0 .88143 -10.2 -3.4)">
      <path id="path260" d="M332 109.2v30.7h.3v-30.6l-.4-.1z"/>
      <path id="path262" d="M332.3 67.4V36.7h-.4v30.8l.4-.1z"/>
    </g>
    <path id="GND2" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M12 8h9.7v9.7H12z"/>
    <path id="LCD_DATALINE5" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M175 8h9.7v9.7H175z"/>
    <path id="rect4824-7" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M145.3 8h9.7v9.7h-9.7z"/>
    <path id="rect4824-1" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M130.5 8h9.7v9.7h-9.7z"/>
    <path id="rect4824-2" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M115.7 8h9.7v9.7h-9.7z"/>
    <path id="rect4824-24" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M100.9 8h9.7v9.7h-9.7z"/>
    <path id="LCD_ENABLE" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M86.1 8h9.7v9.7h-9.7z"/>
    <path id="rw" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M71.2 8h9.7v9.7h-9.7z"/>
    <path id="LCD_RESET" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M56.4 8h9.7v9.7h-9.7z"/>
    <path id="GND4" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M41.6 8h9.7v9.7h-9.7z"/>
    <path id="VCC2" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M26.8 8h9.7v9.7h-9.7z"/>
    <path id="LCD_DATALINE6" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M189.8 8h9.7v9.7h-9.7z"/>
    <path id="LCD_DATALINE4" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M160.1 8h9.7v9.7h-9.7z"/>
    <path id="VCC" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M219.4 8h9.7v9.7h-9.7z"/>
    <path id="LCD_DATALINE7" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M204.6 8h9.7v9.7h-9.7z"/>
    <path id="GND" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width=".6" d="M234.2 8h9.7v9.7h-9.7z"/>
  </svg>
        `;

}