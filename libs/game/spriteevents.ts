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

        const sc = game.currentScene();
        sc.createdHandlers.push(
            new scene.SpriteHandler(
                kind,
                handler
            )
        )
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

        const sc = game.currentScene();
        sc.destroyedHandlers.push(
            new scene.SpriteHandler(
                kind,
                handler
            )
        );
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
        const sc = game.currentScene();
        const overlapHandlers = sc.overlapHandlers;
        const overlapMap = sc.overlapMap;

        function associate(a: number, b: number) {
            if (!overlapMap[a]) {
                overlapMap[a] = [];
            }

            overlapMap[a].push(b);
        }

        associate(kind, otherKind);
        associate(otherKind, kind);

        overlapHandlers.push(
            new scene.OverlapHandler(
                kind,
                otherKind,
                handler
            )
        );
    }
}

namespace scene {
    /**
     * Run code when a certain kind of sprite overlaps a tile
     * @param kind
     * @param tile
     * @param handler
     */
    //% group="Tiles"
    //% weight=100 draggableParameters="reporter" blockGap=8
    //% blockId=spriteshittile block="on $sprite of kind $kind=spritekind overlaps $tile at $location"
    //% tile.shadow=tileset_tile_picker
    //% help=tiles/on-overlap-tile
    export function onOverlapTile(kind: number, tile: Image, handler: (sprite: Sprite, location: tiles.Location) => void) {
        if (kind == undefined || !tile || !handler) return;

        const tileOverlapHandlers = game.currentScene().tileOverlapHandlers;
        tileOverlapHandlers.push(
            new scene.TileOverlapHandler(
                kind,
                tile,
                handler
            )
        );
    }

    /**
     * Run code when a certain kind of sprite hits a wall
     * @param kind
     * @param handler
     */
    //% group="Tiles"
    //% weight=120 draggableParameters="reporter" blockGap=8
    //% blockId=spriteshitwall block="on $sprite of kind $kind=spritekind hits wall"
    //% help=tiles/on-hit-wall
    export function onHitWall(kind: number, handler: (sprite: Sprite) => void) {
        if (kind == undefined || !handler) return;

        const wallCollisionHandlers = game.currentScene().wallCollisionHandlers;
        wallCollisionHandlers.push(
            new scene.SpriteHandler(
                kind,
                handler
            )
        );
    }
}