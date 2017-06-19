class InfraredPacket {
    /**
     * The number payload if a number was sent in this packet (via ``sendNumber()`` or ``sendValue()``)
     * or 0 if this packet did not contain a number.
     */
    public receivedNumber: number;
}

namespace infrared {
    /**
     * Sends a numbers over the infrared transmitter diode
     * @param value number to send
     */
    //% blockId="ir_send_number" block="infrared send number %value"
    //% parts="ir"
    export function sendNumber(value: number) {
        let b: Buffer
        if ((value | 0) == value) {
            if ((value << 16) >> 16 == value) {
                b = pins.createBuffer(2)
                b.setNumber(NumberFormat.Int16LE, 0, value)
            } else {
                b = pins.createBuffer(4)
                b.setNumber(NumberFormat.Int32LE, 0, value)
            }
        } else {
            b = pins.createBuffer(8)
            b.setNumber(NumberFormat.Float64LE, 0, value)
        }
        sendBuffer(b)
    }

    //% parts="ir"
    export function currentNumber() {
        let b = currentPacket()
        if (b.length == 8)
            return b.getNumber(NumberFormat.Float64LE, 0)
        else if (b.length == 2)
            return b.getNumber(NumberFormat.Int16LE, 0)
        else
            return b.getNumber(NumberFormat.Int32LE, 0)
    }

    /**
     * Registers code to run when the infrared receives a packet.
     */
    //% mutate=objectdestructuring
    //% mutateText=InfraredPacket
    //% mutateDefaults="receivedNumber"
    //% blockId=ir_on_packet_received block="on infrared received" blockGap=8
    //% parts="ir"
    export function onPacketReceived(cb: (packet: InfraredPacket) => void) {
        onPacket(() => {
            const packet = new InfraredPacket();
            packet.receivedNumber = currentNumber();
            cb(packet)
        });
    }    
}