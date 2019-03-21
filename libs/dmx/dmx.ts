/**
 * DMX protocol functions.
 */
//% weight=100 color="#0078d7" icon="\uf185"
namespace dmx {
    // http://www.dmx512-online.com/dmx512_packet.html
    // http://cdb.s3.amazonaws.com/ItemRelatedFiles/10191/dmx-101-handbook.pdf
    // https://opendmx.net/index.php/DMX512-A
    // DMXMaster schematics http://www.ca.diigiit.com/download/dmx-shield-rev4.pdf

    export class DMXSerial {
        tx: DigitalInOutPin;
        rx: DigitalInOutPin;
        ser: serial.Serial;

        constructor(tx: DigitalInOutPin) {
            this.tx = tx;
            this.ser = serial.createSerial(this.tx, undefined, 12000);
            this.ser.serialDevice.setBaudRate(250000);
        }

        write(channels: Buffer) {
            // https://learn.sparkfun.com/tutorials/introduction-to-dmx
            // http://www.dmx512-online.com/dmx512_packet.html
            // break (low) > >88 microsecs or 22 pulses
            this.tx.digitalWrite(false);
            control.waitMicros(88);
            // mark after break (high) - 8 microsecs or 2 pulses
            this.tx.digitalWrite(true);
            control.waitMicros(8); 
            // start code is channel 0
            // frames - max 512, no mtbf
            this.ser.serialDevice.writeBuffer(channels);
            // no mtbp
        }
    }

    let _sercom: DMXSerial;
    /**
     * Writes a DMX channel buffer
     * @param buf 
     */
    //%
    export function sendBuffer(buf: Buffer) {
        if (!_sercom) {
            const tx = pins.pinByCfg(DAL.CFG_PIN_DMX_OUT);
            if (!tx) return;
            _sercom = new DMXSerial(tx);
        }

        if (_sercom)
            _sercom.write(buf);
    }
}