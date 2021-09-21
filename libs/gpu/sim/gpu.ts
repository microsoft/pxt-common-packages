
namespace pxsim.gpu {
    type V2 = { x: number; y: number; };
    type Vertex = { pos: V2, uv: V2 };
    type Bounds = { left: number; top: number; right: number; bottom: number; };

    type DrawTriArgs = {
        verts: Vertex[],
        indices: number[],
        dst: RefImage,
        tex: RefImage
    };

    function edge(a: V2, b: V2, c: V2): number {
        return (b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y);
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
        ref.x = v.x * s;
        ref.y = v.y * s;
        return ref;
    }
    function add3ToRef(a: V2, b: V2, c: V2, ref: V2): V2 {
        ref.x = a.x + b.x + c.x;
        ref.y = a.y + b.y + c.y;
        return ref;
    }
    function divToRef(a: V2, b: V2, ref: V2): V2 {
        ref.x = a.x / b.x;
        ref.y = a.y / b.y;
        return ref;
    }

    function drawQuad(dst: RefImage, tex: RefImage, args: RefCollection) {
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

        const V0: Vertex = {
            pos: { x: args.getAt(0) | 0, y: args.getAt(1) | 0 },
            uv: { x: 0, y: 0 }
        };
        const V1: Vertex = {
            pos: { x: args.getAt(2) | 0, y: args.getAt(3) | 0 },
            uv: { x: 1, y: 0 }
        };
        const V2: Vertex = {
            pos: { x: args.getAt(4) | 0, y: args.getAt(5) | 0 },
            uv: { x: 1, y: 1 }
        }
        const V3: Vertex = {
            pos: { x: args.getAt(6) | 0, y: args.getAt(7) | 0 },
            uv: { x: 0, y: 1 }
        };
        const verts = [V0, V1, V2, V3];

        drawTri({ verts, indices: TRI0_INDICES, dst, tex });
        drawTri({ verts, indices: TRI1_INDICES, dst, tex });
    }

    function drawTri(args: DrawTriArgs): void {
        const v0 = args.verts[args.indices[0]];
        const v1 = args.verts[args.indices[1]];
        const v2 = args.verts[args.indices[2]];
        const p0 = v0.pos;
        const p1 = v1.pos;
        const p2 = v2.pos;

        const area = edge(v0.pos, v1.pos, v2.pos);
        if (area <= 0) return;

        // Temp vars
        const _uv0: V2 = { x: 0, y: 0 };
        const _uv1: V2 = { x: 0, y: 0 };
        const _uv2: V2 = { x: 0, y: 0 };
        const _uv: V2 = { x: 0, y: 0 };

        function shade(w0: number, w1: number, w2: number): number {
            // Calculate uv coords from given barycentric coords.
            // TODO: Support different texture wrapping modes.
            scaleToRef(v0.uv, w0, _uv0);
            scaleToRef(v1.uv, w1, _uv1);
            scaleToRef(v2.uv, w2, _uv2);
            add3ToRef(_uv0, _uv1, _uv2, _uv);
            divToRef(_uv, { x: area, y: area }, _uv);
            // Sample texture at uv coords.
            const x = Math.floor(_uv.x * args.tex._width);
            const y = Math.floor(_uv.y * args.tex._height);
            return ImageMethods.getPixel(args.tex, x, y);
        }

        // Get clipped bounds of tri. 0.5 offset to ensure we're sampling pixel center.
        const bounds: Bounds = {
            left: 0.5 + clamp(min3(v0.pos.x, v1.pos.x, v2.pos.x), 0, args.dst._width),
            top: 0.5 + clamp(min3(v0.pos.y, v1.pos.y, v2.pos.y), 0, args.dst._height),
            right: 0.5 + clamp(max3(v0.pos.x, v1.pos.x, v2.pos.x), 0, args.dst._width),
            bottom: 0.5 + clamp(max3(v0.pos.y, v1.pos.y, v2.pos.y), 0, args.dst._height),
        };
        const p: V2 = { x: bounds.left, y: bounds.top };

        // Get the barycentric gradients
        const A01 = p1.y - p0.y;
        const B01 = p0.x - p1.x;
        const A12 = p2.y - p1.y;
        const B12 = p1.x - p2.x;
        const A20 = p0.y - p2.y;
        const B20 = p2.x - p0.x;

        let w0_row = edge(p1, p2, p);
        let w1_row = edge(p2, p0, p);
        let w2_row = edge(p0, p1, p);

        // TODO: This is a simplistic implementation that doesn't attempt to filter pixels outside the triangle.
        // We should do some prefiltering. This can be done using a tiled rendering approach for larger triangles.
        for (; p.y <= bounds.bottom; ++p.y) {
            let w0 = w0_row;
            let w1 = w1_row;
            let w2 = w2_row;
            for (p.x = bounds.left; p.x <= bounds.right; ++p.x) {
                if ((w0 | w1 | w2) >= 0) {
                    const color = shade(w0, w1, w2);
                    if (color) {
                        ImageMethods.setPixel(args.dst, p.x, p.y, color);
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

    export function _drawQuad(dst: RefImage, tex: RefImage, args: RefCollection) {
        drawQuad(dst, tex, args);
    }
}
