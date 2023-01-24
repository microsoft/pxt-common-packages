/**
 * Game transitions and dialog
 **/
namespace game {

    /**
     * Update the position and velocities of sprites
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/on-update weight=100 afterOnStart=true
    //% blockId=gameupdate block="on game update"
    //% blockAllowMultiple=1
    export function onUpdate(a: () => void): void {
        if (!a) return;
        game.eventContext().registerFrameHandler(scene.UPDATE_PRIORITY, a);
    }

    /**
     * Run code on an interval of time. This executes before game.onUpdate()
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/on-update-interval weight=99 afterOnStart=true
    //% blockId=gameinterval block="on game update every %period=timePicker ms"
    //% blockAllowMultiple=1
    export function onUpdateInterval(period: number, a: () => void): void {
        if (!a || period < 0) return;
        let timer = 0;
        game.eventContext().registerFrameHandler(scene.UPDATE_INTERVAL_PRIORITY, () => {
            const time = game.currentScene().millis();
            if (timer <= time) {
                timer = time + period;
                a();
            }
        });
    }

    /**
     * Returns the time since the game started in milliseconds
     */
    //% blockId=arcade_game_runtime block="time since start (ms)"
    //% group="Gameplay" weight=11
    //% help=game/runtime
    export function runtime(): number {
        return currentScene().millis();
    }
}
