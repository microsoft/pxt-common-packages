namespace color {
    export enum ColorBufferLayout {
        /**
         * 24bit RGB color
         */
        RGB,
        /**
         * 32bit RGB color with alpha
         */
        ARGB
    }

    /**
     * A buffer of colors
     */
    export class ColorBuffer {
        layout: ColorBufferLayout;
        buf: Buffer;

        constructor(buf: Buffer, layout?: ColorBufferLayout) {
            this.buf = buf;
            this.layout = layout || ColorBufferLayout.RGB;
        }

        get stride() {
            return this.layout == ColorBufferLayout.RGB ? 3 : 4;
        }

        get length() {
            return (this.buf.length / this.stride) | 0;
        }

        color(index: number): number {
            index = index | 0;
            if (index < 0 || index >= this.length) return -1;

            const s = this.stride;
            const start = index * s;
            let c = 0;
            for (let i = 0; i < s; ++i)
                c = (c << 8) | (this.buf[start + i] & 0xff);
            return c;
        }

        setColor(index: number, color: number) {
            index = index | 0;
            if (index < 0 || index >= this.length) return;

            const s = this.stride;
            const start = index * s;
            for (let i = s - 1; i >= 0; --i) {
                this.buf[start + i] = color & 0xff;
                color = color >> 8;
            }
        }

        slice(start?: number, length?: number): ColorBuffer {
            const s = this.stride;
            return new ColorBuffer(this.buf.slice(start ? start * s : start, length ? length * s : length));
        }

        /**
         * Writes the content of the src color buffer starting at the start dstOffset in the current buffer
         * @param dstOffset 
         * @param src 
         */
        write(dstOffset: number, src: ColorBuffer): void {
            if (this.layout == src.layout) {
                const d = (dstOffset | 0) * this.stride;
                this.buf.write(d, src.buf);
            } else {
                // different color layout
                const n = Math.min(src.length, this.length - dstOffset);
                for (let i = 0; i < n; ++i)
                    this.setColor(dstOffset + i, src.color(i));
            }
        }
    }

    /**
     * Converts an array of colors into a color buffer
     */
    export function createBuffer(colors: number[], layout?: ColorBufferLayout): colors.ColorBuffer {
        const n = colors.length;
        layout = layout || ColorBufferLayout.RGB;
        const stride = layout == ColorBufferLayout.RGB ? 3 : 4;
        const buf = control.createBuffer(n * stride);
        const p = new ColorBuffer(buf);
        let k = 0;
        for (let i = 0; i < n; i++) {
            let color = colors[i];
            for (let j = stride - 1; j >= 0; --j) {
                this.buf[k + j] = color & 0xff;
                color = color >> 8;
            }
            k += stride;
        }
        return p;
    }
}