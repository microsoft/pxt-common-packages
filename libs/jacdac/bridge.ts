namespace jacdac {
    export class Bridge extends Driver {
        constructor(name: string) {
            super(name, 0, DAL.JD_DRIVER_CLASS_BRIDGE);
            this.supressLog = true; // too verbose
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            if(packet.address == 0) // control packet
                return this.sniffControlPacket(new ControlPacket(packet.data));
            else
               return this.sniffPacket(packet);
        }

        sniffPacket(packet: JDPacket): boolean {
            return true;
        }

        sniffControlPacket(packet: ControlPacket): boolean {
            return true;
        } 

        start() {
            super.start();
            if (this._proxy) this._proxy.setBridge();
        }
    }
}