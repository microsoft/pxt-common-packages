namespace jacdac {
    /**
     * A driver that listens for message bus events
     */
    export class Logger extends JacDacDriver {
        constructor() {
            // how do we extend classes from typescript?
            super(DriverType.VirtualDriver, 20);
        }
        
        public log(str: string) {
            if (!this.device.isConnected)
                return;

            let txLength = Math.min(str.length(), 32)
            
            const debug = control.createBuffer(txLength)

            // we need to add code that handles multi packet debug...
            for (var i = 0; i < txLength; i++)
            {
                debug.setNumber(NumberFormat.UInt8LE, i, Number(str.charAt(i)));
            }

            jacdac.sendPacket(debug, this.device.driverAddress);
        }
    }

    export class OutLogger extends JacDacDriver {

        functionPointer: (str:string)=>{}

        constructor(fp: (str: string)=>{}) {
            super(DriverType.HostDriver, 20);
            this.functionPointer = fp;
        }

        public handlePacket(pkt: Buffer): boolean {      
            const packet = new JDPacket(pkt);
            let packetSize = packet.size

            var str = ""
            for (var i = 0; i < packetSize; i++)
                str += packet.data.getNumber(NumberFormat.UInt8LE, i);

            this.functionPointer(str);

            return true;
        }
    }
}