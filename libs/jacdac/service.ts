namespace jacdac {
    export class BroadcastClient extends Client {
        // workaround for https://github.com/microsoft/pxt-arcade/issues/1831
        constructor(public readonly parent: Broadcast) {
            super(parent.name, parent.serviceClass, null)
            this.broadcast = true
        }

        handlePacket(pkt: JDPacket) {
            this.parent.handlePacket(pkt)
        }
    }

    export class Broadcast extends Host {
        readonly client: BroadcastClient

        constructor(name: string, serviceClass: number) {
            super(name, serviceClass)
            this.client = new BroadcastClient(this)
        }

        handlePacketOuter(pkt: JDPacket) {
            // do nothing; we're not expecting any packets addressed directly to us
        }
    }


}