
namespace light {

    /**
      * Get the color picker field editor
      * @param color color, eg: 0xFF0000
      */
    //% blockId=colorNumberPicker block="%color"
    //% blockHidden=true
    //% shim=TD_ID colorSecondary="#FFFFFF"
    //% color.fieldEditor="colornumber" color.fieldOptions.decompileLiterals=true
    //% value.fieldOptions.colours='["#FF0000", "#ff8000", "#ffff00", "#00ff00", "#00ffff", "#007fff", "#0000ff", "#7f00ff", "#ff0080", "#ff00ff", "#ffffff", "#999999"]'
    //% value.fieldOptions.columns=3 value.fieldOptions.className='rgbColorPicker'
    export function __colorNumberPicker(color: number): number{
        return color;
    }

    /**
      * Get the color wheel field editor
      * @param value value between 0 to 255 to get a color value, eg: 10
      */
    //% blockId=colorWheelPicker block="%color"
    //% blockHidden=true
    //% shim=TD_ID colorSecondary="#FFFFFF"
    //% color.fieldEditor="colorwheel" color.fieldOptions.decompileLiterals=true
    //% color.fieldOptions.sliderWidth='200' color.fieldOptions.channel="hsvfast"
    //% color.fieldOptions.min=0 color.fieldOptions.max=255
    export function __colorWheelPicker(color: number): number {
        return color;
    }
}