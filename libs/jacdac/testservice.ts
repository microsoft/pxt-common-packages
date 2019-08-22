namespace jacdac {
    class TestPacket implements jacdac.JDSerializable {
        _test_name: string;
        data: Buffer;

        constructor(p?: jacdac.JDPacket) {
            this._test_name = "";

            if (p) {
                const len = p.data.getNumber(jacdac.NumberFormat.UInt8LE,0);
                this._test_name = jacdac.options.utf8Decode(p.data.slice(1,len));
            }
        }

        getBuffer(): jacdac.Buffer {
            let idx = 0;
            let nameIdx = 0;
            let buffer = jacdac.options.createBuffer(this._test_name.length + 1);
            const nameBuf = jacdac.options.utf8Encode(this._test_name);

            buffer.setUint8(idx++, this._test_name.length);
            while (nameIdx < this._test_name.length)
                buffer.setUint8(idx++, nameBuf.getUint8(nameIdx++));

            return buffer;
        }

        get test_name(): string {
            return this._test_name;
        }

        set test_name(test_name: string) {
            this._test_name = test_name;
        }
    }

    export class TestService extends jacdac.JDService {

        name:string;
        onPacketReceived: (pkt: jacdac.JDPacket) => void;

        constructor(serviceMode:jacdac.JDServiceMode, name: string) {
            super(jacdac.JDServiceClass.CONTROL_TEST, serviceMode);
            this.name = name
        }

        sendTestPacket(size?: number) {
            let tp = new TestPacket();
            tp.test_name = this.name;
            jacdac.options.log("sending");
            jacdac.options.log(tp.getBuffer().toHex())
            let tpBuff = tp.getBuffer();
            let bufToSend = tpBuff;

            if (size) {
                let testBuf = Buffer.createBufferFromUint8(new Uint8Array(size).fill(0x12));
                bufToSend = tpBuff.concat(testBuf);
            }

            this.send(bufToSend);
        }

        handlePacket(pkt: jacdac.JDPacket) : number{
            if (this.onPacketReceived)
                this.onPacketReceived(pkt);
            return 0;
        }
    }
}