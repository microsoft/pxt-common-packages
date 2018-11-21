namespace jacdac {

    /**
     * A driver that listens for message bus events
     */
    export class MessageBusDriver extends Driver {
        suppressForwarding: boolean;

        constructor() {
            super("bus", DriverType.BroadcastDriver, DAL.JD_DRIVER_CLASS_MESSAGE_BUS);
            this.suppressForwarding = false;
            jacdac.addDriver(this);
        }

        raiseEvent(id: number, value: number) {
            const event = control.createBuffer(4);
            event.setNumber(NumberFormat.UInt16LE, 0, id);
            event.setNumber(NumberFormat.UInt16LE, 2, value);
            this.sendPacket(event);
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
                this.raiseEvent(id, value);
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

    let _messageBus: MessageBusDriver;
    /**
     * Gets the message bus driver
     */
    export function messageBus(): MessageBusDriver {
        if (!_messageBus) {
            control.dmesg("jd> starting message bus")
            _messageBus = new MessageBusDriver();
        }
        return _messageBus;
    }

    /**
     * Pipes specific events through JACDAC
     */
    //%
    export function listenEvent(src: number, value: number) {
        messageBus().listenEvent(src, value);
    }

    /**
     * Gets the message code
     */
    //% blockHidden=1 shim=ENUM_GET
    //% blockId=jacdacMessageCode block="$msg" enumInitialMembers="message1"
    //% enumName=JacDacMessage enumMemberName=msg enumPromptHint="e.g. Start, Stop, Jump..."
    export function __message(msg: number): number {
        return msg;
    }

    /**
     * Sends an event over JacDac
     * @param id 
     * @param value 
     */
    //% blockid=jacdacraisevent
    //% block="raise event|from %src|with value %value" weight=5
    export function raiseEvent(src: number, value: number) {
        messageBus().raiseEvent(src, value);
    }

    /**
     * Broadcasts a message over JacDac
     * @param msg 
     */
    //% blockId=jacdacBroadcastMessage block="jacdac send $msg"
    //% msg.shadow=jacdacMessageCode draggableParameters
    //% weight=200
    //% blockGap=8
    //% help=jacdac/send-message
    export function sendMessage(msg: number): void {
        // 0 is MICROBIT_EVT_ANY, shifting by 1
        messageBus().raiseEvent(JD_MESSAGE_BUS_ID, msg + 1);
    }

    /**
     * Registers code to run for a particular message
     * @param msg 
     * @param handler 
     */
    //% blockId=jacdacOnMessageReceived block="on jacdac $msg received"
    //% msg.shadow=jacdacMessageCode draggableParameters
    //% weight=199
    //% help=jacdac/on-received-message
    export function onReceivedMessage(msg: number, handler: () => void) {
        messageBus(); // start message bus
        control.onEvent(JD_MESSAGE_BUS_ID, msg + 1, handler);
    }
}