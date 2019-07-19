namespace jacdac{
    const JD_CRC_POLYNOMIAL = 0xF13;

    export function jd_crc(pkt: JDPacket, device?: JDDevice): number {
        let crc: number = 0xfff;
        if (device) {
            const udidPtr = device.unique_device_identifier;
            let i: number = 0;

            while (i < 8) {
                crc ^= (udidPtr.getUint8(i) << 8);
                for (let j = 0; j < 8; ++j) {
                    if (crc & 0x800)
                        crc = (crc << 1) ^ JD_CRC_POLYNOMIAL;
                    else
                        crc = crc << 1;
                }

                i++;
            }
        }

        let len = pkt.size + JD_SERIAL_CRC_HEADER_SIZE + 2;
        let idx = JD_SERIAL_CRC_HEADER_SIZE;
        const buf = pkt.getBuffer();

        while (idx < len) {
            crc ^= (buf.getUint8(idx) << 8);
            for (let i = 0; i < 8; ++i) {
                if (crc & 0x800)
                    crc = (crc << 1) ^ JD_CRC_POLYNOMIAL;
                else
                    crc = crc << 1;
            }
            idx++;
        }

        return crc & 0xFFF;
    }
}