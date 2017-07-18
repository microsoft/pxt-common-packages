class InfraredPacket {
    /**
     * The first number in the payload.
     */
    public receivedNumber: number;
    /**
     * The array of numbers of received.
     */
    public receivedNumbers: number[];
    /**
     * The raw buffer of data received
     */
    public receivedBuffer: Buffer;
}

namespace network {
    /**
     * Sends a numbers over the infrared transmitter diode
     * @param value number to send
     */
    //% blockId="ir_send_number" block="infrared send number %value"
    //% parts="ir" weight=90
    export function infraredSendNumber(value: number) {
        infraredSendNumbers([value]);
    }

    /**
     * Sends an array of numbers of infrared. The combined size of the array should be less or equal to 32 bytes.
     * @param values 
     */
    //% parts="ir"
    export function infraredSendNumbers(values: number[]) {
        let buf = msgpack.packNumberArray(values);
        if (buf.length % 2) {
            const buf2 = pins.createBuffer(buf.length + 1);
            buf2.write(0, buf);
            buf2[buf2.length - 1] = 0xc1;
            buf = buf2;
        }
        infraredSendPacket(buf);
    }

    /**
     * Registers code to run when the infrared receives a packet.
     */
    //% mutate=objectdestructuring
    //% mutateText=InfraredPacket
    //% mutateDefaults="receivedNumber"
    //% blockId=ir_on_packet_received block="on infrared received" blockGap=8
    //% parts="ir"
    export function onInfraredPacketReceived(cb: (p: InfraredPacket) => void) {
        onInfraredPacket(() => {
            const buf: Buffer = infraredPacket();
            const nums: number[] = msgpack.unpackNumberArray(buf) || [];
            const num = nums[0] || 0;

            const packet = new InfraredPacket();
            packet.receivedBuffer = buf;
            packet.receivedNumbers = nums;
            packet.receivedNumber = num;
            cb(packet)
        });
    }
}