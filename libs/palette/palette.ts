/**
 * Update the current scene palette
 */
namespace palette {
    /**
     * The default palette buffer for the project
     */
    //% whenUsed
    const defaultPaletteBuffer = hex`__palette`

    /**
     * Returns a clone of the default palette
     */
    export function defaultPalette(): color.ColorBuffer {
        return color.ColorBuffer.fromBuffer(defaultPaletteBuffer.slice(), color.ColorBufferLayout.RGB);
    }

    const FIELD = "__palette";
    /**
     * Dynamically set all or part of the game's current palette
     *
     * @param palette The colors to set
     * @param pOffset The offset to start copying from the palette
     */
    export function setColors(palette: color.ColorBuffer, pOffset = 0) {
        const userPalette = getCurrentColors();
        userPalette.write(pOffset, palette);
        image.setPalette(userPalette.buf);

        // make sure to clean up
        game.addScenePushHandler(scenePush);
        game.addScenePopHandler(scenePop);
    }

    /**
     * Get the palette that is currently being used
     */
    export function getCurrentColors() {
        const scene = game.currentScene();
        let userPalette = scene.data[FIELD] as color.ColorBuffer;
        if (!userPalette)
            userPalette = scene.data[FIELD] = defaultPalette();
        return userPalette;
    }

    function scenePush(scene: scene.Scene) {
        if (scene.data[FIELD]) {
            const userPalette = scene.data[FIELD] as color.ColorBuffer;
            image.setPalette(userPalette.buf);
        }
    }

    function scenePop(scene: scene.Scene) {
        if (scene.data[FIELD]) {
            scene.data[FIELD] = undefined;
            image.setPalette(defaultPaletteBuffer);
        }
    }

    /**
     * Reset to default palette
     */
    export function reset() {
        const scene = game.currentScene();
        scene.data[FIELD] = undefined;
        image.setPalette(defaultPaletteBuffer);
    }
}
