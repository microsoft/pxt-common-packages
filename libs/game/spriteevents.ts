namespace sprites {
    /**
     * Run code when a certain kind of sprite is created
     * @param kind
     * @param sprite
     */
    //% group="Lifecycle" draggableParameters="reporter" weight=97
    //% blockId=spritesoncreated block="on created $sprite of kind $kind=spritekind"
    //% help=sprites/on-created
    export function onCreated(kind: number, handler: (sprite: Sprite) => void): void {
        if (!handler || kind == undefined) return;

        const scene = game.currentScene();
        scene.createdHandlers.push({
            kind: kind,
            handler: handler
        })
    }

    /**
     * Run code when a certain kind of sprite is destroyed
     * @param kind
     * @param sprite
     */
    //% group="Lifecycle"
    //% weight=96 draggableParameters="reporter"
    //% blockId=spritesondestroyed block="on destroyed $sprite of kind $kind=spritekind "
    //% help=sprites/on-destroyed
    export function onDestroyed(kind: number, handler: (sprite: Sprite) => void) {
        if (!handler || kind == undefined) return;

        const scene = game.currentScene();
        scene.destroyedHandlers.push({
            kind: kind,
            handler: handler
        })
    }

    /**
     * Run code when two kinds of sprites overlap
     */
    //% group="Overlaps"
    //% weight=100 draggableParameters="reporter"
    //% blockId=spritesoverlap block="on $sprite of kind $kind=spritekind overlaps $otherSprite of kind $otherKind=spritekind"
    //% help=sprites/on-overlap
    //% blockGap=8
    export function onOverlap(kind: number, otherKind: number, handler: (sprite: Sprite, otherSprite: Sprite) => void) {
        if (kind == undefined || otherKind == undefined || !handler) return;

        const overlapHandlers = game.currentScene().overlapHandlers;

        overlapHandlers[kind].push({
            otherKind: otherKind,
            handler: handler
        });
    }
}

namespace scene {
    /**
     * Run code when a certain kind of sprite hits a tile
     * @param direction
     * @param tile
     * @param handler
     */
    //% group="Collisions"
    //% weight=100 draggableParameters="reporter"
    //% blockId=spritesollisions block="on $sprite of kind $kind=spritekind hits wall $tile=colorindexpicker"
    //% help=scene/on-hit-tile
    export function onHitTile(kind: number, tile: number, handler: (sprite: Sprite) => void) {
        if (kind == undefined || !handler) return;

        const scene = game.currentScene();
        scene.collisionHandlers.push({
            kind: kind,
            tile: tile,
            handler: handler
        })
    }
}