interface Fx8 {
    _dummyFx8: string;
}

function Fx8(v: number) {
    return ((v * 256) | 0) as any as Fx8
}

namespace Fx {
    export const zeroFx8 = 0 as any as Fx8
    export const oneFx8 = 1 as any as Fx8
    export const twoFx8 = 2 as any as Fx8

    export function neg(a: Fx8) {
        return (-(a as any as number)) as any as Fx8
    }
    export function add(a: Fx8, b: Fx8) {
        return ((a as any as number) + (b as any as number)) as any as Fx8
    }
    export function iadd(a: number, b: Fx8) {
        return ((a << 8) + (b as any as number)) as any as Fx8
    }
    export function sub(a: Fx8, b: Fx8) {
        return ((a as any as number) - (b as any as number)) as any as Fx8
    }
    export function mul(a: Fx8, b: Fx8) {
        return (Math.imul((a as any as number), (b as any as number)) >> 8) as any as Fx8
    }
    export function div(a: Fx8, b: Fx8) {
        return Math.idiv((a as any as number) << 8, b as any as number) as any as Fx8
    }
    export function idiv(a: Fx8, b: number) {
        return Math.idiv((a as any as number), b) as any as Fx8
    }
    export function compare(a: Fx8, b: Fx8) {
        return (a as any as number) - (b as any as number)
    }
    export function abs(a: Fx8) {
        if ((a as any as number) < 0)
            return (-(a as any as number)) as any as Fx8
        else
            return a
    }
    export function min(a: Fx8, b: Fx8) {
        if (a < b)
            return a
        else
            return b
    }
    export function max(a: Fx8, b: Fx8) {
        if (a > b)
            return a
        else
            return b
    }
    export function toInt(v: Fx8) {
        return ((v as any as number) + 128) >> 8
    }
    export function toFloat(v: Fx8) {
        return (v as any as number) / 256
    }
}