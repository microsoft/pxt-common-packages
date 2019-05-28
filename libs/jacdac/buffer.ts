namespace jacdac {
    export enum NumberFormat {
        Int8LE = 1,
        UInt8LE,
        Int16LE,
        UInt16LE,
        Int32LE,
        Int8BE,
        UInt8BE,
        Int16BE,
        UInt16BE,
        Int32BE,
        UInt32LE,
        UInt32BE,
        Float32LE,
        Float64LE,
        Float32BE,
        Float64BE,
    };

    const INT_MIN = -0x80000000;

    export class Buffer {

        private buffer: Uint8Array;

        private fmtInfoCore(fmt: NumberFormat) {
            switch (fmt) {
                case NumberFormat.Int8LE: return -1;
                case NumberFormat.UInt8LE: return 1;
                case NumberFormat.Int16LE: return -2;
                case NumberFormat.UInt16LE: return 2;
                case NumberFormat.Int32LE: return -4;
                case NumberFormat.UInt32LE: return 4;
                case NumberFormat.Int8BE: return -10;
                case NumberFormat.UInt8BE: return 10;
                case NumberFormat.Int16BE: return -20;
                case NumberFormat.UInt16BE: return 20;
                case NumberFormat.Int32BE: return -40;
                case NumberFormat.UInt32BE: return 40;

                case NumberFormat.Float32LE: return 4;
                case NumberFormat.Float32BE: return 40;
                case NumberFormat.Float64LE: return 8;
                case NumberFormat.Float64BE: return 80;
                default: jacdac.options.error("bad format");
            }
        }

        private fmtInfo(fmt: NumberFormat) {
            let size = this.fmtInfoCore(fmt)
            let signed = false
            if (size < 0) {
                signed = true
                size = -size
            }
            let swap = false
            if (size >= 10) {
                swap = true
                size /= 10
            }
            let isFloat = fmt >= NumberFormat.Float32LE
            return { size, signed, swap, isFloat }
        }

        constructor(size?:number)
        {
            if (size)
                this.buffer = new Uint8Array(size);
            else
                this.buffer = new Uint8Array(0);
        }

        get length() : number
        {
            return this.buffer.length;
        }

        static createBufferFromHex(hex: string) : Buffer {
            let r = new Buffer((hex.length >> 1))
            for (let i = 0; i < hex.length; i += 2)
                r.buffer[i >> 1] = parseInt(hex.slice(i, i + 2), 16)
            return r
        }

        static createBufferFromUint8(buf: Uint8Array) : Buffer {
            let r = new Buffer()
            r.buffer = buf;
            return r
        }


        getNumber(fmt: NumberFormat, offset: number) {
            let inf = this.fmtInfo(fmt)
            if (inf.isFloat) {
                let subarray = this.buffer.buffer.slice(offset, offset + inf.size)
                if (inf.swap) {
                    let u8 = new Uint8Array(subarray)
                    u8.reverse()
                }
                if (inf.size == 4) return new Float32Array(subarray)[0]
                else return new Float64Array(subarray)[0]
            }

            let r = 0
            for (let i = 0; i < inf.size; ++i) {
                r <<= 8
                let off = inf.swap ? offset + i : offset + inf.size - i - 1
                r |= this.buffer[off]
            }
            if (inf.signed) {
                let missingBits = 32 - (inf.size * 8)
                r = (r << missingBits) >> missingBits;
            } else {
                r = r >>> 0;
            }
            return r
        }

        setNumber(fmt: NumberFormat, offset: number, r: number) {
            let inf = this.fmtInfo(fmt)
            if (inf.isFloat) {
                let arr = new Uint8Array(inf.size)
                if (inf.size == 4)
                    new Float32Array(arr.buffer)[0] = r
                else
                    new Float64Array(arr.buffer)[0] = r
                if (inf.swap)
                    arr.reverse()
                for (let i = 0; i < inf.size; ++i) {
                    this.buffer[offset + i] = arr[i]
                }
                return
            }

            for (let i = 0; i < inf.size; ++i) {
                let off = !inf.swap ? offset + i : offset + inf.size - i - 1
                this.buffer[off] = (r & 0xff)
                r >>= 8
            }
        }

        inRange(off: number) {
            return 0 <= off && off < this.buffer.length
        }

        getUint8(off: number) {
            if (this.inRange(off)) return this.buffer[off]
            else return 0;
        }

        setUint8(off: number, v: number) {
            if (this.inRange(off)) this.buffer[off] = v
        }

        toUint8() : Uint8Array
        {
            return this.buffer;
        }

        fill(value: number, offset: number = 0, length: number = -1) {
            if (offset < 0 || offset > this.buffer.length)
                return;
            if (length < 0)
                length = this.buffer.length;
            length = Math.min(length, this.buffer.length - offset);

            this.buffer.fill(value, offset, offset + length)
        }

        slice(offset: number, length: number) {
            offset = Math.min(this.buffer.length, offset);
            if (length < 0)
                length = this.buffer.length;
            length = Math.min(length, this.buffer.length - offset);

            let r = new Buffer;
            r.buffer = this.buffer.slice(offset, offset + length);
            return r;
        }

        toHex(): string {
            const hex = "0123456789abcdef";
            let res = "";
            for (let i = 0; i < this.buffer.length; ++i) {
                res += hex[this.buffer[i] >> 4];
                res += hex[this.buffer[i] & 0xf];
            }
            return res;
        }

        toString(): string {
            return jacdac.options.utf8Decode(this);
        }

        static memmove(dst: Uint8Array, dstOff: number, src: Uint8Array, srcOff: number, len: number) {
            if (src.buffer === dst.buffer) {
                Buffer.memmove(dst, dstOff, src.slice(srcOff, srcOff + len), 0, len);
            } else {
                for (let i = 0; i < len; ++i)
                    dst[dstOff + i] = src[srcOff + i];
            }
        }

        shift(offset: number, start: number, len: number) {
            if (len < 0) len = this.buffer.length - start;
            if (start < 0 || start + len > this.buffer.length || start + len < start
                || len == 0 || offset == 0 || offset == INT_MIN) return;
            if (len == 0 || offset == 0 || offset == INT_MIN) return;
            if (offset <= -len || offset >= len) {
                this.fill(0);
                return;
            }

            if (offset < 0) {
                offset = -offset;
                Buffer.memmove(this.buffer, start + offset, this.buffer, start, len - offset);
                this.buffer.fill(0, start, start + offset)
            } else {
                len = len - offset;
                Buffer.memmove(this.buffer, start, this.buffer, start + offset, len);
                this.buffer.fill(0, start + len, start + len + offset)
            }
        }

        rotate(offset: number, start: number, len: number) {
            if (len < 0) len = this.buffer.length - start;

            if (start < 0 || start + len > this.buffer.length || start + len < start
                || len == 0 || offset == 0 || offset == INT_MIN) return;

            if (offset < 0)
                offset += len << 8; // try to make it positive
            offset %= len;
            if (offset < 0)
                offset += len;

            let data = this.buffer
            let n_first = offset
            let first = 0
            let next = n_first
            let last = len

            while (first != next) {
                let tmp = data[first + start]
                data[first++ + start] = data[next + start]
                data[next++ + start] = tmp
                if (next == last) {
                    next = n_first;
                } else if (first == n_first) {
                    n_first = next;
                }
            }
        }

        write(dstOffset: number, src: Buffer, srcOffset = 0, length = -1) {
            if (length < 0)
                length = src.buffer.length;

            if (srcOffset < 0 || dstOffset < 0 || dstOffset > this.buffer.length)
                return;

            length = Math.min(src.buffer.length - srcOffset, this.buffer.length - dstOffset);

            if (length < 0)
                return;

            Buffer.memmove(this.buffer, dstOffset, src.buffer, srcOffset, length)
        }
    }
}