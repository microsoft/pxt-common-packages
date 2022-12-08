namespace pxsim.gpu {
    type V2 = { x: number; y: number };
    type Vertex = { pos: V2; uv: V2 };
    type Bounds = { left: number; top: number; right: number; bottom: number };

    type DrawTriArgs = {
        verts: Vertex[];
        indices: number[];
        dst: RefImage;
        tex: RefImage;
    };

    type Ops = {
        initFx(v: number): number;
        toFixed(v: number): number;
        toInt(v: number): number;
        mul(a: number, b: number): number;
        div(a: number, b: number): number;
    };

    const fxOps: Ops = {
        initFx(v: number): number {
            // Already an fx8
            return v;
        },
        toFixed(v: number): number {
            // Convert to fx8
            return (v * 256) | 0;
        },
        toInt(v: number): number {
            // Convert to number
            return v >> 8;
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

    // Workaround for the visible seam that sometimes appears on the shared diagonal edge between triangles.
    const w1Fudge = ops.toFixed(0); // If negative, the sampling will overlap the diagonal edge by that amount.

    function edge(a: V2, b: V2, c: V2): number {
        return ops.mul(b.y - a.y, c.x - a.x) - ops.mul(b.x - a.x, c.y - a.y);
    }
    function clamp(v: number, min: number, max: number): number {
        return Math.min(max, Math.max(v, min));
    }
    function min3(a: number, b: number, c: number): number {
        return Math.min(Math.min(a, b), c);
    }
    function max3(a: number, b: number, c: number): number {
        return Math.max(Math.max(a, b), c);
    }
    function scaleToRef(v: V2, s: number, ref: V2): V2 {
        ref.x = ops.mul(v.x, s);
        ref.y = ops.mul(v.y, s);
        return ref;
    }
    function add3ToRef(a: V2, b: V2, c: V2, ref: V2): V2 {
        ref.x = a.x + b.x + c.x;
        ref.y = a.y + b.y + c.y;
        return ref;
    }
    function divToRef(a: V2, b: V2, ref: V2): V2 {
        ref.x = ops.div(a.x, b.x);
        ref.y = ops.div(a.y, b.y);
        return ref;
    }

    function drawTexturedQuad(
        dst: RefImage,
        tex: RefImage,
        args: RefCollection
    ) {
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

        // Triangle indices. Triangles are wound counterclockwise.
        const TRI0_INDICES = [0, 3, 2];
        const TRI1_INDICES = [2, 1, 0];

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
                x: ops.initFx(args.getAt(10)),
                y: ops.initFx(args.getAt(11)),
            },
        };
        const v3: Vertex = {
            pos: {
                x: ops.initFx(args.getAt(12)),
                y: ops.initFx(args.getAt(13)),
            },
            uv: {
                x: ops.initFx(args.getAt(14)),
                y: ops.initFx(args.getAt(15)),
            },
        };
        const verts = [v0, v1, v2, v3];

        drawTexturedTri({ verts, indices: TRI0_INDICES, dst, tex });
        drawTexturedTri({ verts, indices: TRI1_INDICES, dst, tex });
    }

    function drawTexturedTri(args: DrawTriArgs): void {
        const v0 = args.verts[args.indices[0]];
        const v1 = args.verts[args.indices[1]];
        const v2 = args.verts[args.indices[2]];
        const p0 = v0.pos;
        const p1 = v1.pos;
        const p2 = v2.pos;

        const area = edge(p0, p1, p2);
        if (area <= 0) return;

        const dstWidth = ops.toFixed(
            clamp(args.dst._width, 0, args.dst._width)
        );
        const dstHeight = ops.toFixed(
            clamp(args.dst._height, 0, args.dst._height)
        );
        const texWidth = ops.toFixed(
            clamp(args.tex._width, 0, args.tex._width)
        );
        const texHeight = ops.toFixed(
            clamp(args.tex._height, 0, args.tex._height)
        );

        // Temp vars
        const _uv0: V2 = { x: fxZero, y: fxZero };
        const _uv1: V2 = { x: fxZero, y: fxZero };
        const _uv2: V2 = { x: fxZero, y: fxZero };
        const _uv: V2 = { x: fxZero, y: fxZero };

        // Get the barycentric pixel interpolants
        const A01 = p1.y - p0.y;
        const B01 = p0.x - p1.x;
        const A12 = p2.y - p1.y;
        const B12 = p1.x - p2.x;
        const A20 = p0.y - p2.y;
        const B20 = p2.x - p0.x;

        const pbounds: Bounds = {
            left: clamp(min3(p0.x, p1.x, p2.x), 0, dstWidth) + fxHalf,
            top: clamp(min3(p0.y, p1.y, p2.y), 0, dstHeight) + fxHalf,
            right: clamp(max3(p0.x, p1.x, p2.x), 0, dstWidth) + fxHalf,
            bottom: clamp(max3(p0.y, p1.y, p2.y), 0, dstHeight) + fxHalf,
        };
        const p: V2 = { x: pbounds.left, y: pbounds.top };

        let w0_row = edge(p1, p2, p);
        let w1_row = edge(p2, p0, p);
        let w2_row = edge(p0, p1, p);

        function shadeTexturedPixel(
            w0: number,
            w1: number,
            w2: number
        ): number {
            // Calculate uv coords from given barycentric coords.
            scaleToRef(v0.uv, w0, _uv0);
            scaleToRef(v1.uv, w1, _uv1);
            scaleToRef(v2.uv, w2, _uv2);
            add3ToRef(_uv0, _uv1, _uv2, _uv);
            divToRef(_uv, { x: area, y: area }, _uv);
            // Sample texture at uv coords, repeating the texture.
            let u = _uv.x % fxOne;
            let v = _uv.y % fxOne;
            //if (u < fxZero) u += fxOne
            //if (v < fxZero) v += fxOne
            //if (u === fxZero && _uv.x > 0) u = fxOne
            //if (v === fxZero && _uv.y > 0) v = fxOne
            const x = ops.toInt(ops.mul(u, texWidth));
            const y = ops.toInt(ops.mul(v, texHeight));
            return ImageMethods.getPixel(args.tex, x, y);
        }

        // This loop doesn't attempt to filter pixels outside the triangle, and this results in a lot of
        // extra evaluations. We should do some prefiltering.
        for (; p.y <= pbounds.bottom; p.y += fxOne) {
            let w0 = w0_row;
            let w1 = w1_row;
            let w2 = w2_row;
            for (p.x = pbounds.left; p.x <= pbounds.right; p.x += fxOne) {
                if (w0 >= 0 && w1 >= w1Fudge && w2 >= 0) {
                    const color = shadeTexturedPixel(w0, w1, w2);
                    if (color) {
                        ImageMethods.setPixel(
                            args.dst,
                            ops.toInt(p.x),
                            ops.toInt(p.y),
                            color
                        );
                    }
                }
                w0 += A12;
                w1 += A20;
                w2 += A01;
            }
            w0_row += B12;
            w1_row += B20;
            w2_row += B01;
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
