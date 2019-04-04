namespace jacdac {

    class MakeCodeOptions implements JDOptions {
        utf8Decode(buf: Buffer): string {
            return buf.toString();
        }
        utf8Encode(str: string): Buffer {
            return control.createBufferFromUTF8(str);
        }
        createBuffer(size: number): Buffer {
            return control.createBuffer(size);
        }
        error(message: string) {
            console.add(ConsolePriority.Error, message);
        }
        log(message: string) {
            console.add(ConsolePriority.Log, message);
        }

        private sn: Buffer;
        getSerialNumber(): Buffer {
            if (!this.sn) {
                this.sn = control.createBuffer(8);
                this.sn.setNumber(NumberFormat.UInt32LE, 0, control.deviceSerialNumber())
            }
            return this.sn;
        }
    }

    export let options: JDOptions = new MakeCodeOptions();

    class JACDACBus implements JDPhysicalLayer {
        constructor() {
            control.onEvent(__physId(), DAL.JD_SERIAL_EVT_DATA_READY, () => this.handlePacketData());
        }

        handlePacketData() {
            let buf: Buffer = undefined;
            while (buf = __physGetPacket()) {
                const pkt = new JDPacket(buf);
                jacdac.JACDAC.instance.routePacket(pkt)
            }
        }

        writeBuffer(b: Buffer) {
            __physSendPacket(b);
        }

        isConnected() {
            return __physIsConnected()
        }
    }

    jacdac.JACDAC.instance.bus = new JACDACBus();
}