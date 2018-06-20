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

    let _scene: scene.Scene;
    let _sceneStack: scene.Scene[];

    export function currentScene(): scene.Scene {
        init();
        return _scene;
    }

    let __waitAnyButton: () => void
    let __isOver = false;

    export function setWaitAnyButton(f: () => void) {
        __waitAnyButton = f
    }

    export function waitAnyButton() {
        if (__waitAnyButton) __waitAnyButton()
        else pause(3000)
    }

    export function eventContext(): control.EventContext {
        init();
        return _scene.eventContext;
    }

    function init() {
        if (!_scene) _scene = new scene.Scene(control.pushEventContext());
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

    function showDialogBackground(h: number, c: number) {
        const top = (screen.height - h) >> 1;
        screen.fillRect(0, top, screen.width, h, 0)
        screen.drawLine(0, top, screen.width, top, 1)
        screen.drawLine(0, top + h - 1, screen.width, top + h - 1, 1)

        return top;
    }

    /**
     * Show a title, subtitle menu
     * @param title
     * @param subtitle
     */
    //% group="Gameplay"
    //% weight=90 help=game/splash
    //% blockId=gameSplash block="splash %title||%subtitle"
    //% group="Prompt"
    export function splash(title: string, subtitle?: string) {
        init();
        control.pushEventContext();
        showDialog(title, subtitle)
        waitAnyButton()
        control.popEventContext();
    }

    /**
     * Prompts the user for a boolean question
     * @param title
     * @param subtitle
     */
    //% group="Gameplay"
    //% weight=89 help=game/ask
    //% blockId=gameask block="ask %title||%subtitle"
    //% group="Prompt"
    export function ask(title: string, subtitle?: string): boolean {
        init();
        control.pushEventContext();
        showDialog(title, subtitle, "A = OK, B = CANCEL");
        let answer: boolean = null;
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => answer = true);
        controller.B.onEvent(ControllerButtonEvent.Pressed, () => answer = false);
        pauseUntil(() => answer !== null);
        control.popEventContext();
        return answer;
    }

    function showDialog(title: string, subtitle: string, footer?: string) {
        init();
        const font = image.font8;
        let h = 8;
        if (title)
            h += font.charHeight;
        if (subtitle)
            h += 2 + font.charHeight
        h += 8;
        const top = showDialogBackground(h, 9)
        if (title)
            screen.print(title, 8, top + 8, screen.isMono ? 1 : 7, font);
        if (subtitle)
            screen.print(subtitle, 8, top + 8 + font.charHeight + 2, screen.isMono ? 1 : 6, font);
        if (footer) {
            screen.print(
                footer,
                screen.width - footer.length * font.charWidth - 8,
                screen.height - font.charHeight - 2,
                1,
                font
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
     * Finish the game and display the score
     */
    //% group="Gameplay"
    //% blockId=gameOver block="game over||win %win"
    //% weight=80 help=game/over
    export function over(win: boolean = false) {
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
            screen.printCenter(win ? "YOU WIN!" : "GAME OVER!", top + 8, screen.isMono ? 1 : 5, image.font8)
            if (info.hasScore()) {
                screen.printCenter("Score:" + info.score(), top + 23, screen.isMono ? 1 : 2, image.font8)
                if (info.score() > info.highScore()) {
                    info.saveHighScore();
                    screen.printCenter("New High Score!", top + 34, screen.isMono ? 1 : 2, image.font5);
                } else {
                    screen.printCenter("HI" + info.highScore(), top + 34, screen.isMono ? 1 : 2, image.font8);
                }
            }
            pause(2000) // wait for users to stop pressing keys
            waitAnyButton()
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
    //% blockId=gameupdate block="on game update"
    //% blockAllowMultiple=1
    export function onUpdate(a: () => void): void {
        init();
        if (!a) return;
        game.eventContext().registerFrameHandler(20, a);
    }

    /**
     * Execute code on an interval. Executes before game.onUpdate()
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/interval weight=99 afterOnStart=true
    //% blockId=gameinterval block="on game update every %period=timePicker ms"
    //% blockAllowMultiple=1
    export function onUpdateInterval(period: number, a: () => void): void {
        init();
        if (!a || period < 0) return;
        let timer = 0;
        game.eventContext().registerFrameHandler(19, () => {
            const time = control.millis();
            if (timer <= time) {
                timer = time + period;
                a();
            }
        });
    }

    /**
     * Draw on screen before sprites
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/paint weight=10 afterOnStart=true
    export function onPaint(a: () => void): void {
        init();
        if (!a) return;
        game.eventContext().registerFrameHandler(75, a);
    }
}
