
/**
 * Respond to and read data from buttons and sensors.
 */
//% color="#B4009E" weight=98 icon="\uf192"
namespace input {
}

namespace loops {
    /**
      * Get the time field editor
      * @param ms time duration in milliseconds, eg: 500, 1000
      */
    //% blockId=timePicker block="%ms"
    //% blockHidden=true
    //% shim=TD_ID colorSecondary="#FFFFFF"
    //% ms.fieldEditor="numberdropdown" ms.fieldOptions.decompileLiterals=true
    //% ms.fieldOptions.data='[["100 ms", 100], ["200 ms", 200], ["500 ms", 500], ["1 second", 1000], ["2 seconds", 2000]]'
    export function __timePicker(ms: number): number{
        return ms;
    }
}
