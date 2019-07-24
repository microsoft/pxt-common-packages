/**
 * A manager of scenes
 */
//% icon="\uf009"
//% weight=87 color="#401255"
namespace storyboard {
    let _scenes: { 
        [index: string]: () => void
    };
    let _current: string;

    /**
     * Registers a scene
     * @param name 
     * @param scene 
     */
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