/**
 * Control the background, tiles and camera
 */
//% weight=88 color="#401255" icon="\uf1bb"
//% groups='["Screen", "Tiles", "Collisions", "Camera"]'
//% blockGap=8
namespace scene {
    /**
     * Get the width of the screen in pixels
     */
    //% blockId=scenescreenwidth block="screen width"
    //% group="Screen"
    //% weight=100 blockGap=8
    //% help=scene/screen-width
    export function screenWidth(): number {
        return screen.width;
    }

    /**
     * Gets the height of the screen in pixels
     */
    //% blockId=scenescreenheight block="screen height"
    //% group="Screen"
    //% weight=99
    //% help=scene/screen-width
    export function screenHeight(): number {
        return screen.height;
    }

    /**
     * Set the game background color
     * @param color
     */
    //% group="Screen"
    //% weight=25
    //% blockId=gamesetbackgroundcolor block="set background color to %color=colorindexpicker"
    //% help=scene/set-background-color
    export function setBackgroundColor(color: number) {
        const scene = game.currentScene();
        scene.background.color = color;
    }

    /**
     * Get the game background color
     * @param color
     */
    //% group="Screen"
    //% weight=22
    //% blockId=gamebackgroundcolor block="background color"
    //% help=scene/background-color
    export function backgroundColor() : number {
        const scene = game.currentScene();
        return scene.background.color;
    }

    /**
     * Set a picture as the background
     */
    //% group="Screen"
    //% weight=24
    //% blockId=gamesetbackgroundimage block="set background image to %img=background_image_picker"
    //% help=scene/set-background-image
    export function setBackgroundImage(img: Image) {
        const scene = game.currentScene();
        scene.background.image = img;
    }

    /**
     * Get the current background image
     */
    //% weight=22
    //% group="Screen"
    //% blockId=gamebackgroundimage block="background image"
    //% help=scene/background-image
    export function backgroundImage(): Image {
        const scene = game.currentScene();
        return scene.background.image;
    }

    /**
     * Adds a moving background layer
     * @param distance distance of the layer which determines how fast it moves, eg: 10
     * @param img
     */
    //% group="Screen"
    //% weight=10
    export function addBackgroundLayer(image: Image, distance?: number, alignment?: BackgroundAlignment) {
        const scene = game.currentScene();
        if (image)
            scene.background.addLayer(image, distance || 100, alignment || BackgroundAlignment.Bottom);
    }

    /**
     * Set the map for placing tiles in the scene
     * @param map
     */
    //% blockId=gamesettilemap block="set tile map to %map=tilemap_image_picker"
    //% group="Tiles"
    //% help=scene/set-tile-map
    export function setTileMap(map: Image) {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap();
        scene.tileMap.setMap(map);
    }

    /**
     * Set a tile at the given index
     * @param tile
     * @param index
     */
    //% blockId=gamesettileat block="set %tile=gamegettile to %index=colorindexpicker"
    //% group="Tiles"
    //% weight=30
    //% help=scene/set-tile-at
    export function setTileAt(tile: tiles.Tile, index: number) {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap();
        scene.tileMap.setTileAt(tile.x >> 4, tile.y >> 4, index);
    }

    /**
     * Set an image as a tile at the given index. Tiles should be a 16x16 image
     * @param index
     * @param img
     */
    //% blockId=gamesettile block="set tile %index=colorindexpicker to %img=screen_image_picker||with wall %wall=toggleOnOff"
    //% group="Tiles"
    //% help=scene/set-tile
    export function setTile(index: number, img: Image, wall?: boolean) {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap();
        scene.tileMap.setTile(index, img, !!wall);
    }

    /**
     * Get the tile at a position in the tile map
     * @param col
     * @param row
     */
    //% blockId=gamegettile block="tile col %col row %row"
    //% group="Tiles" blockSetVariable="myTile"
    //% help=scene/get-tile
    export function getTile(col: number, row: number): tiles.Tile {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap();
        return scene.tileMap.getTile(col, row);
    }

    /**
     * Get all tiles in the tile map with the given index.
     * @param index
     */
    //% blockId=gamegettilestype block="array of all %index=colorindexpicker tiles"
    //% group="Tiles" blockSetVariable="tile list"
    //% help=scene/get-tiles-by-type
    export function getTilesByType(index: number): tiles.Tile[] {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap();
        return scene.tileMap.getTilesByType(index);
    }

    /**
     * Center the given sprite on a tile that is the given color
     * @param sprite
     * @param color
     */
    //% blockId=gameplaceonrandomtile block="place %sprite=variables_get(mySprite) on top of random $color=colorindexpicker tile"
    //% blockNamespace="scene" group="Tiles"
    //% color.shadow=colorindexpicker
    //% help=scene/place-random
    export function placeOnRandomTile(mySprite: Sprite, color: number): void {
        const scene = game.currentScene();
        if (!mySprite || !scene.tileMap) return;
        const tiles = getTilesByType(color);
        if (tiles.length > 0)
            Math.pickRandom(tiles).place(mySprite);
    }

    /**
     * Set the game camera to follow a sprite
     * @param sprite
     */
    //% blockId=camerafollow block="camera follow sprite %sprite=variables_get(mySprite)"
    //% group="Camera"
    //% help=scene/camera-follow-sprite
    export function cameraFollowSprite(sprite: Sprite) {
        const scene = game.currentScene();
        scene.camera.sprite = sprite;
    }

    /**
     * Moves the camera center to a coordinate position
     * @param sprite
     */
    //% blockId=camerapos block="center camera at x %x y %y"
    //% group="Camera"
    //% help=scene/center-camera-at
    export function centerCameraAt(x: number, y: number) {
        const scene = game.currentScene();
        scene.camera.sprite = undefined;
        scene.camera.offsetX = x - (screen.width >> 1);
        scene.camera.offsetY = y - (screen.height >> 1);
    }
}
