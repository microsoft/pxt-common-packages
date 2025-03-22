namespace pxsim.gpu {
    /**
     * Quad layout (wound clockwise)
     * (i:0,uv:0,0) (i:1,uv:1,0)
     *   +------------+
     *   |\__         |
     *   |   \__      |
     *   |      \__   |
     *   |         \__|
     *   +------------+
     * (i:3,uv:0,1) (i:2,uv:1,1)
     */


    type V2 = { x: number; y: number };
    type Vertex = { pos: V2; uv: V2 };
    type Bounds = { left: number; top: number; right: number; bottom: number };

    type Ops = {
        initFx(v: number): number;
        toFixed(v: number): number;
        toInt(v: number): number;
        round(v: number): number;
        mul(a: number, b: number): number;
        div(a: number, b: number): number;
    };

    const fxOps: Ops = {
        initFx(v: number): number {
            // Convert to fx8
            return (v * 256) | 0;
        },
        toFixed(v: number): number {
            // Convert to fx8
            return (v * 256) | 0;
        },
        toInt(v: number): number {
            // Convert to number
            return v >> 8;
        },
        round(v: number): number {
            return (v + 128) >> 8;
        },
        mul(a: number, b: number): number {
            return ((a * b) | 0) >> 8;
        },
        div(a: number, b: number): number {
            return ((a | 0) << 8) / (b | 0);
        },
    };

    const floatOps: Ops = {
        initFx(v: number): number {
            // Convert to number
            return v >> 8;
        },
        toFixed(v: number): number {
            // Keep as number
            return v | 0;
        },
        toInt(v: number): number {
            // Already a number
            return v | 0;
        },
        round(v: number): number {
            return Math.round(v);
        },
        mul(a: number, b: number): number {
            return a * b;
        },
        div(a: number, b: number): number {
            return a / b;
        },
    };

    const ops = fxOps;
    //const ops = floatOps

    const fxZero = 0;
    const fxOne = ops.toFixed(1);
    const fxHalf = ops.toFixed(0.5);

    function wrapFx(v: number): number {
        let r = v % fxOne;
        if (r < fxZero) r += fxOne;
        return r;
    }
    function edge(a: V2, b: V2, c: V2): number {
        return ops.mul(b.y - a.y, c.x - a.x) - ops.mul(b.x - a.x, c.y - a.y);
    }
    function clamp(v: number, min: number, max: number): number {
        return Math.min(max, Math.max(v, min));
    }
    function min4(a: number, b: number, c: number, d: number): number {
        return Math.min(Math.min(Math.min(a, b), c), d);
    }
    function max4(a: number, b: number, c: number, d: number): number {
        return Math.max(Math.max(Math.max(a, b), c), d);
    }
    function isTopLeft(a: V2, b: V2): boolean {
        return a.y < b.y || (a.y === b.y && a.x < b.x);
    }
    function isInsideTriangle(px: number, py: number, a: V2, b: V2, c: V2): boolean {
        const e0 = edge(a, b, { x: px, y: py });
        const e1 = edge(b, c, { x: px, y: py });
        const e2 = edge(c, a, { x: px, y: py });

        return (
            (e0 > 0 || (e0 === 0 && isTopLeft(b, c))) &&
            (e1 > 0 || (e1 === 0 && isTopLeft(c, a))) &&
            (e2 > 0 || (e2 === 0 && isTopLeft(a, b)))
        );
    }
    function interpolateUV(px: number, py: number, a: V2, b: V2, c: V2, ua: V2, ub: V2, uc: V2, invArea: number): V2 {
        const w0 = ops.mul(edge(b, c, { x: px, y: py }), invArea);
        const w1 = ops.mul(edge(c, a, { x: px, y: py }), invArea);
        const w2 = ops.mul(edge(a, b, { x: px, y: py }), invArea);
        //const w2 = fxOne - w0 - w1;

        return {
            x: ops.mul(ua.x, w0) + ops.mul(ub.x, w1) + ops.mul(uc.x, w2),
            y: ops.mul(ua.y, w0) + ops.mul(ub.y, w1) + ops.mul(uc.y, w2)
        };
    }

    function drawTexturedQuad(dst: RefImage, tex: RefImage, args: RefCollection) {

        const v0: Vertex = {
            pos: { x: ops.initFx(args.getAt(0)), y: ops.initFx(args.getAt(1)) },
            uv: { x: ops.initFx(args.getAt(2)), y: ops.initFx(args.getAt(3)) },
        };
        const v1: Vertex = {
            pos: { x: ops.initFx(args.getAt(4)), y: ops.initFx(args.getAt(5)) },
            uv: { x: ops.initFx(args.getAt(6)), y: ops.initFx(args.getAt(7)) },
        };
        const v2: Vertex = {
            pos: { x: ops.initFx(args.getAt(8)), y: ops.initFx(args.getAt(9)) },
            uv: {
                x: ops.initFx(args.getAt(10)), y: ops.initFx(args.getAt(11)),
            },
        };
        const v3: Vertex = {
            pos: { x: ops.initFx(args.getAt(12)), y: ops.initFx(args.getAt(13)), },
            uv: { x: ops.initFx(args.getAt(14)), y: ops.initFx(args.getAt(15)), },
        };

        drawInterpolatedQuad(v0, v1, v2, v3, dst, tex);
    }

    function drawInterpolatedQuad(v0: Vertex, v1: Vertex, v2: Vertex, v3: Vertex, dst: RefImage, tex: RefImage) {
        const p0 = v0.pos, p1 = v1.pos, p2 = v2.pos, p3 = v3.pos;
        const uv0 = v0.uv, uv1 = v1.uv, uv2 = v2.uv, uv3 = v3.uv;

        const dx1 = p1.x - p0.x, dy1 = p1.y - p0.y;
        const dx2 = p3.x - p0.x, dy2 = p3.y - p0.y;

        const denom = ops.mul(dx1, dy2) - ops.mul(dx2, dy1);
        if (denom === fxZero) return;

        const texWfx = ops.toFixed(tex._width);
        const texHfx = ops.toFixed(tex._height);
        const halfTexelU = ops.div(fxOne, tex._width << 1);
        const halfTexelV = ops.div(fxOne, tex._height << 1);

        const areaA = edge(p0, p3, p2);
        const invAreaA = areaA !== fxZero ? ops.div(fxOne, areaA) : fxZero;

        const areaB = edge(p2, p1, p0);
        const invAreaB = areaB !== fxZero ? ops.div(fxOne, areaB) : fxZero;

        const minX = min4(p0.x, p1.x, p2.x, p3.x);
        const minY = min4(p0.y, p1.y, p2.y, p3.y);
        const maxX = max4(p0.x, p1.x, p2.x, p3.x);
        const maxY = max4(p0.y, p1.y, p2.y, p3.y);

        const pbounds: Bounds = {
            left: clamp(minX, 0, ops.toFixed(dst._width)),
            top: clamp(minY, 0, ops.toFixed(dst._height)),
            right: clamp(maxX, 0, ops.toFixed(dst._width)),
            bottom: clamp(maxY, 0, ops.toFixed(dst._height))
        };

        for (let py = pbounds.top; py < pbounds.bottom; py += fxOne) {
            for (let px = pbounds.left; px < pbounds.right; px += fxOne) {
                const sampleX = px + fxHalf;
                const sampleY = py + fxHalf;

                if (invAreaA && isInsideTriangle(sampleX, sampleY, p0, p3, p2)) {
                    const uv = interpolateUV(sampleX, sampleY, p0, p3, p2, uv0, uv3, uv2, invAreaA);
                    const uWrap = wrapFx(uv.x + halfTexelU);
                    const vWrap = wrapFx(uv.y + halfTexelV);
                    const x = ops.round(ops.mul(uWrap, texWfx));
                    const y = ops.round(ops.mul(vWrap, texHfx));
                    const color = ImageMethods.getPixel(tex, x, y);
                    if (color) ImageMethods.setPixel(dst, ops.round(px), ops.round(py), color);
                } else if (invAreaB && isInsideTriangle(sampleX, sampleY, p2, p1, p0)) {
                    const uv = interpolateUV(sampleX, sampleY, p2, p1, p0, uv2, uv1, uv0, invAreaB);
                    const uWrap = wrapFx(uv.x + halfTexelU);
                    const vWrap = wrapFx(uv.y + halfTexelV);
                    const x = ops.round(ops.mul(uWrap, texWfx));
                    const y = ops.round(ops.mul(vWrap, texHfx));
                    const color = ImageMethods.getPixel(tex, x, y);
                    if (color) ImageMethods.setPixel(dst, ops.round(px), ops.round(py), color);
                }
            }
        }
    }

    export function _drawTexturedQuad(
        dst: RefImage,
        tex: RefImage,
        args: RefCollection
    ) {
        drawTexturedQuad(dst, tex, args);
    }
}
