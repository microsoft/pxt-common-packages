
namespace gpu {
    //% shim=gpu::_drawTexturedQuad
    declare function _drawTexturedQuad(dst: Image, tex: Image, args: number[]): void;

    let _drawQuadArgs: number[];

    /**
     * Copy the texture to the provided quadrilateral. Provided coordinates must be in clockwise order.
     */
    export function drawTexturedQuad(
        dst: Image,
        tex: Image,
        // Note these are Fx8 values
        p0x: number,
        p0y: number,
        p0u: number,
        p0v: number,
        p1x: number,
        p1y: number,
        p1u: number,
        p1v: number,
        p2x: number,
        p2y: number,
        p2u: number,
        p2v: number,
        p3x: number,
        p3y: number,
        p3u: number,
        p3v: number,
        ) {
            _drawQuadArgs = _drawQuadArgs || [];
            _drawQuadArgs[0] = p0x;
            _drawQuadArgs[1] = p0y;
            _drawQuadArgs[2] = p0u;
            _drawQuadArgs[3] = p0v;
            _drawQuadArgs[4] = p1x;
            _drawQuadArgs[5] = p1y;
            _drawQuadArgs[6] = p1u;
            _drawQuadArgs[7] = p1v;
            _drawQuadArgs[8] = p2x;
            _drawQuadArgs[9] = p2y;
            _drawQuadArgs[10] = p2u;
            _drawQuadArgs[11] = p2v;
            _drawQuadArgs[12] = p3x;
            _drawQuadArgs[13] = p3y;
            _drawQuadArgs[14] = p3u;
            _drawQuadArgs[15] = p3v;
            _drawTexturedQuad(dst, tex, _drawQuadArgs);
    }
}
