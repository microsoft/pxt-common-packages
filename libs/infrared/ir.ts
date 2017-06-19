class InfraredPacket {
    /**
     * The raw buffer of data received
     */
    public receivedBuffer: Buffer;
    /**
     * The first number in the payload.
     */
    public receivedNumber: number;
    /**
     * The array of numbers of received.
     */
    public receivedNumbers: number[];
}

namespace infrared {
    /**
     * Sends a numbers over the infrared transmitter diode
     * @param value number to send
     */
    //% blockId="ir_send_number" block="infrared send number %value"
    //% parts="ir" weight=90
    export function sendNumber(value: number) {
        sendNumbers([value]);
    }

    /**
     * Sends an array of numbers of infrared. The combined size of the array should be less or equal to 32 bytes.
     * @param values 
     */
    //% parts="ir"
    export function sendNumbers(values: number[]) {
        let buf = msgpack.packNumberArray(values);
        if (buf.length % 2) {
            const buf2 = pins.createBuffer(buf.length + 1);
            buf2.write(0, buf);
            buf2[buf2.length - 1] = 0xc1;
            buf = buf2;
        }
        sendBuffer(buf);
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
            packet.receivedBuffer = currentPacket();
            packet.receivedNumbers = msgpack.unpackNumberArray(currentPacket()) || [];
            packet.receivedNumber = packet.receivedNumbers[0] || 0;            
            cb(packet)
        });
    }    
}