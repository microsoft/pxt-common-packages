namespace sprites {
    /**
     * Gets the sprite type
     */
    //% blockHidden=1 shim=ENUM_GET
    //% blockId=spritetype block="$kind" enumInitialMembers="Player,Projectile,Food,Enemy"
    //% enumName=SpriteKind enumMemberName=kind enumPromptHint="e.g. Coin, Fireball, Asteroid..."
    export function _spriteType(kind: number): number {
        return kind;
    }

    /**
     * Run code when a certain kind of sprite is created
     * @param kind
     * @param sprite
     */
    //% group="Lifecycle" draggableParameters="reporter" weight=97
    //% blockId=spritesoncreated block="on created $sprite of kind $kind=spritetype"
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
    //% blockId=spritesondestroyed block="on destroyed $sprite of kind $kind=spritetype "
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
     * Run code on each sprite of the given kind on an interval of time
     * Runs after game.onUpdate()
     * @param kind the kind of sprites to apply the code to
     * @param interval how often to run the code
     * @param handler the code to run
     */
    //% group="Lifecycle"
    //% weight=98 afterOnStart=true draggableParameters="reporter"
    //% blockId=updateintervalbyKind block="on update %kind=spritetype sprites every %interval=timePicker ms"
    //% blockAllowMultiple=1
    export function updateByKind(kind: number, interval: number, handler: (sprite: Sprite) => void) {
        if (!handler || interval < 0) return;
        let timer = 0;
        game.eventContext().registerFrameHandler(21, () => {
            const time = game.currentScene().millis();
            if (timer <= time) {
                timer = time + interval;
                sprites.allOfKind(kind).forEach(handler);
            }
        });
    }

    /**
     * Run code when two kinds of sprites overlap
     */
    //% group="Overlaps"
    //% weight=100 draggableParameters="reporter"
    //% blockId=spritesoverlap block="on $sprite of kind $kind=spritetype overlaps $otherSprite of kind $otherKind=spritetype"
    //% help=sprites/on-overlap
    //% blockGap=8
    export function onOverlap(kind: number, otherKind: number, handler: (sprite: Sprite, otherSprite: Sprite) => void) {
        if (kind == undefined || otherKind == undefined || !handler) return;

        const scene = game.currentScene();
        scene.overlapHandlers.push({
            kind: kind,
            otherKind: otherKind,
            handler: handler
        })
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
    //% blockId=spritesollisions block="on $sprite of kind $kind=spritetype hits wall $tile=colorindexpicker"
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