namespace helpers {
    //% shim=ShaderMethods::_mapImage
    function _mapImage(toShade: Image, shadeLevels: Image, xy: number, m: Buffer): void { }

    export function mapImage(toShade: Image, shadeLevels: Image, x: number, y: number, m: Buffer) {
        _mapImage(toShade, shadeLevels, pack(x, y), m);
    }

    //% shim=ShaderMethods::_mergeImage
    function _mergeImage(dst: Image, src: Image, xy: number): void { }

    export function mergeImage(dst: Image, src: Image, x: number, y: number) {
        _mergeImage(dst, src, pack(x, y));
    }

    function pack(x: number, y: number) {
        return (Math.clamp(-30000, 30000, x | 0) & 0xffff) | (Math.clamp(-30000, 30000, y | 0) << 16)
    }
}