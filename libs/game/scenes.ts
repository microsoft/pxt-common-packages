/**
 * Control the background, tiles and camera
 */
//% weight=94 color="#401255" icon="\uf1bb"
//% groups='["Background", "Tiles", "Camera"]'
namespace scene {
    /**
     * Sets the game background color
     * @param color
     */
    //% group="Background"
    //% weight=25
    //% blockId=gamesetbackgroundcolor block="set background color %color=colorindexpicker"
    export function setBackgroundColor(color: number) {
        const scene = game.currentScene();
        scene.background.color = color;
    }

    /**
     * Adds a moving background layer
     * @param distance distance of the layer which determines how fast it moves, eg: 10
     * @param img
     */
    //% group="Background"
    //% weight=10
    //% blockId=gameaddbackgroundimage block="add background image %image=screen_image_picker||distance %distance|aligned %alignment"
    export function addBackgroundImage(image: Image, distance?: number, alignment?: BackgroundAlignment) {
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
    //% blockId=gamesettile block="set tile color %index=colorindexpicker to %img=screen_image_picker||with collisions %collisions=toggleOnOff"
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
    //% blockId=camerafollow block="camera follow %sprite=variables_get"
    //% group="Camera"
    export function cameraFollowSprite(sprite: Sprite) {
        const scene = game.currentScene();
        scene.camera.sprite = sprite;
    }    
}