namespace light {
    let _defaultStrip: NeoPixelStrip;
    /**
     * Get the default light strip.
     */
    //% help=light/default-strip
    //% blockId="neopixel_default_strip" block="default strip"
    //% weight=110 blockGap=8
    //% advanced=true
    export function defaultStrip(): NeoPixelStrip {
        if (_defaultStrip) return _defaultStrip;

        const data = pins.pinByCfg(DAL.CFG_PIN_DOTSTAR_DATA);
        const clk = pins.pinByCfg(DAL.CFG_PIN_DOTSTAR_CLOCK);
        const dsnum = control.getConfigValue(DAL.CFG_NUM_DOTSTARS, 0);
        const neo = pins.pinByCfg(DAL.CFG_PIN_NEOPIXEL);
        const neonum = control.getConfigValue(DAL.CFG_NUM_DOTSTARS, 0);
        const mosi = pins.pinByCfg(DAL.CFG_PIN_MOSI);
        const sck = pins.pinByCfg(DAL.CFG_PIN_SCK);

        if (data && clk && dsnum > 1) {
            _defaultStrip = light.createAPA102Strip(data, clk, dsnum);
            _defaultStrip.setBrightness(96);
        } else if(neo && neonum > 1) {
            _defaultStrip = light.createNeoPixelStrip(neo, neonum, NeoPixelMode.RGB);
        } else { // mount strip on SPI
            _defaultStrip = light.createAPA102Strip(mosi, sck, 30);
        }

        return _defaultStrip;
    }
}