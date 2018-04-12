namespace fieldeditors {
    /**
     * A shim to render a boolean as a down/up toggle
     */
    //% shim=TD_ID blockHidden=1
    //% blockId=toggleDownUp block="%down"
    //% down.fieldEditor=toggledownup
    //% down.fieldOptions.decompileLiterals=true
    export function __downUp(down: boolean): boolean {
        return down;
    }

    /**
     * A shim to render a boolean as a high/low toggle
     */
    //% shim=TD_ID blockHidden=1
    //% blockId=toggleHighLow block="%high"
    //% high.fieldEditor=togglehighlow
    //% high.fieldOptions.decompileLiterals=true
    export function __highLow(high: boolean): boolean {
        return high;
    }

    /**
     * A shim to render a boolean as a on/off toggle
     */
    //% shim=TD_ID blockHidden=1
    //% blockId=toggleOnOff block="%on"
    //% on.fieldEditor=toggleonoff
    //% on.fieldOptions.decompileLiterals=true
    export function __onOff(on: boolean): boolean {
        return on;
    }

    /**
     * Get the color wheel field editor
     * @param color color, eg: #ff0000
     */
    //% blockId=colorNumberPicker block="%value"
    //% blockHidden=true
    //% shim=TD_ID colorSecondary="#FFFFFF"
    //% value.fieldEditor="colornumber" value.fieldOptions.decompileLiterals=true
    //% value.defl='#ff0000'
    //% value.fieldOptions.colours='["#FF0000", "#ff8000", "#ffff00", "#00ff00", "#00ffff", "#007fff", "#0000ff", "#7f00ff", "#ff0080", "#ff00ff", "#ffffff", "#999999"]'
    //% value.fieldOptions.columns=3 value.fieldOptions.className='rgbColorPicker'
    export function __colorNumberPicker(value: number) {
        return value;
    }

    /**
     * Get the color wheel field editor
     * @param value value between 0 to 255 to get a color value, eg: 10
     */
    //% blockId=colorWheelPicker block="%value"
    //% blockHidden=true
    //% shim=TD_ID colorSecondary="#FFFFFF"
    //% value.fieldEditor="colorwheel" value.fieldOptions.decompileLiterals=true
    //% value.fieldOptions.sliderWidth='200'
    //% value.fieldOptions.min=0 value.fieldOptions.max=255
    export function __colorWheelPicker(value: number) {
        return value;
    }
}