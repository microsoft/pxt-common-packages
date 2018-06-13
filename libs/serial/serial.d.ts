//%
declare namespace serial {

    //% blockHidden=0
    function writeString(text: string): void;

    //% blockHidden=0
    function writeBuffer(buffer: Buffer): void;

    //% blockHidden=0
    function attachToConsole(): void;

    //% blockHidden=0
    function setBaudRate(rate: BaudRate): void;

    //% blockHidden=0
    function redirect(tx: DigitalPin, rx: DigitalPin, rate: BaudRate): void;

    //% blockHidden=0
    function redirectToUSB(): void;
}
