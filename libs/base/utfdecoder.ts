class UTF8Decoder {
    private buf: Buffer;

    constructor() {
        this.buf = undefined;
    }

    add(buf: Buffer) {
        if (!buf || !buf.length) return;

        if (!this.buf)
            this.buf = buf;
        else {
            const b = control.createBuffer(this.buf.length + buf.length);
            b.write(0, this.buf);
            b.write(this.buf.length, buf);
            this.buf = b;
        }
    }

    decodeUntil(delimiter: number): string {
        if (!this.buf) return undefined;
        delimiter = delimiter | 0;
        let i = 0;
        for (; i < this.buf.length; ++i) {
            const c = this.buf[i];
            // skip multi-chars
            if ((c & 0xe0) == 0xc0)
                i += 1;
            else if ((c & 0xf0) == 0xe0)
                i += 2;
            else if (c == delimiter) {
                // found it
                break;
            }
        }

        if (i >= this.buf.length)
            return undefined;
        else {
            const s = this.buf.slice(0, i).toString();
            if (i + 1 == this.buf.length)
                this.buf = undefined;
            else
                this.buf = this.buf.slice(i + 1);
            return s;
        }
    }

    decode(): string {
        if (!this.buf) return "";

        // scan the end of the buffer for partial characters
        let length = 0;
        for (let i = this.buf.length - 1; i >= 0; i--) {
            const c = this.buf[i];
            if ((c & 0x80) == 0) {
                length = i + 1;
                break;
            }
            else if ((c & 0xe0) == 0xc0) {
                length = i + 2;
                break;
            }
            else if ((c & 0xf0) == 0xe0) {
                length = i + 3;
                break;
            }
        }
        // is last beyond the end?
        if (length == this.buf.length) {
            const s = this.buf.toString();
            this.buf = undefined;
            return s;
        } else if (length == 0) { // data yet
            return "";
        } else {
            const s = this.buf.slice(0, length).toString();
            this.buf = this.buf.slice(length);
            return s;
        }
    }
}