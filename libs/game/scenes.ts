/**
 * Control the background, tiles and camera
 */

enum CameraProperty {
    //% block="x"
    X,
    //% block="y"
    Y,
    //% block="left"
    Left,
    //% block="right"
    Right,
    //% block="top"
    Top,
    //% block="bottom"
    Bottom
}

//% weight=88 color="#4b6584" icon="\uf1bb"
//% groups='["Screen", "Camera", "Effects", "Tilemaps", "Tilemap Operations", "Locations"]'
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
     * @param scale
     */
    export function setTileMapLevel(map: tiles.TileMapData) {
        const scene = game.currentScene();
        if (!scene.tileMap)
            scene.tileMap = new tiles.TileMap();
        scene.tileMap.setData(map);
    }

     /**
     * Shake the camera
     * @param sprite
     */
    //% blockId=camerashake block="camera shake by %amplitude pixels for %duration ms"
    //% amplitude.min=1 amplitude.max=8 amplitude.defl=4
    //% duration.shadow=timePicker duration.defl=500
    //% group="Camera"
    //% help=scene/camera-shake
    //% weight=90
    export function cameraShake(amplitude: number = 4, duration: number = 500) {
        const scene = game.currentScene();
        scene.camera.shake(amplitude, duration);
    }

    /**
     * Set the game camera to follow a sprite
     * @param sprite
     */
    //% blockId=camerafollow block="camera follow sprite %sprite=variables_get(mySprite)"
    //% group="Camera"
    //% help=scene/camera-follow-sprite
    //% weight=100
    export function cameraFollowSprite(sprite: Sprite) {
        const scene = game.currentScene();
        scene.camera.sprite = sprite;
        scene.camera.update();
    }

    /**
     * Moves the camera center to a coordinate position
     * @param sprite
     */
    //% blockId=camerapos block="center camera at x %x y %y"
    //% group="Camera"
    //% help=scene/center-camera-at
    //% weight=80
    export function centerCameraAt(x: number, y: number) {
        const scene = game.currentScene();
        scene.camera.sprite = undefined;
        scene.camera.offsetX = x - (screen.width >> 1);
        scene.camera.offsetY = y - (screen.height >> 1);
    }

    /**
     * Returns the x coordinate of the camera (the left of the screen)
     */
    //% blockId=cameraleft block="camera left"
    //% group="Camera"
    //% help=scene/camera-left
    //% deprecated=true
    export function cameraLeft() {
        const scene = game.currentScene();
        return scene.camera.drawOffsetX;
    }

    /**
     * Returns the y coordinate of the camera (the top of the screen)
     */
    //% blockId=cameratop block="camera top"
    //% group="Camera"
    //% help=scene/camera-top
    //% deprecated=true
    export function cameraTop() {
        const scene = game.currentScene();
        return scene.camera.drawOffsetY;
    }

    /**
     * Returns the specified camera property
     * @param property The property to get
     */
    //% blockId=cameraproperty block="camera $property"
    //% group="Camera"
    //% help=scene/camera-property
    //% weight=70
    export function cameraProperty(property: CameraProperty): number {
        const scene = game.currentScene();
        if (!scene.camera.isUpdated())
            scene.camera.update();
        switch (property) {
            case CameraProperty.X: return scene.camera.x;
            case CameraProperty.Y: return scene.camera.y;
            case CameraProperty.Left: return scene.camera.left;
            case CameraProperty.Right: return scene.camera.right;
            case CameraProperty.Top: return scene.camera.top;
            case CameraProperty.Bottom: return scene.camera.bottom;
        }
    }
}
