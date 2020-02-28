namespace jacdac {
    export class BroadcastClient extends Client {
        constructor(readonly parent: Broadcast) {
            super(parent.name, parent.serviceClass)
        }

        handlePacket(pkt: JDPacket) {
            this.parent.handlePacket(pkt)
        }
    }

    export class Broadcast extends Host {
        readonly client: BroadcastClient

        constructor(name: string, serviceClass: number, controlDataLength = 0) {
            super(name, serviceClass, controlDataLength)
            this.client = new BroadcastClient(this)
        }
    }


}