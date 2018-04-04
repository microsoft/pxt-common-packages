/**
 * Game transitions and dialog
 **/
//% color=#008272 weight=99 icon="\uf111"
//% groups='["Gameplay", "Prompt"]'
namespace game {
    /**
     * Determins if diagnostics are shown
     */
    export let debug = false;
    export let gameOverSound: () => void = undefined;

    let _scene: scenes.Scene;
    let _sceneStack: scenes.Scene[];

    export function scene(): scenes.Scene {
        init();
        return _scene;
    }

    let __waitAnyKey: () => void
    let __isOver = false;

    export function setWaitAnyKey(f: () => void) {
        __waitAnyKey = f
    }

    export function waitAnyKey() {
        if (__waitAnyKey) __waitAnyKey()
        else pause(3000)
    }

    export function eventContext(): control.EventContext {
        init();
        return _scene.eventContext;
    }

    function init() {
        if (!_scene) _scene = new scenes.Scene(control.pushEventContext());
        _scene.init();
    }

    export function pushScene() {
        init();
        if (!_sceneStack) _sceneStack = [];
        _sceneStack.push(_scene);
        _scene = undefined;
        init();
    }

    export function popScene() {
        init();
        if (_sceneStack && _sceneStack.length) {
            _scene = _sceneStack.pop();
            control.popEventContext();
        }
    }

    //% blockId=colorindexpicker block="%index" blockHidden=true shim=TD_ID
    //% index.fieldEditor="colornumber"
    //% index.fieldOptions.valueMode="index"
    //% index.fieldOptions.colours='["#dedede","#ffffff","#33e2e4","#05b3e0","#3d30ad","#b09eff","#5df51f","#6a8927","#65471f","#98294a","#f80000","#e30ec0","#ff9da5","#ff9005","#efe204","#000000"]'
    export function _colorIndexPicker(index: number) {
        return index;
    }

    function showDialogBackground(h: number, c: number) {
        const top = (screen.height - h) >> 1;
        if (screen.isMono) {
            screen.fillRect(0, top, screen.width, h, 0)
            screen.drawLine(0, top, screen.width, top, 1)
            screen.drawLine(0, top + h - 1, screen.width, top + h - 1, 1)
        } else {
            screen.fillRect(0, top, screen.width, h, c)
        }

        return top;
    }

    /**
     * Show a title, subtitle menu
     * @param title
     * @param subtitle
     */
    //% group="Gameplay"
    //% weight=90
    //% blockId=gameSplash block="splash %title||%subtitle"
    //% group="Prompt"
    export function splash(title: string, subtitle?: string) {
        init();
        control.pushEventContext();
        showDialog(title, subtitle)
        waitAnyKey()
        control.popEventContext();
    }

    /**
     * Prompts the user for a boolean question
     * @param title
     * @param subtitle
     */
    //% group="Gameplay"
    //% weight=89
    //% blockId=gameask block="ask %title||%subtitle"
    //% group="Prompt"
    export function ask(title: string, subtitle?: string): boolean {
        init();
        control.pushEventContext();
        showDialog(title, subtitle, "A = OK, B = CANCEL");
        let answer: boolean = null;
        keys.A.onEvent(KeyEvent.Pressed, () => answer = true);
        keys.B.onEvent(KeyEvent.Pressed, () => answer = false);
        pauseUntil(() => answer !== null);
        control.popEventContext();
        return answer;
    }

    function showDialog(title: string, subtitle: string, footer?: string) {
        init();
        let h = 8;
        if (title)
            h += image.font8.charHeight;
        if (subtitle)
            h += 2 + image.font5.charHeight
        h += 8;
        const top = showDialogBackground(h, 9)
        if (title)
            screen.print(title, 8, top + 8, screen.isMono ? 1 : 14, image.font8);
        if (subtitle)
            screen.print(subtitle, 8, top + 8 + image.font8.charHeight + 2, screen.isMono ? 1 : 13, image.font5);
        if (footer) {
            screen.print(
                footer,
                screen.width - footer.length * image.font5.charWidth - 8,
                screen.height - image.font5.charHeight - 2,
                1,
                image.font5
            )
        }
    }

    function meltScreen() {
        for (let i = 0; i < 10; ++i) {
            for (let j = 0; j < 1000; ++j) {
                let x = Math.randomRange(0, screen.width - 1)
                let y = Math.randomRange(0, screen.height - 3)
                let c = screen.getPixel(x, y)
                screen.setPixel(x, y + 1, c)
                screen.setPixel(x, y + 2, c)
            }
            pause(100)
        }
    }

    /**
     * Finishes the game and displays score
     */
    //% group="Gameplay"
    //% blockId=gameOver block="game over"
    //% weight=80
    export function over() {
        init();
        if (__isOver) return
        __isOver = true;
        // clear all handlers
        control.pushEventContext();
        // one last screenshot
        takeScreenshot();
        control.runInParallel(() => {
            if (gameOverSound) gameOverSound();
            meltScreen();
            let top = showDialogBackground(44, 4)
            screen.printCenter("GAME OVER!", top + 8, screen.isMono ? 1 : 5, image.font8)
            if (info.hasScore()) {
                screen.printCenter("Score:" + info.score(), top + 23, screen.isMono ? 1 : 2, image.font5)
                if (info.score() > info.highScore()) {
                    info.saveHighScore();
                    screen.printCenter("New High Score!", top + 32, screen.isMono ? 1 : 2, image.font5);
                } else {
                    screen.printCenter("HI" + info.highScore(), top + 32, screen.isMono ? 1 : 2, image.font5);
                }
            }
            pause(2000) // wait for users to stop pressing keys
            waitAnyKey()
            control.reset()
        })
    }

    /**
     * Tells the game host to grab a screenshot
     */
    //% shim=game::takeScreenshot
    declare function takeScreenshot(): void;

    /**
     * Updates the position and velocities of sprites
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/update weight=100 afterOnStart=true
    //% blockId=gameupdate block="game update"
    export function update(a: () => void): void {
        init();
        if (!_scene.updateCallback) {
            game.eventContext().registerFrameHandler(20, function () {
                if (_scene.updateCallback) _scene.updateCallback();
            });
            _scene.updateCallback = a;
        }
    }

    /**
     * Draw on screen before sprites
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/paint weight=10 afterOnStart=true
    //% blockId=gamepaint block="game paint"
    export function paint(a: () => void): void {
        init();
        if (!_scene.paintCallback) {
            game.eventContext().registerFrameHandler(75, function () {
                if (_scene.paintCallback) _scene.paintCallback();
            });
            _scene.paintCallback = a;
        }
    }
}
