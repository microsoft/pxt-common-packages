namespace jacdac {
    /**
     * A driver that listens for message bus events
     */
    export class MessageBusDriver extends JacDacDriver {
        suppressForwarding = false;

        /**
         * Pipes matching events to JacDac bus
         * @param id 
         * @param value 
         */
        listen(id: number, value: number) {
            control.onEvent(id, value, () => {
                if (this.suppressForwarding) return;
                
                const event = control.createBuffer(4);
                event.setNumber(NumberFormat.UInt16LE, 0, id);
                event.setNumber(NumberFormat.UInt16LE, 2, value);
                jacdac.sendPacket(event, this.device.address);

            }, DAL.MESSAGE_BUS_LISTENER_IMMEDIATE)
        }

        public handlePacket(pkt: Buffer): boolean {
            const id = pkt.getNumber(NumberFormat.UInt16LE, 0);
            const value = pkt.getNumber(NumberFormat.UInt16LE, 2);
            this.suppressForwarding = true;
            control.raiseEvent(id, value);
            this.suppressForwarding = false;
            return true;
        }

        public handleControlPacket(pkt: Buffer): boolean {
            return true;
        }
    }
}