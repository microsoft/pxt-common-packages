namespace jacdac {
    export class JDPacket implements JDSerializable {
        _buffer: Buffer;

        constructor(buf?: Buffer) {
            if (buf) {
                if (buf.length != JD_SERIAL_HEADER_SIZE + JD_SERIAL_MAX_PAYLOAD_SIZE + 1)
                    jacdac.options.error("Buffer packet size mismatch. Buffer size: " + buf.length + " expected size: " + (JD_SERIAL_HEADER_SIZE + JD_SERIAL_MAX_PAYLOAD_SIZE + 1));

                this._buffer = buf
            }
            else
                this._buffer = jacdac.options.createBuffer(JD_SERIAL_MAX_PAYLOAD_SIZE + JD_SERIAL_HEADER_SIZE + 1);
        }

        get crc(): number {
            return this._buffer.getUint8(0) | ((this._buffer.getUint8(1) & 0x0f) << 8)
        }
        set crc(crc: number) {
            this._buffer.setUint8(0, crc & 0xff);
            this._buffer.setUint8(1, (this._buffer.getUint8(1) & 0xf0) | (crc & 0xF00) >> 8);
        }

        get device_address(): number {
            return this._buffer.getUint8(2);
        }
        set device_address(address: number) {
            this._buffer.setUint8(2, address & 0xff);
        }

        get size(): number {
            return this._buffer.getUint8(3);
        }
        set size(size: number) {
            this._buffer.setUint8(3, size & 0xFF);
        }

        get service_number(): number {
            return (this._buffer.getUint8(1) & 0xF0) >> 4;
        }
        set service_number(service_number: number) {
            this._buffer.setUint8(1, (this._buffer.getUint8(1) & 0x0F) | ((service_number & 0x0F) << 4));
        }

        get data(): Buffer {
            return this._buffer.slice(JD_SERIAL_HEADER_SIZE, this.size)
        }

        set data(buf: Buffer) {
            this.size = buf.length;

            for (let i = 0; i < buf.length; i++)
                this._buffer.setUint8(JD_SERIAL_HEADER_SIZE + i, buf.getUint8(i));
        }

        get communication_rate(): JDBaudRate {
            return this._buffer.getUint8(JD_SERIAL_HEADER_SIZE + JD_SERIAL_MAX_PAYLOAD_SIZE);
        }

        set communication_rate(communicate_rate: JDBaudRate) {
            this._buffer.setUint8(JD_SERIAL_HEADER_SIZE + JD_SERIAL_MAX_PAYLOAD_SIZE, communicate_rate);
        }

        getBuffer(): Buffer {
            return this._buffer;
        }

        toString(): string {
            return this._buffer.toHex();
        }
    }

    export class JDControlPacket implements JDSerializable {
        unique_device_identifier: Buffer;
        device_address: number;
        device_flags: number;
        _device_name: string;
        data: Buffer;

        constructor(p?: JDPacket) {
            this._device_name = "";
            if (p) {
                // jacdac.options.log("Making control packet from: a " + p.device_address + " sn " + p.service_number + " at " + JDBaudRate[p.communication_rate] + " with size " + p.size)
                const buf = p.data;

                this.unique_device_identifier = buf.slice(0, 8);

                let idx = 8;
                this.device_address = buf.getUint8(idx++);
                this.device_flags = buf.getUint8(idx++);

                if (this.device_flags & JD_DEVICE_FLAGS_HAS_NAME) {
                    let nameLen = buf.getUint8(idx++);
                    this._device_name = jacdac.options.utf8Decode(buf.slice(idx, nameLen));
                    idx += nameLen;

                    if (nameLen != this._device_name.length)
                        jacdac.options.error("Control packet name length mismatch. Expected: " + nameLen + " got: " + this.device_name.length);
                }

                this.data = buf.slice(idx, buf.length);
            }
            else
                this.data = jacdac.options.createBuffer(0);
        }

        getBuffer(): Buffer {

            let size = 0;

            if (this._device_name.length)
                size += this.device_name.length + 1;

            let buffer = jacdac.options.createBuffer(JD_CONTROL_PACKET_HEADER_SIZE + size + this.data.length);

            let idx = 0;
            while (idx < this.unique_device_identifier.length) {
                buffer.setUint8(idx, this.unique_device_identifier.getUint8(idx));
                idx++
            }

            buffer.setUint8(idx++, this.device_address & 0xff);
            buffer.setUint8(idx++, this.device_flags & 0xff);

            if (this.device_flags & JD_DEVICE_FLAGS_HAS_NAME) {
                buffer.setUint8(idx++, this._device_name.length);
                let encoded = jacdac.options.utf8Encode(this._device_name);
                for (let i = 0; i < this._device_name.length; i++)
                    buffer.setUint8(idx++, encoded.getUint8(i));
            }

            for (let i = 0; i < this.data.length; i++)
                buffer.setUint8(idx++, this.data.getUint8(i));

            return buffer;
        }

        get udidh() {
            return this.unique_device_identifier.getNumber(NumberFormat.UInt32LE, 4);
        }

        get udidl() {
            return this.unique_device_identifier.getNumber(NumberFormat.UInt32LE, 0);
        }

        get udid() {
            return this.unique_device_identifier;
        }

        get device_name(): string {
            if (this._device_name && this._device_name.length)
                return this._device_name;
            else
                return null;
        }

        set device_name(device_name: string) {
            if (device_name && device_name.length) {
                this.device_flags |= JD_DEVICE_FLAGS_HAS_NAME;
                this._device_name = device_name;
            }
        }

        append(buffer: Buffer) {
            let newBuf = jacdac.options.createBuffer(this.data.length + buffer.length);

            let idx = 0;
            for (let i = 0; i < this.data.length; i++)
                newBuf.setUint8(idx++, this.data.getUint8(i));

            for (let i = 0; i < buffer.length; i++)
                newBuf.setUint8(idx++, buffer.getUint8(i));

            this.data = newBuf;
        }
    }

    export class JDRequiredDevice {
        unique_device_identifier: Buffer;
        device_name: string;
        get udidh() {
            return this.unique_device_identifier && this.unique_device_identifier.getNumber(NumberFormat.UInt32LE, 4);
        }
        get udidl() {
            return this.unique_device_identifier && this.unique_device_identifier.getNumber(NumberFormat.UInt32LE, 0);
        }
    }

    export class JDDevice {
        unique_device_identifier: Buffer;
        device_address: number;
        device_flags: number;
        device_name: string;
        private _services: JDServiceInformation[];
        rolling_counter: number;
        broadcast_servicemap: Buffer;
        servicemap_bitmsk: number;
        communication_rate: JDBaudRate;

        constructor(cp?: JDControlPacket, communication_rate?: JDBaudRate) {
            this.broadcast_servicemap = jacdac.options.createBuffer(JD_DEVICE_MAX_HOST_SERVICES);
            this.servicemap_bitmsk = 0;

            if (cp) {
                this.communication_rate = communication_rate;
                this.update(cp);
            }
            else {
                this.unique_device_identifier = jacdac.options.createBuffer(0);
                this.device_address = 0;
                this.device_flags = 0;
                this._services = []
                this.rolling_counter = 0;
            }
        }

        get services(): JDServiceInformation[] {
            return this._services ? this._services.slice(0) : [];
        }

        update(cp: JDControlPacket): void {
            this.rolling_counter = 0;
            this._services = []
            this.unique_device_identifier = cp.unique_device_identifier;
            this.device_address = cp.device_address;
            this.device_name = cp.device_name;
            this.device_flags = cp.device_flags;

            let idx = 0;
            const buf = cp.data;

            while (idx < buf.length) {
                let service = new JDServiceInformation(buf.slice(idx, buf.length));
                idx += JD_SERVICE_INFO_HEADER_SIZE + service.advertisement_size;
                this._services.push(service);
            }
        }

        get udidh() {
            return this.unique_device_identifier.getNumber(NumberFormat.UInt32LE, 4);
        }

        get udidl() {
            return this.unique_device_identifier.getNumber(NumberFormat.UInt32LE, 0);
        }

        get udid() {
            return this.unique_device_identifier;
        }

        toString(): string {
            return `${this.udid.toHex()}:${this.device_address}:${this.device_name || "--"}`;
        }
    }

    export class JDServiceInformation implements JDSerializable {
        service_class: number;
        service_flags: number;
        advertisement_size: number;
        data: Buffer;

        constructor(buf?: Buffer) {
            if (buf) {
                let idx = 0;
                for (let i = 0; i < 4; i++)
                    this.service_class |= buf.getUint8(idx++) << (8 * i);

                this.service_flags = buf.getUint8(idx++);
                this.advertisement_size = buf.getUint8(idx++);

                if (this.advertisement_size)
                    this.data = buf.slice(idx, this.advertisement_size);
            }
            if (!this.data)
                this.data = jacdac.options.createBuffer(0);
        }

        getBuffer(): Buffer {

            let header = jacdac.options.createBuffer(JD_SERVICE_INFO_HEADER_SIZE + this.data.length);

            let idx = 0;

            for (idx; idx < 4; idx++)
                header.setUint8(idx, (this.service_class & (0xff << (idx * 8))) >> (idx * 8));

            header.setUint8(idx++, this.service_flags & 0xff);
            header.setUint8(idx++, this.advertisement_size & 0xff);

            for (let i = 0; i < this.data.length; i++)
                header.setUint8(idx++, this.data.getUint8(i));

            return header;
        }
    }

    export class JDConfigurationPacket implements JDSerializable {
        device_address: number;
        request_type: number;
        new_name: string;

        constructor(p?: JDPacket) {
            if (p) {
                const buf = p.data
                let idx = 0;
                this.device_address = buf.getUint8(idx++);
                this.request_type = buf.getUint8(idx++);

                if (p.size > JD_CONTROL_CONFIGURATION_SERVICE_PACKET_HEADER_SIZE) {
                    let nameLen = buf.getUint8(idx++);
                    this.new_name = jacdac.options.utf8Decode(buf.slice(idx, nameLen));
                }
            } else {
                this.device_address = 0;
                this.request_type = -1;
                this.new_name = "";
            }
        }

        getBuffer(): Buffer {

            let size = JD_CONTROL_CONFIGURATION_SERVICE_PACKET_HEADER_SIZE;

            if (this.new_name.length)
                size += this.new_name.length + 1;

            let header = jacdac.options.createBuffer(size);

            let idx = 0;
            header.setUint8(idx++, this.device_address & 0xff);
            header.setUint8(idx++, this.request_type & 0xff);

            if (this.new_name.length) {
                header.setUint8(idx++, this.new_name.length);

                let encoded = jacdac.options.utf8Encode(this.new_name)

                for (let i = 0; i < encoded.length; i++)
                    header.setUint8(idx++, encoded.getUint8(i));
            }

            return header;
        }
    }

    export class JDConsolePacket implements JDSerializable {
        priority: number;
        packetType: JDConsolePacketType;
        message: string;

        constructor(p?: JDPacket) {
            if (p) {

                const buf = p.data
                let idx = 0;
                this.priority = buf.getUint8(idx++);
                this.packetType = buf.getUint8(idx++);

                let end = idx;
                while (end < buf.length) {
                    if (buf.getUint8(end) == 0)
                        break;
                    end++
                }
                this.message = jacdac.options.utf8Decode(buf.slice(idx, end - idx));
            } else {
                this.priority = -1;
                this.packetType = JDConsolePacketType.Message;
                this.message = "";
            }
        }


        getBuffer(): Buffer {
            if (this.message.length == 0)
                jacdac.options.error("Console message length cannot be 0");

            const encoded = jacdac.options.utf8Encode(this.message)
            const size = JD_CONSOLE_SERVICE_PACKET_HEADER_SIZE
                + 2 /* packet type, priority */
                + encoded.length /* utf8 encoded string */;
            const header = jacdac.options.createBuffer(size);

            let idx = 0;
            header.setUint8(idx++, this.packetType & 0xff);
            header.setUint8(idx++, this.priority & 0xff);


            header.write(idx, encoded);
            idx += encoded.length;
            if (idx < header.length)
                header.setUint8(idx++, 0); // null terminator

            return header;
        }
    }
}