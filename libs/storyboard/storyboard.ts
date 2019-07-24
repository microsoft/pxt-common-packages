/**
 * A manager of scenes
 */
namespace storyboard {
    let _scenes: pxt.Map<() => void>;
    let _current: string;

    /**
     * Registers a scene
     * @param name 
     * @param scene 
     */
    //% blockId=storyboardregister block="register scene $name"
    export function registerScene(name: string, scene: () => void) {
        if (!name) return;
        if (!_scenes) {
            _scenes = {};
        }
        _scenes[name] = scene;
    }

    /**
     * Transition to a registered scene
     * @param name 
     */
    //% blockId=storyboardtransiation block="transition to scene $name"
    export function transitionToScene(name: string) {
        if (name == _current) return;
        const scene = name && _scenes && _scenes[name];
        if (!scene) return; // not found

        _current = name;
        game.popScene();
        game.pushScene();
        scene();
    }
}