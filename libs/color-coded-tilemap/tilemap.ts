//% blockGap=8
namespace scene {
    /**
     *  LEGACY: package for old tilemap blocks, to support existing curriculum.
     */

    /**
     * Set the map for placing tiles in the scene
     * @param map
     * @param scale
     */
    //% blockId=legacysettilemap block="set tile map to %map=tilemap_image_picker || with %scale pixel tiles"
    //% scale.defl=TileScale.Sixteen
    //% group="Color-coded Tilemap"
    //% help=scene/set-tile-map
    export function _setTileMap(map: Image, scale = TileScale.Sixteen) {
        scene.setTileMap(map, scale);
    }

    /**
     * Set an image as a tile at the given index. Tiles should be a 16x16 image
     * @param index
     * @param img
     */
    //% blockId=legacysettile block="set tile %index=colorindexpicker to %img=tile_image_picker with wall %wall=toggleOnOff"
    //% group="Color-coded Tilemap"
    //% help=scene/set-tile
    export function _setTile(index: number, img: Image, wall?: boolean) {
        scene.setTile(index, img, wall);
    }

    /**
     * Get the tile at a position in the tile map
     * @param col
     * @param row
     */
    //% blockId=legacygettile block="tile col %col row %row"
    //% group="Color-coded Tilemap" blockSetVariable="myTile"
    //% help=scene/get-tile
    export function _getTile(col: number, row: number): tiles.Tile {
        return scene.getTile(col, row);
    }

    /**
     * Get all tiles in the tile map with the given index.
     * @param index
     */
    //% blockId=legacygettilestype block="array of all %index=colorindexpicker tiles"
    //% group="Color-coded Tilemap" blockSetVariable="tile list"
    //% help=scene/get-tiles-by-type
    export function _getTilesByType(index: number): tiles.Tile[] {
        return scene.getTilesByType(index);
    }

    /**
     * Center the given sprite on a random tile that is the given color
     * @param sprite
     * @param color
     */
    //% blockId=legacyplaceonrandomtile block="place %sprite=variables_get(mySprite) on top of random $color tile"
    //% group="Color-coded Tilemap"
    //% color.shadow="colorindexpicker"
    //% help=scene/place-on-random-tile
    export function _placeOnRandomTile(sprite: Sprite, color: number): void {
        scene.placeOnRandomTile(sprite, color);
    }
    
    /**
     * Set a tile at the given index
     * @param tile
     * @param index
     */
    //% blockId=legacysettileat block="set %tile=gamegettile to %index=colorindexpicker"
    //% group="Color-coded Tilemap"
    //% help=scene/set-tile-at
    export function _setTileAt(tile: tiles.Tile, index: number) {
        scene.setTileAt(tile, index);
    }

    /**
     * Center the given sprite on this tile
     * @param sprite
     */
    //% blockId=legacyplaceontile block="on top of %tile=variables_get(myTile) place %sprite=variables_get(mySprite)"
    //% group="Color-coded Tilemap"
    //% help=tiles/place
    export function _place(tile: tiles.Tile, mySprite: Sprite): void {
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
    //% blockId=legacyspritesollisions block="on $sprite of kind $kind=spritekind hits wall $tile=colorindexpicker"
    //% help=scene/on-hit-tile
    export function _onHitTile(kind: number, tile: number, handler: (sprite: Sprite) => void) {
        scene.onHitTile(kind, tile, handler);
    }

    /**
     * Get the obstacle sprite in a given direction if any
     * @param direction
     */
    //% blockId=legacyspriteobstacle block="%sprite=variables_get(mySprite) wall hit on %direction"
    //% group="Color-coded Tilemap"
    //% help=sprites/sprite/tile-hit-from
    export function _tileHitFrom(sprite: Sprite, direction: CollisionDirection): number {
        if (!sprite) return 0;
        return sprite.tileHitFrom(direction);
    }
}
