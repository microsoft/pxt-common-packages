namespace light {
    let _defaultStrip: NeoPixelStrip;
    /**
     * Gets the default light strip
     */
    //% help=light/default-strip
    //% blockId="neopixel_default_strip" block="default strip"
    //% weight=110 blockGap=8
    //% advanced=true
    //% parts=pixels
    export function defaultStrip(): NeoPixelStrip {
        if (_defaultStrip) return _defaultStrip;

        const data = pins.pinByCfg(DAL.CFG_PIN_DOTSTAR_DATA);
        const clk = pins.pinByCfg(DAL.CFG_PIN_DOTSTAR_CLOCK);
        const dsnum = control.getConfigValue(DAL.CFG_NUM_DOTSTARS, 0);
        const neo = pins.pinByCfg(DAL.CFG_PIN_NEOPIXEL);
        const neonum = control.getConfigValue(DAL.CFG_NUM_NEOPIXELS, 0);
        const mosi = pins.pinByCfg(DAL.CFG_PIN_MOSI);
        const sck = pins.pinByCfg(DAL.CFG_PIN_SCK);

        _defaultStrip = new NeoPixelStrip();
        if (data && clk && dsnum > 1) {
            _defaultStrip._mode = NeoPixelMode.APA102;
            _defaultStrip._dataPin = data;
            _defaultStrip._clkPin = clk;
            _defaultStrip._length = dsnum;
        } else if(neo && neonum > 1) {
            _defaultStrip._mode = NeoPixelMode.RGB;
            _defaultStrip._dataPin = neo;
            _defaultStrip._length = neonum;
        } else { // mount strip on SPI
            _defaultStrip._mode = NeoPixelMode.RGB;
            _defaultStrip._dataPin = mosi;
            _defaultStrip._clkPin = sck;
            _defaultStrip._length = 30;
        }

        return _defaultStrip;
    }
}