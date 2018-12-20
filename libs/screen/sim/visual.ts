/// <reference path="../../../node_modules/pxt-core/built/pxtsim.d.ts" />

namespace pxsim.visuals {
    export class ScreenView implements IBoardPart<ScreenState> {
        private static CANVAS_LEFT = 1.4 * PIN_DIST;
        private static CANVAS_TOP = PIN_DIST;

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

            this.canvas = svg.elt("image", { class: "sim-screen-canvas" }) as SVGImageElement;
            const canvasG = svg.elt("g", { class: "sim-screen-canvas-parent" });
            this.overElement = canvasG;
            canvasG.appendChild(this.canvas);

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
