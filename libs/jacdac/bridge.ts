namespace jacdac {
    export class Bridge extends Driver {
        constructor(name: string) {
            super(name, 0, DAL.JD_DRIVER_CLASS_BRIDGE);
            this.supressLog = true; // too verbose
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            if(packet.deviceAddress == 0) // control packet
                return this.sniffControlPacket(new JDControlPacket(packet.data));
            else
               return this.sniffPacket(packet);
        }

        sniffPacket(packet: JDPacket): boolean {
            return true;
        }

        sniffControlPacket(packet: JDControlPacket): boolean {
            return true;
        } 

        start() {
            super.start();
            if (this._proxy) this._proxy.setBridge();
        }
    }
}