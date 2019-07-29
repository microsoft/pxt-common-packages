namespace sprites {
    /**
     * Gets the "kind" of sprite
     */
    //% shim=KIND_GET
    //% blockId=spritekind block="$kind"
    //% kindNamespace=SpriteKind kindMemberName=kind kindPromptHint="e.g. Coin, Fireball, Asteroid..."
    export function _spriteKind(kind: number): number {
        return kind;
    }

    /**
     * Gets the sprite type
     */
    //% blockHidden=1 shim=ENUM_GET deprecated=true
    //% blockId=spritetype block="$kind" enumInitialMembers="Player,Projectile,Food,Enemy"
    //% enumName=SpriteKindLegacy enumMemberName=kind enumPromptHint="e.g. Coin, Fireball, Asteroid..."
    export function _spriteType(kind: number): number {
        return kind;
    }
}

namespace SpriteKind {
    let nextKind: number;

    export function create() {
        if (nextKind === undefined) nextKind = 1000;
        return nextKind++;
    }

    //% isKind
    export const Player = create();

    //% isKind
    export const Projectile = 1;

    //% isKind
    export const Food = create();

    //% isKind
    export const Enemy = create();
}