declare namespace browserEvents {
    //% shim=browserEvents::mouseX
    function mouseX(): number;
    //% shim=browserEvents::mouseY
    function mouseY(): number;
    //% shim=browserEvents::wheelDx
    function wheelDx(): number;
    //% shim=browserEvents::wheelDy
    function wheelDy(): number;
    //% shim=browserEvents::wheelDz
    function wheelDz(): number;
    //% shim=browserEvents::_setCursorVisible
    function _setCursorVisible(visible: boolean): void;

    //% shim=browserEvents::currentTime
    function currentTime(): number;
    //% shim=browserEvents::getYear
    function getYear(time: number): number;
    //% shim=browserEvents::getMonth
    function getMonth(time: number): number;
    //% shim=browserEvents::getDayOfMonth
    function getDayOfMonth(time: number): number;
    //% shim=browserEvents::getDayOfWeek
    function getDayOfWeek(time: number): number;
    //% shim=browserEvents::getHours
    function getHours(time: number): number;
    //% shim=browserEvents::getMinutes
    function getMinutes(time: number): number;
    //% shim=browserEvents::getSeconds
    function getSeconds(time: number): number;
}