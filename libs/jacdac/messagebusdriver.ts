namespace jacdac {
    /**
     * A driver that listens for message bus events
     */
    export class MessageBusDriver extends JacDacDriver {
        suppressForwarding: boolean;

        constructor() {
            super(DriverType.BroadcastDriver, DAL.JD_DRIVER_CLASS_MESSAGE_BUS);
            this.suppressForwarding = false;
        }

        /**
         * Pipes matching events to JacDac bus
         * @param id 
         * @param value 
         */
        listenEvent(id: number, value: number) {
            control.dmesg(`jd> msgbus> listen event ${id} ${value}`)        
            control.onEvent(id, value, () => {
                if (this.suppressForwarding) return;

                const event = control.createBuffer(4);
                event.setNumber(NumberFormat.UInt16LE, 0, id);
                event.setNumber(NumberFormat.UInt16LE, 2, value);
                jacdac.sendPacket(event, this.device.driverAddress);

            }, DAL.MESSAGE_BUS_LISTENER_IMMEDIATE)
        }

        public handlePacket(pkt: Buffer): boolean {
            control.dmesg(`jd> msgbus> packet`)        
            const packet = new JDPacket(pkt);
            const id = packet.getNumber(NumberFormat.UInt16LE, 0);
            const value = packet.getNumber(NumberFormat.UInt16LE, 2);
            this.suppressForwarding = true;
            control.raiseEvent(id, value);
            this.suppressForwarding = false;
            return true;
        }

        public handleControlPacket(pkt: Buffer): boolean {
            control.dmesg(`jd> msgbus> control packet`)        
            return true;
        }
    }
}