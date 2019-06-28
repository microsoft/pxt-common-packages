namespace light {
    let _onboardStrip: light.LightStrip;
    /**
     * Get the default light strip.
     */
    //% help=light/onboard-strip
    //% blockId="neopixel_onboard_strip" block="onboard strip"
    //% weight=111 blockGap=8
    //% advanced=true
    export function onboardStrip(): NeoPixelStrip {
        if (_onboardStrip) return _onboardStrip;

        const data = pins.pinByCfg(DAL.CFG_PIN_DOTSTAR_DATA);
        const clk = pins.pinByCfg(DAL.CFG_PIN_DOTSTAR_CLOCK);
        const dsnum = control.getConfigValue(DAL.CFG_NUM_DOTSTARS, 0);
        const neo = pins.pinByCfg(DAL.CFG_PIN_NEOPIXEL);
        const neonum = control.getConfigValue(DAL.CFG_NUM_NEOPIXELS, 0);
        if (data && clk && dsnum > 0) {
            _onboardStrip = light.createAPA102Strip(data, clk, dsnum);
            _onboardStrip.setBrightness(96);
        } else if (neo && neonum > 0) {
            _onboardStrip = light.createNeoPixelStrip(neo, neonum, NeoPixelMode.RGB);
        } else {
            _onboardStrip = light.createNeoPixelStrip(undefined, 0);
        }
        return _onboardStrip;
    }
}