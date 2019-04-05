
namespace jacdac {

    class JACDACBus implements jacdac.JDPhysicalLayer {
        constructor() {
        }

        start()
        {
            __physStart();
            control.onEvent(__physId(), DAL.JD_SERIAL_EVT_DATA_READY, () => this.handlePacketData());
        }

        handlePacketData() {
            let buf: Buffer = undefined;
            while (buf = __physGetPacket()) {
                const pkt = new jacdac.JDPacket(buf);
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

    let jacdacStarted = false;
    export function start() : void
    {
        if (jacdacStarted)
            return;

        jacdacStarted = true;
        let bus = new JACDACBus();
        jacdac.JACDAC.instance.bus = bus
        jacdac.JACDAC.instance.start();
        bus.start();
    }
}