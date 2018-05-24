enum SpriteType {
    //% block="player"
    Player = 1 << 1,
    //% block="food"
    Food = 1 << 2,
    //% block="coin"
    Coin = 1 << 3,
    //% block="projectile"
    Projectile = 1 << 4
}

namespace sprites {
    /**
     * Gets the sprite type
     */
    //% shim=TD_ID blockId=spritetype block="%type"
    export function spriteType(type: SpriteType): number {
        return type;
    }

    /**
     * Register an event when a particular type of sprite is created
     * @param type 
     * @param sprite 
     */
    //% group="Lifecycle"
    //% block=spritesondestroyed block="on created %type=spritetype "
    export function onCreated(type: number, handler: (sprite: Sprite) => void): void {

    }

    /**
     * Register an event when a particular type of sprite is destroyed
     * @param type 
     * @param sprite 
     */
    //% group="Lifecycle"
    //% block=spritesondestroyed block="on destroyed %type=spritetype "
    export function onDestroyed(type: number, handler: (sprite: Sprite) => void) {

    }

    /**
     * Register code to run when sprites overlap
     */
    //% group="Overlaps"
    //% blockId=spritesoverlap block="on %type=spritetype overlap with %otherType=spritetype"
    export function onOverlap(type: number, otherType: number, handler: (sprite: Sprite, other: Sprite) => void) {
    }

    /**
     * Register a code handler when a collision happens
     * @param direction 
     * @param tileIndex 
     * @param handler 
     */
    //% group="Collisions"
    //% blockId=spritesollisions block="on %type=spritetype hit tile %tileIndex from %direction"
    export function onCollision(type: number, tileIndex: number, direction: CollisionDirection, handler: (sprite: Sprite) => void) {
    }
}