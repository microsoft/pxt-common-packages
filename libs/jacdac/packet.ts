namespace jacdac {
    export const JD_SERIAL_HEADER_SIZE = 16
    export const JD_SERIAL_MAX_PAYLOAD_SIZE = 236
    export const JD_SERVICE_NUMBER_MASK = 0x3f
    export const JD_SERVICE_NUMBER_INV_MASK = 0xc0
    export const JD_SERVICE_NUMBER_CRC_ACK = 0x3f
    export const JD_SERVICE_NUMBER_CTRL = 0x00

    // the COMMAND flag signifies that the device_identifier is the recipent
    // (i.e., it's a command for the peripheral); the bit clear means device_identifier is the source
    // (i.e., it's a report from peripheral or a broadcast message)
    export const JD_FRAME_FLAG_COMMAND = 0x01
    // an ACK should be issued with CRC of this package upon reception
    export const JD_FRAME_FLAG_ACK_REQUESTED = 0x02
    // the device_identifier contains target service class number
    export const JD_FRAME_FLAG_IDENTIFIER_IS_SERVICE_CLASS = 0x04

    const ACK_RETRIES = 3
    let ackAwaiters: AckAwaiter[]


    function error(msg: string) {
        throw msg
    }

    export class JDPacket {
        _header: Buffer;
        _data: Buffer;

        private constructor() { }

        static fromBinary(buf: Buffer) {
            const p = new JDPacket()
            p._header = buf.slice(0, JD_SERIAL_HEADER_SIZE)
            p._data = buf.slice(JD_SERIAL_HEADER_SIZE)
            return p
        }

        static from(service_command: number, data: Buffer) {
            const p = new JDPacket()
            p._header = Buffer.create(JD_SERIAL_HEADER_SIZE)
            p.data = data
            p.service_command = service_command
            return p
        }

        static onlyHeader(service_command: number) {
            return JDPacket.from(service_command, Buffer.create(0))
        }

        static packed(service_command: number, fmt: string, nums: number[]) {
            return JDPacket.from(service_command, Buffer.pack(fmt, nums))
        }

        get device_identifier() {
            // 8 is length!
            return this._header.slice(4, 8).toHex()
        }
        set device_identifier(id: string) {
            const idb = Buffer.fromHex(id)
            if (idb.length != 8)
                error("Invalid id")
            this._header.write(4, idb)
        }

        get packet_flags() { return this._header[3] }

        get multicommand_class() {
            if (this.packet_flags & JD_FRAME_FLAG_IDENTIFIER_IS_SERVICE_CLASS)
                return this._header.getNumber(NumberFormat.UInt32LE, 4)
            return undefined
        }

        get size(): number {
            return this._header[12];
        }

        get requires_ack(): boolean {
            return (this.packet_flags & JD_FRAME_FLAG_ACK_REQUESTED) ? true : false;
        }
        set requires_ack(ack: boolean) {
            if (ack != this.requires_ack)
                this._header[3] ^= JD_FRAME_FLAG_ACK_REQUESTED
        }

        get service_number(): number {
            return this._header[13] & JD_SERVICE_NUMBER_MASK;
        }
        set service_number(service_number: number) {
            if (service_number == null)
                throw "service_number not set"
            this._header[13] = (this._header[13] & JD_SERVICE_NUMBER_INV_MASK) | service_number;
        }

        get crc(): number {
            return this._header.getNumber(NumberFormat.UInt16LE, 0)
        }

        get service_command(): number {
            return this._header.getNumber(NumberFormat.UInt16LE, 14)
        }
        set service_command(cmd: number) {
            this._header.setNumber(NumberFormat.UInt16LE, 14, cmd)
        }

        get is_reg_set() {
            return (this.service_command >> 12) == (CMD_SET_REG >> 12)
        }

        get is_reg_get() {
            return (this.service_command >> 12) == (CMD_GET_REG >> 12)
        }

        get data(): Buffer {
            return this._data
        }

        set data(buf: Buffer) {
            if (buf.length > JD_SERIAL_MAX_PAYLOAD_SIZE)
                throw "Too big"
            this._header[12] = buf.length
            this._data = buf
        }

        get intData() {
            let fmt: NumberFormat
            switch (this._data.length) {
                case 0:
                case 1:
                    fmt = NumberFormat.Int8LE
                    break
                case 2:
                case 3:
                    fmt = NumberFormat.Int16LE
                    break
                default:
                    fmt = NumberFormat.Int32LE
                    break
            }
            return this._data.getNumber(fmt, 0)
        }

        compress(stripped: Buffer[]) {
            if (stripped.length == 0)
                return
            let sz = -4
            for (let s of stripped) {
                sz += s.length
            }
            const data = Buffer.create(sz)
            this._header.write(12, stripped[0])
            data.write(0, stripped[0].slice(4))
            sz = stripped[0].length - 4
            for (let s of stripped.slice(1)) {
                data.write(sz, s)
                sz += s.length
            }
            this._data = data
        }

        withFrameStripped() {
            return this._header.slice(12, 4).concat(this._data)
        }

        getNumber(fmt: NumberFormat, offset: number) {
            return this._data.getNumber(fmt, offset)
        }

        pack(fmt: string, nums: number[]) {
            this._data = Buffer.pack(fmt, nums)
        }

        get is_command() {
            return !!(this.packet_flags & JD_FRAME_FLAG_COMMAND)
        }

        toString(): string {
            let msg = `${this.device_identifier}/${this.service_number}[${this.packet_flags}]: ${this.service_command} sz=${this.size}`
            if (this.size < 20) msg += ": " + this.data.toHex()
            else msg += ": " + this.data.slice(0, 20).toHex() + "..."
            return msg
        }

        _sendCore() {
            jacdac.__physSendPacket(this._header, this._data)
        }

        _sendReport(dev: Device) {
            if (!dev)
                return
            this.device_identifier = dev.deviceId
            this._sendCore()
        }

        _sendCmd(dev: Device) {
            if (!dev)
                return
            this.device_identifier = dev.deviceId
            this._header[3] |= JD_FRAME_FLAG_COMMAND
            this._sendCore()
        }

        sendAsMultiCommand(service_class: number) {
            this._header[3] |= JD_FRAME_FLAG_IDENTIFIER_IS_SERVICE_CLASS | JD_FRAME_FLAG_COMMAND
            this._header.setNumber(NumberFormat.UInt32LE, 4, service_class)
            this._header.setNumber(NumberFormat.UInt32LE, 8, 0)
            this._sendCore()
        }

        // returns true when sent and recieved
        _sendWithAck(dev: Device) {
            if (!dev)
                return false
            this.requires_ack = true
            this._sendCmd(dev)

            if (!ackAwaiters) {
                ackAwaiters = []
                control.runInBackground(() => {
                    while (1) {
                        pause(Math.randomRange(20, 50))
                        checkAckAwaiters()
                    }
                })
            }

            const aw = new AckAwaiter(this, dev.deviceId)
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
            public srcId: string
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
                control.raiseEvent(DAL.DEVICE_ID_NOTIFY, a.eventId)
            } else {
                a.numTries++
                a.pkt._sendCore()
            }
        }
        ackAwaiters = ackAwaiters.filter(a => a.added > 0)
    }

    export function _gotAck(pkt: JDPacket) {
        if (!ackAwaiters)
            return
        let numNotify = 0
        const srcId = pkt.device_identifier
        const crc = pkt.service_command
        for (let a of ackAwaiters) {
            if (a.crc == crc && a.srcId == srcId) {
                a.added = 0
                control.raiseEvent(DAL.DEVICE_ID_NOTIFY, a.eventId)
                numNotify++
            }
        }
        if (numNotify)
            ackAwaiters = ackAwaiters.filter(a => a.added !== 0)
    }
}
