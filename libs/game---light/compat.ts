namespace scene.systemMenu {
    export function isVisible() {
        return false
    }
}

namespace scene {
    export const SCREEN_CLEAR_PRIORITY = 1;
    export const UPDATE_INTERVAL_PRIORITY = 19;
    export const UPDATE_PRIORITY = 20;
    export const ON_PAINT_PRIORITY = 100;
    export const ON_SHADE_PRIORITY = 110;
    export const UPDATE_SCREEN_PRIORITY = 200;
}

class Scene {
    millis() {
        return control.millis()
    }
}

namespace game {
    export let stats = false;
    let inited = false

    const _scene = new Scene()
    export function currentScene() {
        return _scene
    }

    export function pushScene() {
        const ctx = control.pushEventContext()
        ctx.registerFrameHandler(scene.SCREEN_CLEAR_PRIORITY, () => {
            screen.fill(0)
        });
        ctx.registerFrameHandler(scene.UPDATE_SCREEN_PRIORITY, control.__screen.update);
    }

    export function popScene() {
        control.popEventContext()
    }

    export function eventContext() {
        if (!inited) {
            inited = true
            pushEventContext()
        }
        return control.eventContext()
    }

    let __waitAnyButton: () => void;
    export function setWaitAnyButton(f: () => void) {
        __waitAnyButton = f
    }

    /**
     * Draw on screen before sprites, after background
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/paint weight=10 afterOnStart=true
    export function onPaint(a: () => void): void {
        if (!a) return;
        control.eventContext().registerFrameHandler(scene.ON_PAINT_PRIORITY, a);
    }

    /**
     * Draw on screen after sprites
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/shade weight=10 afterOnStart=true
    export function onShade(a: () => void): void {
        if (!a) return;
        control.eventContext().registerFrameHandler(scene.ON_SHADE_PRIORITY, a);
    }

}

namespace controller {
    export function _player1() {
        return new Controller(1, undefined)
    }
    export class Controller {
        constructor(no: number, v: any) { }
        connected: boolean
    }
}
