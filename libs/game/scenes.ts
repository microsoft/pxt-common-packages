/**
 * Control the background, tiles and camera
 */
//% weight=88 color="#401255" icon="\uf1bb"
//% groups='["Screen", "Tiles", "Collisions", "Camera"]'
//% blockGap=8
namespace scene {
    /**
     * Gets the width in pixel of the screen
     */
    //% blockId=scenescreenwidth block="screen width"
    //% group="Screen"
    //% weight=100 blockGap=8
    //% help=scene/screen-width
    export function screenWidth(): number {
        return screen.width;
    }

    /**
     * Gets the height in pixel of the screen
     */
    //% blockId=scenescreenheight block="screen height"
    //% group="Screen"
    //% weight=99
    //% help=scene/screen-width
    export function screenHeight(): number {
        return screen.height;
    }

    /**
     * Sets the game background color
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
     * Sets the game background color
     * @param color
     */
    //% group="Screen"
    //% weight=22
    //% blockId=gamebackgroundcolor block="background color"
    //% help=scene/get-background-color
    export function backgroundColor() : number {
        const scene = game.currentScene();
        return scene.background.color;
    }

    /**
     * Sets the picture on the background
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
     * Returns the background image
     */
    //% weight=22
    //% group="Screen"
    //% blockId=gamebackgroundimage block="background image"
    //% help=scene/get-background-image
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
     * Sets the map for rendering tiles
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
     * Set the given tile to be of the given index
     * @param col
     * @param row
     * @param index
     */
    //% blockId=gamesettileat block="set tile at col %col row %row to %index=colorindexpicker"
    //% group="Tiles"
    //% weight=30
    //% help=scene/set-tile-at
    export function setTileAt(col: number, row: number, index: number) {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap();
        scene.tileMap.setTileAt(col, row, index);
    }

    /**
     * Sets the tile image at the given index. Tiles should be 16x16 images
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
     * Gets the tile at the given column and row in current tile map
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
     * Gets all tiles of the given index.
     * @param index
     */
    //% blockId=gamegettilestype block="array of all %index=colorindexpicker tiles"
    //% group="Tiles" blockSetVariable="list"
    //% help=scene/get-tiles-by-type
    export function getTilesByType(index: number): tiles.Tile[] {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap();
        return scene.tileMap.getTilesByType(index);
    }

    /**
     * The game camera follows a particular sprite
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
     * Moves the camera center to a given coordinate
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