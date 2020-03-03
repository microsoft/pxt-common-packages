namespace jacdac {
    export const JD_SERIAL_HEADER_SIZE = 16
    export const JD_SERIAL_MAX_PAYLOAD_SIZE = 236

    const ACK_RETRIES = 3
    let ackAwaiters: AckAwaiter[]


    function error(msg: string) {
        throw msg
    }

    export class JDPacket {
        _buffer: Buffer;

        constructor(buf?: Buffer) {
            if (buf) {
                if (buf.length < JD_SERIAL_HEADER_SIZE)
                    error("invalid buffer size")
                this._buffer = buf
            }
            else
                this._buffer = control.createBuffer(JD_SERIAL_MAX_PAYLOAD_SIZE + JD_SERIAL_HEADER_SIZE);
        }

        static from(service_command: number, service_argument: number, data: Buffer) {
            const p = new JDPacket()
            p.service_command = service_command
            p.service_argument = service_argument
            p.data = data
            return p
        }

        static onlyHeader(service_command: number, service_argument: number) {
            return JDPacket.from(service_command, service_argument, Buffer.create(0))
        }

        static packed(service_command: number, service_argument: number, fmt: string, nums: number[]) {
            return JDPacket.from(service_command, service_argument,
                Buffer.pack(fmt, nums))
        }

        get device_identifier() {
            // second 8 is length!
            return this._buffer.slice(8, 8).toHex()
        }
        set device_identifier(id: string) {
            const idb = control.createBufferFromHex(id)
            if (idb.length != 8)
                error("Invalid id")
            this._buffer.write(8, idb)
        }

        get multicommand_class() {
            if (this._buffer.getNumber(NumberFormat.Int32LE, 8) == 0)
                return this._buffer.getNumber(NumberFormat.UInt32LE, 12)
            return undefined
        }

        get size(): number {
            return this._buffer[2];
        }
        set size(size: number) {
            if (0 < size && size <= JD_SERIAL_MAX_PAYLOAD_SIZE)
                this._buffer[2] = size
            else
                error("invalid size")
        }

        get requires_ack(): boolean {
            return this._buffer[3] & 0x80 ? true : false;
        }
        set requires_ack(ack: boolean) {
            if (ack != this.requires_ack)
                this._buffer[3] ^= 0x80
        }

        get service_number(): number {
            return this._buffer[3] & 63;
        }
        set service_number(service_number: number) {
            this._buffer[3] = (this._buffer[3] & 0xc0) | service_number;
        }

        get crc(): number {
            return this._buffer.getNumber(NumberFormat.UInt16LE, 0)
        }

        get service_command(): number {
            return this._buffer.getNumber(NumberFormat.UInt16LE, 4)
        }
        set service_command(cmd: number) {
            this._buffer.setNumber(NumberFormat.UInt16LE, 4, cmd)
        }

        get service_argument(): number {
            return this._buffer.getNumber(NumberFormat.UInt16LE, 6)
        }
        set service_argument(arg: number) {
            this._buffer.setNumber(NumberFormat.UInt16LE, 6, arg)
        }

        get data(): Buffer {
            return this._buffer.slice(JD_SERIAL_HEADER_SIZE, this.size)
        }

        set data(buf: Buffer) {
            this.size = buf.length;
            this._buffer.write(JD_SERIAL_HEADER_SIZE, buf)
        }

        pack(fmt: string, nums: number[]) {
            this.size = Buffer.packedSize(fmt)
            this._buffer.packAt(JD_SERIAL_HEADER_SIZE, fmt, nums)
        }

        get is_command() {
            return !!(this.service_command & 0x8000)
        }

        toString(): string {
            return this._buffer.toHex();
        }

        _send(dev: Device) {
            if (!dev)
                return
            this.device_identifier = dev.deviceId
            jacdac.__physSendPacket(this._buffer)
        }

        sendAsMultiCommand(service_class: number) {
            this._buffer.setNumber(NumberFormat.UInt32LE, 8, 0)
            this._buffer.setNumber(NumberFormat.UInt32LE, 12, service_class)
            jacdac.__physSendPacket(this._buffer)
        }

        // returns true when sent and recieved
        _sendWithAck(dev: Device) {
            if (!dev)
                return false
            this.requires_ack = true
            this._send(dev)

            if (!ackAwaiters) {
                ackAwaiters = []
                control.runInBackground(() => {
                    while (1) {
                        pause(Math.randomRange(20, 50))
                        checkAckAwaiters()
                    }
                })
            }

            const aw = new AckAwaiter(this)
            ackAwaiters.push(aw)
            while (aw.added > 0)
                control.waitForEvent(DAL.DEVICE_ID_NOTIFY, aw.eventId)
            return aw.added == 0
        }
    }

    class AckAwaiter {
        added: number
        numTries = 1
        crc: number
        eventId: number
        constructor(
            public pkt: JDPacket,
        ) {
            this.crc = pkt.crc
            this.added = control.millis()
            this.eventId = control.allocateNotifyEvent()
        }
    }

    function checkAckAwaiters() {
        const now = control.millis()
        const retryTime = now - 30
        const toRetry = ackAwaiters.filter(a => a.added < retryTime)
        if (!toRetry.length)
            return
        for (let a of toRetry) {
            if (a.added == 0)
                continue // already got ack
            if (a.numTries >= ACK_RETRIES) {
                a.added = -1
            } else {
                a.numTries++
                jacdac.__physSendPacket(a.pkt._buffer)
            }
        }
        ackAwaiters = ackAwaiters.filter(a => a.added > 0)
    }

    export function _gotAckFor(crc: number) {
        if (!ackAwaiters)
            return
        let numNotify = 0
        for (let a of ackAwaiters) {
            if (a.crc == crc) {
                a.added = 0
                control.raiseEvent(DAL.DEVICE_ID_NOTIFY, a.eventId)
                numNotify++
            }
        }
        if (numNotify)
            ackAwaiters = ackAwaiters.filter(a => a.crc != crc)
    }
}
