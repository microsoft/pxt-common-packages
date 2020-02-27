namespace jacdac{
    export function random(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export function generate_eui64(serial: Buffer) : Buffer {
        serial.setUint8(6, serial.getUint8(6) & ~(0x02))
        return serial;
    }
}