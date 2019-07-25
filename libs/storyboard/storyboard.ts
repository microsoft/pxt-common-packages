/**
 * A manager of scenes
 */
//% icon="\uf009"
//% weight=87 color="#401255"
namespace storyboard {
    export interface FrameOptions {
        background?: number;
    }

    export class Frame {
        start: () => void;
        options: FrameOptions;

        constructor(start: () => void, options: FrameOptions) {
            this.start = start;
            this.options = options || {};
        }
    }

    //% fixedInstances
    export class BootSequence {
        start: (done: () => void) => void;
        background: number;
        constructor(start: (done: () => void) => void, background: number) {
            this.start = start;
            this.background = background;
        }

        /**
         * Registers the boot sequence
         */
        //% block="storyboard register %boot| boot sequence" blockId=storyboardregister
        register() {
            registerBootSequence(this);
        }
    }

    let _boots: BootSequence[];
    let _scenes: {
        [index: string]: Frame
    };
    let _nav: Frame[];

    function registerBootSequence(boot: BootSequence) {
        if (!_boots)
            _boots = [];
        if (_boots.indexOf(boot) < 0)
            _boots.push(boot);
    }

    /**
     * Registers a scene
     * @param name 
     * @param scene 
     */
    export function registerScene(name: string, start: () => void, options?: FrameOptions) {
        if (!name) return;
        if (!_scenes) {
            _scenes = {};
        }
        _scenes[name] = new Frame(start, options);
    }

    function consumeBootSequence() {
        // run boot sequences if any
        let boot: BootSequence;
        while (boot = _boots && _boots.shift()) {
            game.pushScene();
            let isDone = false;
            boot.start(() => isDone = true);
            pauseUntil(() => isDone);
            game.popScene();
        }
    }

    /**
     * Starts the story board by running boot sequences then entering a scene
     * @param name 
     */
    //% block="storyboard start at $name" blockId=storyboardstart
    export function start(name?: string) {
        consumeBootSequence();
        // grab the first frame
        push(name || (_scenes && Object.keys(_scenes)[0]));
    }

    function isActive(name: string): boolean {
        const scene = name && _scenes && _scenes[name];
        return scene && (_nav && _nav.length && _nav[_nav.length - 1] == scene);
    }

    /**
     * Replace the current scene with the given scene
     * @param name 
     */
    //% block="storyboard replace scene $name" blockId=storyboardreplace
    export function replace(name: string) {
        if (isActive(name)) return;

        const scene = name && _scenes && _scenes[name];
        if (!scene) return; // not found
        
        if (!_nav) _nav = [];
        if (_nav.length) {
            console.log('drop current scene')
            _nav.pop();
            game.popScene();
        }
        console.log('replace scene')
        _nav.push(scene);
        game.pushScene();
        scene.start();
    }

    /**
     * Transition to a registered scene
     * @param name 
     */
    //% block="storyboard push scene $name" blockId=storyboardpush
    export function push(name: string) {
        if (isActive(name)) return;

        const scene = name && _scenes && _scenes[name];
        if (!scene) return; // not found

        if (!_nav) _nav = [];        
        if (_nav.length) {
            console.log('drop scene')
            game.popScene();
        }
        console.log(`push ${name}`)
        _nav.push(scene);
        game.pushScene();
        scene.start();
    }

    /**
     * Stops the current scene and restart the previous scene
     */
    //% block="storyboard pop frame" blockId=storyboardpop
    export function pop() {
        const n = _nav && _nav.pop();
        if (n) {
            console.log('pop scene')
            game.popScene();
        }
        // restart previous
        if (_nav && _nav.length) {
            console.log('restart scene')
            const sc = _nav[_nav.length - 1];
            sc.start();
        }
    }
}