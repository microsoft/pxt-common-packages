//% blockGap=8
namespace scene {
    /**
     *  Package for color-coded tilemap blocks, to support existing curriculum.
     */

    /**
     * Set the map for placing tiles in the scene
     * @param map
     * @param scale
     */
    //% blockId=gamesettilemap block="set tile map to %map=tilemap_image_picker || with %scale pixel tiles"
    //% scale.defl=TileScale.Sixteen
    //% group="Color-coded Tilemap"
    //% help=scene/set-tile-map
    export function setTileMap(map: Image, scale = TileScale.Sixteen) {
        const scene = game.currentScene();
        if (!scene.tileMap) {
            scene.tileMap = new tiles.TileMap();
            scene.tileMap._legacyInit();
        }
        scene.tileMap.setMap(map);
        scene.tileMap.scale = scale;
    }

    /**
     * Set an image as a tile at the given index. Tiles should be a 16x16 image
     * @param index
     * @param img
     */
    //% blockId=gamesettile block="set tile %index=colorindexpicker to %img=tile_image_picker with wall %wall=toggleOnOff"
    //% group="Color-coded Tilemap"
    //% help=scene/set-tile
    export function setTile(index: number, img: Image, wall?: boolean) {
        const scene = game.currentScene();
        if (!scene.tileMap) {
            scene.tileMap = new tiles.TileMap();
            scene.tileMap._legacyInit();
        }
        scene.tileMap.setTile(index, img, !!wall);
    }

    /**
     * Get the tile at a position in the tile map
     * @param col
     * @param row
     */
    //% blockId=gamegettile block="tile col %col row %row"
    //% group="Color-coded Tilemap" blockSetVariable="myTile"
    //% help=scene/get-tile
    export function getTile(col: number, row: number): tiles.Tile {
        const scene = game.currentScene();
        if (!scene.tileMap) {
            scene.tileMap = new tiles.TileMap();
            scene.tileMap._legacyInit();
        }
        return scene.tileMap._getTile(col, row);
    }

    /**
     * Get all tiles in the tile map with the given index.
     * @param index
     */
    //% blockId=gamegettilestype block="array of all %index=colorindexpicker tiles"
    //% group="Color-coded Tilemap" blockSetVariable="tile list"
    //% help=scene/get-tiles-by-type
    export function getTilesByType(index: number): tiles.Tile[] {
        const scene = game.currentScene();
        if (!scene.tileMap) {
            scene.tileMap = new tiles.TileMap();
            scene.tileMap._legacyInit();
        }
        return scene.tileMap._getTilesByType(index);
    }

    /**
     * Center the given sprite on a random tile that is the given color
     * @param sprite
     * @param color
     */
    //% blockId=gameplaceonrandomtile block="place %sprite=variables_get(mySprite) on top of random $color tile"
    //% group="Color-coded Tilemap"
    //% color.shadow="colorindexpicker"
    //% help=scene/place-on-random-tile
    export function placeOnRandomTile(sprite: Sprite, color: number): void {
        if (!sprite || !game.currentScene().tileMap) return;
        const tiles = getTilesByType(color);
        if (tiles.length > 0)
            Math.pickRandom(tiles).place(sprite);
    }

    /**
     * Set a tile at the given index
     * @param tile
     * @param index
     */
    //% blockId=gamesettileat block="set %tile=gamegettile to %index=colorindexpicker"
    //% group="Color-coded Tilemap"
    //% help=scene/set-tile-at
    export function setTileAt(tile: tiles.Tile, index: number) {
        const scene = game.currentScene();
        if (!scene.tileMap) {
            scene.tileMap = new tiles.TileMap();
            scene.tileMap._legacyInit();
        }
        const scale = scene.tileMap.scale;
        scene.tileMap.setTileAt(tile.x >> scale, tile.y >> scale, index);
        scene.tileMap.setWallAt(tile.x >> scale, tile.y >> scale, scene.tileMap.data._isWall(index));
    }

    /**
     * Center the given sprite on this tile
     * @param sprite
     */
    //% blockId=legacyplaceontile block="on top of %tile=variables_get(myTile) place %sprite=variables_get(mySprite)"
    //% group="Color-coded Tilemap"
    //% help=tiles/place
    export function place(tile: tiles.Tile, mySprite: Sprite): void {
        if (!tile) return;
        tile.place(mySprite);
    }

    /**
     * Run code when a certain kind of sprite hits a tile
     * @param direction
     * @param tile
     * @param handler
     */
    //% group="Color-coded Tilemap"
    //% draggableParameters="reporter"
    //% blockId=spritesollisions block="on $sprite of kind $kind=spritekind hits wall $tile=colorindexpicker"
    //% help=scene/on-hit-tile
    export function onHitTile(kind: number, tile: number, handler: (sprite: Sprite) => void) {
        if (kind == undefined || tile < 0 || tile > 0xF || !handler) return;

        const collisionHandlers = game.currentScene().collisionHandlers;
        if (!collisionHandlers[tile]) {
            collisionHandlers[tile] = [];
        }

        collisionHandlers[tile].push(
            new scene.SpriteHandler(
                kind,
                handler
            )
        );
    }

    /**
     * Get the obstacle sprite in a given direction if any
     * @param direction
     */
    //% blockId=legacyspriteobstacle block="%sprite=variables_get(mySprite) wall hit on %direction"
    //% group="Color-coded Tilemap"
    //% help=sprites/sprite/tile-hit-from
    export function tileHitFrom(sprite: Sprite, direction: CollisionDirection): number {
        if (!sprite) return 0;
        return sprite.tileHitFrom(direction);
    }
}
