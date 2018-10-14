namespace dmx {
    // http://www.dmx512-online.com/dmx512_packet.html
    // http://cdb.s3.amazonaws.com/ItemRelatedFiles/10191/dmx-101-handbook.pdf
    // https://opendmx.net/index.php/DMX512-A
    // 1 bit = 4us
    function edge(pin: DigitalInOutPin, hi: boolean, us: number) {
        this.pin.digitalWrite(hi);
        control.waitMicros(us);
    }

    /**
     * A universe is composed of up-to 512 channel, each byte is a channel.
     * @param pin 
     * @param universe 
     */
    export function writeUniverse(pin: DigitalInOutPin, universe: Buffer) {
        const MARK = true;
        const BREAK = false;

        // break
        edge(pin, BREAK, 120);
        // mark after break
        edge(pin, MARK, 12);
        // start code
        edge(pin, BREAK, 9);
        edge(pin, MARK, 2);
        // channels
        for (let i = 0; i < universe.length; ++i) {
            const channel = universe[i];
            // mark between frame
            edge(pin, MARK, 2);
            // channel data
            // 1 bit start
            edge(pin, BREAK, 1);
            // 8 bit LE
            for (i = 0xF0; i; i >>= 1)
                edge(pin, (channel & i) != 0, 1);
            // 2 stop bits
            edge(pin, MARK, 2);
        }
        // mark between packet
        //edge(pin, MARK, 50);
        pin.digitalWrite(true);
        pause(1)
        // back to idle
        pin.digitalWrite(true);
    }
}