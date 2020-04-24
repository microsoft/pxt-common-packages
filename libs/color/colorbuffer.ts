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

        constructor(length: number, layout?: ColorBufferLayout) {
            this.layout = layout || ColorBufferLayout.RGB;
            this.buf = control.createBuffer((length | 0) * this.stride);
        }

        static fromBuffer(buffer: Buffer, layout: ColorBufferLayout) {
            const b = new ColorBuffer(0, layout);
            b.buf = buffer.slice();
            return b;
        }

        get stride() {
            return this.layout == ColorBufferLayout.RGB ? 3 : 4;
        }

        get length() {
            return Math.idiv(this.buf.length, this.stride);
        }

        color(index: number): number {
            index = index | 0;
            if (index < 0 || index >= this.length)
                return -1;

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
            start = start | 0;
            if (start < 0)
                start = this.length - start;

            if (length == undefined)
                length = this.length;
            length = Math.min(length, this.length - start);

            const output = new ColorBuffer(length, this.layout);
            for (let i = 0; i < length; ++i) {
                output.setColor(i, this.color(start + i));
            }

            return output;
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
    export function createBuffer(colors: number[], layout?: ColorBufferLayout): color.ColorBuffer {
        const p = new ColorBuffer(colors.length, layout);
        const n = colors.length;
        for (let i = 0; i < n; i++) {
            p.setColor(i, colors[i]);
        }
        return p;
    }
}