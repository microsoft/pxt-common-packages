
namespace gpu {
    //% shim=gpu::_drawQuad
    declare function _drawQuad(dst: Image, tex: Image, args: number[]): void;

    let _drawQuadArgs: number[];

    /**
     * Copy the texture to the provided quadrilateral. Provided coordinates must be in clockwise order.
     */
    export function drawQuad(
        dst: Image,
        tex: Image,
        p0x: number,
        p0y: number,
        p1x: number,
        p1y: number,
        p2x: number,
        p2y: number,
        p3x: number,
        p3y: number) {
            _drawQuadArgs = _drawQuadArgs || [];
            _drawQuadArgs[0] = p0x;
            _drawQuadArgs[1] = p0y;
            _drawQuadArgs[2] = p1x;
            _drawQuadArgs[3] = p1y;
            _drawQuadArgs[4] = p2x;
            _drawQuadArgs[5] = p2y;
            _drawQuadArgs[6] = p3x;
            _drawQuadArgs[7] = p3y;
            _drawQuad(dst, tex, _drawQuadArgs);
    }
}
