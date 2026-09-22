/**
 * Scene-aware Box2D physics with automatic drawing.
 */
//% color=#426b9a weight=80 icon="\uf1b2" block="Box2D"
//% groups='["Body", "Shapes", "Physics", "Joints", "Collisions", "Global"]'
namespace box2dblocks {
    //% blockId=box2d_blocks_set_gravity
    //% block="set gravity x $x y $y"
    //% x.defl=0 y.defl=100
    //% group="Global" weight=100
    export function setGravity(x: number, y: number): void {
        _state().world.setGravity(x / PIXELS_PER_METER, y / PIXELS_PER_METER);
    }

    //% blockId=box2d_blocks_pause
    //% block="set physics paused $paused"
    //% paused.shadow=toggleOnOff
    //% group="Global" weight=95
    export function setPaused(paused: boolean): void {
        _state().paused = paused;
    }

    //% blockId=box2d_blocks_speed
    //% block="set simulation speed $speed"
    //% speed.min=0 speed.max=4 speed.defl=1
    //% group="Global" weight=90
    export function setSimulationSpeed(speed: number): void {
        _state().speed = Math.max(0, speed);
    }

    /**
     * Create a world-space point in pixels for the ground and walls block.
     */
    //% blockId=box2d_blocks_xy_point
    //% block="x $x y $y"
    //% group="Global" weight=0
    export function point(x: number, y: number): PhysicsPoint {
        return new PhysicsPoint(x, y);
    }
}
