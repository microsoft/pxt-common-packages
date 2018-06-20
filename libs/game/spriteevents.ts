namespace sprites {
    /**
     * Gets the sprite type
     */
    //% blockHidden=1 shim=ENUM_GET
    //% blockId=spritetype block="$kind" enumInitialMembers="Player,Enemy"
    //% enumName=SpriteKind enumMemberName=kind enumPromptHint="e.g. Coin, Fireball, Asteroid..."
    export function _spriteType(kind: number): number {
        return kind;
    }

    /**
     * Register an event when a particular kind of sprite is created
     * @param kind
     * @param sprite
     */
    //% group="Lifecycle" draggableParameters
    //% blockId=spritesoncreated block="on created $sprite of kind $kind=spritetype"
    export function onCreated(kind: number, handler: (sprite: Sprite) => void): void {
        if (!handler || kind == undefined) return;

        const scene = game.currentScene();
        scene.createdHandlers.push({
            type: kind,
            handler: handler
        })
    }

    /**
     * Register an event when a particular kind of sprite is destroyed
     * @param kind
     * @param sprite
     */
    //% group="Lifecycle"
    //% weight=100 draggableParameters
    //% blockId=spritesondestroyed block="on destroyed $sprite of kind $kind=spritetype "
    export function onDestroyed(kind: number, handler: (sprite: Sprite) => void) {
        if (!handler || kind == undefined) return;

        const scene = game.currentScene();
        scene.destroyedHandlers.push({
            type: kind,
            handler: handler
        })
    }

    /**
     * Register code to run when sprites overlap
     */
    //% group="Overlaps"
    //% weight=100 draggableParameters
    //% blockId=spritesoverlap block="on $sprite of kind $kind=spritetype overlaps $otherSprite of kind $otherKind=spritetype"
    export function onOverlap(kind: number, otherKind: number, handler: (sprite: Sprite, otherSprite: Sprite) => void) {
        if (kind == undefined || otherKind == undefined ||!handler) return;

        const scene = game.currentScene();
        scene.overlapHandlers.push({
            type: kind,
            otherType: otherKind,
            handler: handler
        })
    }
}

namespace scene {
    /**
     * Register a code handler when a collision happens
     * @param direction
     * @param tile
     * @param handler
     */
    //% group="Collisions"
    //% weight=100 draggableParameters
    //% blockId=spritesollisions block="on $sprite of kind $kind=spritetype hits wall $tile=colorindexpicker"
    export function onHitTile(kind: number, tile: number, handler: (sprite: Sprite) => void) {
        if (kind == undefined || !handler) return;

        const scene = game.currentScene();
        scene.collisionHandlers.push({
            type: kind,
            tile: tile,
            handler: handler
        })
    }
}