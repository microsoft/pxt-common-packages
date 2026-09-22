namespace PhysicsBodyKind {
    let nextKind: number;

    export function create(): number {
        if (nextKind === undefined) nextKind = 1;
        return nextKind++;
    }

    //% isKind
    export const Body = create();

    //% isKind
    export const Wall = create();

    //% isKind
    export const Projectile = create();
}

namespace box2dblocks {
    export const PIXELS_PER_METER = 10;
    export const STEP = 1 / 60;
    export const MAX_STEPS = 4;

    export enum ShapeType {
        Circle,
        Box,
        Polygon,
        Edge,
        Chain
    }

    export function metersToPixels(meters: number): number {
        return meters * PIXELS_PER_METER;
    }

    export function pixelsToMeters(pixels: number): number {
        return pixels / PIXELS_PER_METER;
    }

    export function pointX(state: box2d.BodySnapshot, localX: number, localY: number): number {
        return state.x + Math.cos(state.angle) * localX - Math.sin(state.angle) * localY;
    }

    export function pointY(state: box2d.BodySnapshot, localX: number, localY: number): number {
        return state.y + Math.sin(state.angle) * localX + Math.cos(state.angle) * localY;
    }

    //% shim=KIND_GET
    //% blockId=box2d_blocks_body_kind block="$kind"
    //% kindNamespace=PhysicsBodyKind kindMemberName=kind kindPromptHint="e.g. Player, Crate, Ground..."
    export function _bodyKind(kind: number): number {
        return kind;
    }
}