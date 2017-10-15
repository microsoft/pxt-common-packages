
declare namespace light {

    interface NeoPixelStrip {

        //% blockHidden=false
        move(kind: LightMove, offset: number): void;

        //% blockHidden=false
        show(): void;

        //% blockHidden=false
        clear(): void;

        //% blockHidden=false
        setBuffered(on: boolean): void;

        //% blockHidden=false
        length(): number;

        //% blockHidden=false
        pixelColor(pixeloffset: number): number;

        //% blockHidden=false
        setPixelWhiteLED(pixeloffset: number, white: number): void

        //% blockHidden=false
        range(start: number, length: number): NeoPixelStrip;
    }
}

declare interface light {

    //% blockHidden=false
    createNeoPixelStrip(
        pin: DigitalPin,
        numleds: number,
        mode?: NeoPixelMode
    ): light.NeoPixelStrip;
}