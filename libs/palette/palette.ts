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
     * @param start The index to start setting colors at
     * @param length The number of colors to copy
     * @param pOffset The offset to start copying from the palette
     */
    export function setColors(palette: colors.ColorBuffer, start = 0, length = 0, pOffset = 0) {
        const scene = game.currentScene();
        let userPalette = scene.data["__palette"] as colors.ColorBuffer;
        if (!userPalette)
            userPalette = scene.data["__palette"] = userPalette.slice();
        start = start | 0;
        length = length | 0;
        pOffset = pOffset | 0;
        if (!length) length = palette.length;

        const pal =  palette.buf.slice(start, length);
        userPalette.write(pOffset, pal);
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
