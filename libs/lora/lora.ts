// Adapted from https://github.com/ElectronicCats/pxt-lora/



/**
 * Reading data of module lora.
 */
//% weight=2 color=#002050 icon="\uf09e"
//% blockGap=8
//% groups='["Sender", "Receiver", "Packet", "Mode", "Configuration"]'
namespace lora {
    /**
     * Priority of log messages
     */
    export let consolePriority = ConsolePriority.Silent;
    function log(msg: string) {
        console.add(consolePriority, `lora: ${msg}`);
    }

    const FIRMWARE_VERSION = 0x12;
    // registers
    const REG_FIFO = 0x00;
    const REG_OP_MODE = 0x01;
    const REG_FRF_MSB = 0x06;
    const REG_FRF_MID = 0x07;
    const REG_FRF_LSB = 0x08;
    const REG_PA_CONFIG = 0x09;
    const REG_LNA = 0x0c;
    const REG_FIFO_ADDR_PTR = 0x0d;
    const REG_FIFO_TX_BASE_ADDR = 0x0e;
    const REG_FIFO_RX_BASE_ADDR = 0x0f;
    const REG_FIFO_RX_CURRENT_ADDR = 0x10;
    const REG_IRQ_FLAGS = 0x12;
    const REG_RX_NB_BYTES = 0x13;
    const REG_PKT_SNR_VALUE = 0x19;
    const REG_PKT_RSSI_VALUE = 0x1a;
    const REG_MODEM_CONFIG_1 = 0x1d;
    const REG_MODEM_CONFIG_2 = 0x1e;
    const REG_PREAMBLE_MSB = 0x20;
    const REG_PREAMBLE_LSB = 0x21;
    const REG_PAYLOAD_LENGTH = 0x22;
    const REG_MODEM_CONFIG_3 = 0x26;
    const REG_FREQ_ERROR_MSB = 0x28;
    const REG_FREQ_ERROR_MID = 0x29;
    const REG_FREQ_ERROR_LSB = 0x2a;
    const REG_RSSI_WIDEBAND = 0x2c;
    const REG_DETECTION_OPTIMIZE = 0x31;
    const REG_DETECTION_THRESHOLD = 0x37;
    const REG_SYNC_WORD = 0x39;
    const REG_DIO_MAPPING_1 = 0x40;
    const REG_VERSION = 0x42;

    // modes
    const MODE_LONG_RANGE_MODE = 0x80;
    const MODE_SLEEP = 0x00;
    const MODE_STDBY = 0x01;
    const MODE_TX = 0x03;
    const MODE_RX_CONTINUOUS = 0x05;
    const MODE_RX_SINGLE = 0x06;

    // PA config
    const PA_BOOST = 0x80;

    // IRQ masks
    const IRQ_TX_DONE_MASK = 0x08;
    const IRQ_PAYLOAD_CRC_ERROR_MASK = 0x20;
    const IRQ_RX_DONE_MASK = 0x40;

    const MAX_PKT_LENGTH = 255;

    const PA_OUTPUT_RFO_PIN = 0;
    const PA_OUTPUT_PA_BOOST_PIN = 1;

    // Arduino hacks
    function bitSet(value: number, bit: number) {
        return value |= 1 << bit;
        // return ((value) |= (1UL << (bit)));
    }
    function bitClear(value: number, bit: number) {
        return value &= ~(1 << bit);
        // return ((value) &= ~(1UL << (bit)));
    }
    function bitWrite(value: number, bit: number, bitvalue: number) {
        return (bitvalue ? bitSet(value, bit) : bitClear(value, bit));
    }

    let _state: number = 0;
    let _version: number;
    let _frequency = 915E6;
    let _packetIndex = 0;
    let _implicitHeaderMode = 0;
    let _implicitHeader = false;
    let _outputPin = PA_OUTPUT_PA_BOOST_PIN;
    let _spi: SPIDevice;
    let _cs: DigitalInOutPin;
    let _boot: DigitalInOutPin;
    let _rst: DigitalInOutPin;


    export function setPins(spiDevice: SPIDevice,
        csPin: DigitalInOutPin,
        bootPin: DigitalInOutPin,
        rstPin: DigitalInOutPin) {
        _spi = spiDevice;
        _cs = csPin;
        _boot = bootPin;
        _rst = rstPin;
        // force reset
        _state = 0;
    }

    function init() {
        if (_state > 0) return; // already inited

        _state = 1;
        if (!_spi) {
            log(`using builtin lora pins`);
            _spi = pins.createSPI(
                pxt.getPinCfg(DAL.CFG_PIN_LORA_MISO),
                pxt.getPinCfg(DAL.CFG_PIN_LORA_MISO),
                pxt.getPinCfg(DAL.CFG_PIN_LORA_SCK)
            );
            _cs = pxt.getPinCfg(DAL.CFG_PIN_LORA_CS);
            _boot = pxt.getPinCfg(DAL.CFG_PIN_LORA_BOOT);
            _rst = pxt.getPinCfg(DAL.CFG_PIN_LORA_RESET);
        }

        _cs.digitalWrite(false);

        // Hardware reset
        log('hw reset')
        _boot.digitalWrite(false);
        _rst.digitalWrite(true);
        pause(200);
        _rst.digitalWrite(false);
        pause(200);
        _rst.digitalWrite(true);
        pause(50);

        // init spi
        _cs.digitalWrite(true);
        _spi.setFrequency(250000);
        _spi.setMode(0);

        _version = readRegister(REG_VERSION);
        log(`version v${version()}, required v${FIRMWARE_VERSION}`);

        //Sleep
        sleep();

        // set frequency
        setFrequency(_frequency);

        // set base addresses
        writeRegister(REG_FIFO_TX_BASE_ADDR, 0);
        writeRegister(REG_FIFO_RX_BASE_ADDR, 0);

        // set LNA boost
        writeRegister(REG_LNA, readRegister(REG_LNA) | 0x03);

        // set auto AGC
        writeRegister(REG_MODEM_CONFIG_3, 0x04);

        // set output power to 17 dBm
        setTxPower(17);

        // put in standby mode
        idle();

        _version = readRegister(REG_VERSION);
        log(`version v${version()}, required v${FIRMWARE_VERSION}`);
    }

    // Write Register of SX. 
    function writeRegister(address: number, value: number) {
        _cs.digitalWrite(false);

        _spi.write(address | 0x80);
        _spi.write(value);

        _cs.digitalWrite(true);
    }

    // Read register of SX 
    function readRegister(address: number): number {
        _cs.digitalWrite(false);
        _spi.write(address & 0x7f);
        const response = _spi.write(0x00);

        _cs.digitalWrite(true);

        return response;
    }

    function explicitHeaderMode() {
        _implicitHeaderMode = 0;
        writeRegister(REG_MODEM_CONFIG_1, readRegister(REG_MODEM_CONFIG_1) & 0xfe);
    }

    function implicitHeaderMode() {
        _implicitHeaderMode = 1;

        writeRegister(REG_MODEM_CONFIG_1, readRegister(REG_MODEM_CONFIG_1) | 0x01);
    }

    /**
    * Read Version of firmware
    **/
    //% parts="lora"
    export function version(): number {
        init();
        return _version;
    }

    /**
    * Parse a packet as a string
    **/
    //% group="Receiver"
    //% parts="lora"
    //% blockId=lorareadstring block="lora read string"
    export function readString(): string {
        init();
        const buf = readBuffer();
        return buf.toString();
    }

    /**
    * Parse a packet as a buffer
    **/
    //% group="Receiver"
    //% parts="lora"
    //% blockId=lorareadbuffer block="lora read buffer"
    export function readBuffer(): Buffer {
        init();
        let length = parsePacket(0);
        if (length <= 0)
            return control.createBuffer(0); // nothing to read

        // allocate buffer to store data
        let buf = control.createBuffer(length);
        let i = 0;
        // read all bytes
        for (let i = 0; i < buf.length; ++i) {
            const c = read();
            if (c < 0) break;
            buf[i] = c;
        }
        if (i != buf.length)
            buf = buf.slice(0, i);
        return buf;
    }

    /**
    * Parse Packet to send
    **/
    //% group="Packet"
    //% parts="lora"
    //% weight=45 blockGap=8 blockId=loraparsepacket block="lora parse packet %size"
    export function parsePacket(size: number): number {
        init();
        let packetLength = 0;
        let irqFlags = readRegister(REG_IRQ_FLAGS);

        if (size > 0) {
            implicitHeaderMode();
            writeRegister(REG_PAYLOAD_LENGTH, size & 0xff);
        } else {
            explicitHeaderMode();
        }

        // clear IRQ's
        writeRegister(REG_IRQ_FLAGS, irqFlags);

        if ((irqFlags & IRQ_RX_DONE_MASK) && (irqFlags & IRQ_PAYLOAD_CRC_ERROR_MASK) == 0) {
            // received a packet
            _packetIndex = 0;

            // read packet length
            if (_implicitHeaderMode) {
                packetLength = readRegister(REG_PAYLOAD_LENGTH);
            } else {
                packetLength = readRegister(REG_RX_NB_BYTES);
            }

            // set FIFO address to current RX address
            writeRegister(REG_FIFO_ADDR_PTR, readRegister(REG_FIFO_RX_CURRENT_ADDR));

            // put in standby mode
            idle();
        } else if (readRegister(REG_OP_MODE) != (MODE_LONG_RANGE_MODE | MODE_RX_SINGLE)) {
            // not currently in RX mode

            // reset FIFO address
            writeRegister(REG_FIFO_ADDR_PTR, 0);

            // put in single RX mode
            writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_RX_SINGLE);
        }

        return packetLength;
    }

    /**
    * Packet RSSI
    **/
    //% group="Packet"
    //% parts="lora"
    //% weight=45 blockGap=8 blockId=lorapacketRssi block="lora packet RSSI"
    export function packetRssi(): number {
        init();
        return (readRegister(REG_PKT_RSSI_VALUE) - (_frequency < 868E6 ? 164 : 157));
    }

    /**
     * Packet SNR
     */
    //% group="Packet"
    //% parts="lora"
    //% blockId=lorapacketsnr block="lora packet SNR"
    export function packetSnr(): number {
        init();
        return (readRegister(REG_PKT_SNR_VALUE)) * 0.25;
    }

    // Begin Packet Frecuency Error
    function packetFrequencyError(): number {
        init();
        let freqError = 0;
        freqError = readRegister(REG_FREQ_ERROR_MSB) & 0xb111; //TODO Covert B111 to c++
        freqError <<= 8;
        freqError += readRegister(REG_FREQ_ERROR_MID) | 0;
        freqError <<= 8;
        freqError += readRegister(REG_FREQ_ERROR_LSB) | 0;

        if (readRegister(REG_FREQ_ERROR_MSB) & 0xb1000) { // Sign bit is on //TODO Covert B1000 to c++
            freqError -= 524288; // B1000'0000'0000'0000'0000
        }

        const fXtal = 32E6; // FXOSC: crystal oscillator (XTAL) frequency (2.5. Chip Specification, p. 14)
        const fError = ((freqError * (1 << 24)) / fXtal) * (signalBandwidth() / 500000.0); // p. 37

        return fError | 0;
    }

    // Begin Packet to send
    function beginPacket(): void {
        log(`begin packet`)
        // put in standby mode
        idle();

        if (_implicitHeader) {
            implicitHeaderMode();
        } else {
            explicitHeaderMode();
        }

        // reset FIFO address and paload length
        writeRegister(REG_FIFO_ADDR_PTR, 0);
        writeRegister(REG_PAYLOAD_LENGTH, 0);
    }

    function endPacket(): number {
        log(`end packet`)
        // put in TX mode
        writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_TX);

        // wait for TX done
        while ((readRegister(REG_IRQ_FLAGS) & IRQ_TX_DONE_MASK) == 0) {
            //TO DO: yield();
            log(`wait tx`)
            pause(10);
        }

        // clear IRQ's
        writeRegister(REG_IRQ_FLAGS, IRQ_TX_DONE_MASK);

        return 1;
    }

    /**
     * Write string to send
     **/
    //% parts="lora"
    //% group="Sender"
    //% blockId=lorasendstring block="lora send string $text"
    export function sendString(text: string) {
        init();
        if (!text) return;
        const buf = control.createBufferFromUTF8(text);
        sendBuffer(buf);
    }

    /**
     * Write buffer to send
     **/
    //% parts="lora"
    //% group="Sender"
    //% blockId=lorasendbuffer block="lora send buffer $buffer"
    export function sendBuffer(buffer: Buffer) {
        init();
        if (!buffer || buffer.length == 0) return;
        log('send')
        beginPacket();
        log(`write payload (${buffer.length} bytes)`)
        writeRaw(buffer);
        endPacket();
    }

    function writeRaw(buffer: Buffer) {
        const currentLength = readRegister(REG_PAYLOAD_LENGTH);
        let size = buffer.length;
        log(`current payload length: ${currentLength}`)

        // check size
        if ((currentLength + size) > MAX_PKT_LENGTH) {
            size = MAX_PKT_LENGTH - currentLength;
        }

        log(`write raw ${buffer.length} -> ${size} bytes`)

        // write data
        for (let i = 0; i < size; i++) {
            writeRegister(REG_FIFO, buffer[i]);
        }

        // update length
        writeRegister(REG_PAYLOAD_LENGTH, currentLength + size);
        log(`updated payload length: ${readRegister(REG_PAYLOAD_LENGTH)}`)
    }

    /**
    * Available Packet
    **/
    //% parts="lora"
    //% group="Packet"
    //% weight=45 blockGap=8 
    //% blockId=loraavailable block="lora available"
    export function available(): number {
        init();
        return readRegister(REG_RX_NB_BYTES) - _packetIndex;
    }

    /**
    * Read Packet
    **/
    //% parts="lora"
    //% group="Packet"
    //% blockId=loraread block="lora read"
    export function read(): number {
        init();
        if (!available()) {
            return -1;
        }

        _packetIndex++;

        return readRegister(REG_FIFO);
    }

    /**
    * Peek Packet to send
    **/
    //% parts="lora"
    //% group="Packet"
    //% blockId=lorapeek block="lora peek"
    export function peek(): number {
        init();
        if (!available()) {
            return -1;
        }

        // store current FIFO address
        const currentAddress = readRegister(REG_FIFO_ADDR_PTR);

        // read
        const b = readRegister(REG_FIFO);

        // restore FIFO address
        writeRegister(REG_FIFO_ADDR_PTR, currentAddress);

        return b;
    }

    function flush() {
        //TODO
    }

    /**
     * Put LoRa in idle mode
     */
    //% parts="lora"
    //% group="Mode"
    //% blockId=loraidle block="lora idle"
    export function idle() {
        init();
        log('idle')
        writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_STDBY);
    }

    /**
    * Sleep Mode
    **/
    //% parts="lora"
    //% group="Mode"
    //% blockId=lorasleep block="lora sleep"
    export function sleep() {
        init();
        writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_SLEEP);
    }

    /**
    * Set Tx Power
    **/
    //% parts="lora"
    //% group="Configuration"
    //% blockId=lorasettxpower block="lora set tx power to $level"
    export function setTxPower(level: number) {
        init();
        level = level | 0;
        if (PA_OUTPUT_RFO_PIN == _outputPin) {
            // RFO
            if (level < 0) {
                level = 0;
            } else if (level > 14) {
                level = 14;
            }

            writeRegister(REG_PA_CONFIG, 0x70 | level);
        } else {
            // PA BOOST
            if (level < 2) {
                level = 2;
            } else if (level > 17) {
                level = 17;
            }

            writeRegister(REG_PA_CONFIG, PA_BOOST | (level - 2));
        }
    }

    /**
    * Set Frecuency of LoRa
    **/
    //% parts="lora"
    //% group="Configuration"
    //% blockId=lorasetsetfrequency block="lora set frequency to $frequency"
    export function setFrequency(frequency: number) {
        init();
        const frf = ((frequency | 0) << 19) / 32000000;

        writeRegister(REG_FRF_MSB, (frf >> 16) & 0xff);
        writeRegister(REG_FRF_MID, (frf >> 8) & 0xff);
        writeRegister(REG_FRF_LSB, (frf >> 0) & 0xff);
    }

    /**
    * Get Spreading Factor of LoRa
    **/
    //% parts="lora"
    //% group="Configuration"
    //% blockId=loraspreadingfactor block="lora spreading factor"
    export function spreadingFactor(): number {
        init();
        return readRegister(REG_MODEM_CONFIG_2) >> 4;
    }

    /**
     * Sets the spreading factoring
     * @param factor spreading factor
     */
    //% parts="lora"
    //% blockId=lorasetspreadingfactor block="lora set spreading factor $factor"
    //% factor.min=6 factor.max=12
    //% factor.defl=8
    //% group="Configuration"
    export function setSpreadingFactor(factor: number) {
        init();
        factor = factor | 0;
        if (factor < 6) {
            factor = 6;
        } else if (factor > 12) {
            factor = 12;
        }

        if (factor == 6) {
            writeRegister(REG_DETECTION_OPTIMIZE, 0xc5);
            writeRegister(REG_DETECTION_THRESHOLD, 0x0c);
        } else {
            writeRegister(REG_DETECTION_OPTIMIZE, 0xc3);
            writeRegister(REG_DETECTION_THRESHOLD, 0x0a);
        }

        writeRegister(REG_MODEM_CONFIG_2, (readRegister(REG_MODEM_CONFIG_2) & 0x0f) | ((factor << 4) & 0xf0));
        setLdoFlag();
    }

    /**
    * Get Signal Bandwidth of LoRa
    **/
    //% parts="lora"
    //% group="Configuration"
    //% blockId=lorasignalbandwith block="signal bandwidth"
    export function signalBandwidth(): number {
        init();
        const bw = (readRegister(REG_MODEM_CONFIG_1) >> 4);
        switch (bw) {
            case 0: return 7.8E3;
            case 1: return 10.4E3;
            case 2: return 15.6E3;
            case 3: return 20.8E3;
            case 4: return 31.25E3;
            case 5: return 41.7E3;
            case 6: return 62.5E3;
            case 7: return 125E3;
            case 8: return 250E3;
            case 9: return 500E3;
        }
        // unknown
        return 0;
    }

    /**
    * Set Signal Bandwidth of LoRa
    **/
    //% parts="lora"
    //% group="Configuration"
    //% blockId=lorasetsignalbandwith block="set signal bandwidth to $value"
    export function setSignalBandwidth(value: number) {
        init();
        let bw;

        if (value <= 7.8E3) {
            bw = 0;
        } else if (value <= 10.4E3) {
            bw = 1;
        } else if (value <= 15.6E3) {
            bw = 2;
        } else if (value <= 20.8E3) {
            bw = 3;
        } else if (value <= 31.25E3) {
            bw = 4;
        } else if (value <= 41.7E3) {
            bw = 5;
        } else if (value <= 62.5E3) {
            bw = 6;
        } else if (value <= 125E3) {
            bw = 7;
        } else if (value <= 250E3) {
            bw = 8;
        } else /*if (sbw <= 250E3)*/ {
            bw = 9;
        }

        writeRegister(REG_MODEM_CONFIG_1, (readRegister(REG_MODEM_CONFIG_1) & 0x0f) | (bw << 4));
        setLdoFlag();
    }

    function setLdoFlag() {
        // Section 4.1.1.5
        const symbolDuration = 1000 / (signalBandwidth() / (1 << spreadingFactor()));

        // Section 4.1.1.6
        const ldoOn = symbolDuration > 16 ? 1 : 0;

        const config3 = readRegister(REG_MODEM_CONFIG_3);
        bitWrite(config3, 3, ldoOn);
        writeRegister(REG_MODEM_CONFIG_3, config3);
    }

    function setCodingRate4(denominator: number) {
        if (denominator < 5) {
            denominator = 5;
        } else if (denominator > 8) {
            denominator = 8;
        }

        const cr = denominator - 4;
        writeRegister(REG_MODEM_CONFIG_1, (readRegister(REG_MODEM_CONFIG_1) & 0xf1) | (cr << 1));
    }

    function setPreambleLength(length: number) {
        writeRegister(REG_PREAMBLE_MSB, (length >> 8) & 0xff);
        writeRegister(REG_PREAMBLE_LSB, (length >> 0) & 0xff);
    }

    function setSyncWord(sw: number) {
        writeRegister(REG_SYNC_WORD, sw);
    }

    //% parts="lora"
    //% group="Configuration"
    //% blockId=lorasetcrc block="lora set crc $on"
    //% on.shadow=toggleOnOff
    export function setCrc(on: boolean) {
        init();
        let v = readRegister(REG_MODEM_CONFIG_2);
        if (on) v = v | 0x04; else v = v & 0xfb;
        writeRegister(REG_MODEM_CONFIG_2, v);
    }
}
