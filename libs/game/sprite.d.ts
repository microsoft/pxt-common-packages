declare interface Sprite {
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="z (depth)"
    z: number;
    // this is defined in the superclass BaseSprite, so it needs to be declared here to show up
    // in the blocks for sprites.
}