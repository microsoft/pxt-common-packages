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
        return new color.ColorBuffer(defaultPaletteBuffer.slice());
    }

    /**
     * Dynamically set all or part of the game's current palette
     *
     * @param palette The colors to set
     * @param pOffset The offset to start copying from the palette
     */
    export function setColors(palette: color.ColorBuffer, pOffset = 0) {
        const scene = game.currentScene();
        let userPalette = scene.data["__palette"] as color.ColorBuffer;
        if (!userPalette)
            userPalette = scene.data["__palette"] = defaultPalette();
        userPalette.write(pOffset, palette);
        image.setPalette(userPalette.buf);
    }

    /**
     * Reset to default palette
     */
    export function reset() {
        const scene = game.currentScene();
        scene.data["__palette"] = undefined;
        image.setPalette(defaultPaletteBuffer);
    }
}
