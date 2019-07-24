/**
 * Update the current scene palette
 */
namespace palette {
    /**
     * The default palette buffer for the project
     */
    //% whenUsed
    export const defaultPalette = new colors.ColorBuffer(hex`__palette`);

    /**
     * Dynamically set all or part of the game's current palette
     *
     * @param palette The colors to set
     * @param pOffset The offset to start copying from the palette
     */
    export function setColors(palette: colors.ColorBuffer, pOffset = 0) {
        const scene = game.currentScene();
        let userPalette = scene.data["__palette"] as colors.ColorBuffer;
        if (!userPalette)
            userPalette = scene.data["__palette"] = defaultPalette.slice();
        userPalette.write(pOffset, palette);
        image.setPalette(userPalette.buf);
    }

    /**
     * Reset to default palette
     */
    export function reset() {
        const scene = game.currentScene();
        scene.data["__palette"] = undefined;
        image.setPalette(defaultPalette.buf);
    }

    /**
     * Converts an array of colors into a palette buffer
     */
    export function create(colors: number[]): colors.ColorBuffer {
        const p = colors.createBuffer(colors);
        return p.slice(0, defaultPalette.length);
    }
}
