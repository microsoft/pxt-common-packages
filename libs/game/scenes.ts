/**
 * Control the background, tiles and camera
 */
//% weight=88 color="#401255" icon="\uf1bb"
//% groups='["Screen", "Tiles", "Camera"]'
//% blockGap=8
namespace scene {
    /**
     * Gets the width in pixel of the screen
     */
    //% blockId=scenescreenwidth block="screen width"
    //% group="Screen"
    //% weight=100 blockGap=8
    export function screenWidth(): number {
        return screen.width;
    }

    /**
     * Gets the height in pixel of the screen
     */
    //% blockId=scenescreenheight block="screen height"
    //% group="Screen"
    //% weight=99
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
    export function setBackgroundColor(color: number) {
        const scene = game.currentScene();
        scene.background.color = color;
    }

    /**
     * Sets the picture on the background
     */
    //% group="Screen"
    //% weight=24
    //% blockId=gamesetbackgroundimage block="set background image to %img=screen_image_picker"
    export function setBackgroundImage(img: Image) {
        const scene = game.currentScene();
        scene.background.image = img;
    }

    /**
     * Returns the background image
     */
    //% weight=23
    //% group="Screen"
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
    //% blockId=gamesettilemap block="set tile map to %map=screen_image_picker"
    //% group="Tiles"
    export function setTileMap(map: Image) {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap(scene.camera, 16, 16);
        scene.tileMap.setMap(map);
    }

    /**
     * Sets the tile image at the given index
     * @param index
     * @param img
     */
    //% blockId=gamesettile block="set tile %index=colorindexpicker to %img=screen_image_picker||with collisions %collisions=toggleOnOff"
    //% group="Tiles"
    export function setTile(index: number, img: Image, collisions?: boolean) {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap(scene.camera, img.width, img.height);
        scene.tileMap.setTile(index, img, !!collisions);
    }

    /**
     * The game camera follows a particular sprite
     * @param sprite 
     */
    //% blockId=camerafollow block="camera follow sprite %sprite=variables_get"
    //% group="Camera"
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
    export function centerCameraAt(x: number, y: number) {
        const scene = game.currentScene();
        scene.camera.sprite = undefined;
        scene.camera.offsetX = x;
        scene.camera.offsetY = y;
    }
}