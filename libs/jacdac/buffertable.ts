namespace jacdac {
    class BufferTableEntry {
        id: number;
        dirty: boolean;
        private _buffer: Buffer;

        constructor(id: number, buffer: Buffer) {
            this.id = id;
            this._buffer = buffer;
            this.dirty = false;
        }

        get buffer() {
            return this._buffer;
        }

        set buffer(value: Buffer) {
            if (value.length == 0) value = undefined; // normalize
            if (!bufferEqual(value, this._buffer)) {
                this._buffer = value;
                this.dirty = true;
            }
        }

        createPacket(): Buffer {
            const buf = control.createBuffer(4 + (!!this._buffer ? this._buffer.length : 0));
            buf.setNumber(NumberFormat.UInt32LE, 0, this.id);
            if (this._buffer)
                buf.write(4, this._buffer);
            this.dirty = false;
            return buf;
        }
    }

    export class BufferTableService extends Service {
        private entries: BufferTableEntry[];
        private _nextId: number;

        constructor() {
            super("table", jacdac.BUFFER_TABLE_CLASS);
            this.entries = [];
            this._nextId = 1;
        }

        nextId(): number {
            return this._nextId++;
        }

        update(id: number, buffer: Buffer) {
            let entry = this.entries.find(e => e.id == id);
            if (!entry)
                this.entries.push(entry = new BufferTableEntry(id, buffer));
            else entry.buffer = buffer;
        }

        delete(id: number) {
            let entry = this.entries.find(e => e.id == id);
            if (entry)
                entry.buffer = undefined;
        }

        sync() {
            for (let i = 0; i < this.entries.length; ++i) {
                const buf = this.entries[i].createPacket();
                this.sendPacket(buf);
            }
        }

        syncUpdates() {
            for (let i = 0; i < this.entries.length; ++i) {
                if (this.entries[i].dirty) {
                    const buf = this.entries[i].createPacket();
                    this.sendPacket(buf);
                }
            }
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            const id = data.getNumber(NumberFormat.UInt32BE, 0);
            const entry = this.entries.find(e => e.id == id);
            if (entry)
                this.sendPacket(entry.createPacket());
            return true;
        }
    }

    export class BufferTableClient extends Client {
        private entries: BufferTableEntry[];
        constructor() {
            super("table", jacdac.BUFFER_TABLE_CLASS);
        }

        get(id: number): Buffer {
            const entry = this.entries.find(e => e.id == id);
            if (!entry || entry.dirty)
                this.fetch(id);
            return entry && entry.buffer;
        }

        private fetch(id: number) {
            const buf = control.createBuffer(4);
            buf.setNumber(NumberFormat.UInt32LE, 0, id);
            this.sendPacket(buf);
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            const id = data.getNumber(NumberFormat.UInt32LE, 0);
            const entry = this.entries.find(e => e.id == id);
            entry.buffer = data.slice(4, data.length - 4);

            return true;
        }
    }
}