/**
 * Update the current scene palette
 */
namespace palette {
    /**
     * A collection of colors
     */
    export class Palette {
        buf: Buffer;

        constructor(buf: Buffer) {
            this.buf = buf;
        }

        get length() {
            return this.buf.length / 3;
        }

        color(index: number) {
            index = index | 0;
            if (index < 0 || index >= this.length) return -1;

            const start = index * 3;
            return (this.buf[start] << 16)
                | (this.buf[start + 1] << 8)
                | this.buf[start + 2];
        }

        setColor(index: number, color: number) {
            index = index | 0;
            if (index < 0 || index >= this.length) return;

            const start = index * 3;
            this.buf[start] = (color >> 16) & 0xff;
            this.buf[start + 1] = (color >> 8) & 0xff;
            this.buf[start + 2] = color & 0xff;
        }

        clone(): Palette {
            return new Palette(this.buf.slice(0));
        }
    }

    /**
     * The default palette buffer for the project
     */
    //% whenUsed
    export const defaultPalette = new Palette(hex`__palette`);

    /**
     * Dynamically set all or part of the game's current palette
     *
     * @param palette The colors to set
     * @param start The index to start setting colors at
     * @param length The number of colors to copy
     * @param pOffset The offset to start copying from the palette
     */
    export function setColors(palette: Palette, start = 0, length = 0, pOffset = 0) {
        const scene = game.currentScene();
        let userPalette = scene.data["__palette"] as Palette;
        if (!userPalette)
            userPalette = scene.data["__palette"] = userPalette.clone();
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
    export function create(colors: number[]): Palette {
        const numColors = Math.min(colors.length, defaultPalette.length);
        const buf = control.createBuffer(numColors * 3);
        const p = new Palette(buf);

        if (colors && colors.length) {
            for (let i = 0; i < numColors; i++) {
                p.setColor(i, colors[i]);
            }
        }
        return p;
    }
}
