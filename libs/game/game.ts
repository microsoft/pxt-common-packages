/**
 * Game transitions and dialog
 **/
//% color=#008272 weight=97 icon="\uf111"
//% groups='["Gameplay", "Prompt"]'
namespace game {
    /**
     * Determines if diagnostics are shown
     */
    export let debug = false;
    export let stats = false;
    export let gameOverSound: () => void = undefined;
    export let winEffect: effects.BackgroundEffect = undefined;
    export let loseEffect: effects.BackgroundEffect = undefined;

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

        if (!winEffect)
            winEffect = effects.confetti;
        if (!loseEffect)
            loseEffect = effects.melt;
    }

    export function pushScene() {
        init();
        particles.clearAll();
        if (!_sceneStack) _sceneStack = [];
        _sceneStack.push(_scene);
        _scene = undefined;
        init();
    }

    export function popScene() {
        if (_sceneStack && _sceneStack.length) {
            // pop scenes from the stack
            _scene = _sceneStack.pop();
            control.popEventContext();
        } else if (_scene) {
            // post last scene
            control.popEventContext();
            _scene = undefined;
        }
    }

    function showDialogBackground(h: number, c: number) {
        const top = (screen.height - h) >> 1;
        screen.fillRect(0, top, screen.width, h, 0)
        screen.drawLine(0, top, screen.width, top, 1)
        screen.drawLine(0, top + h - 1, screen.width, top + h - 1, 1)

        return top;
    }

    export function showDialog(title: string, subtitle: string, footer?: string) {
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

    /**
     * Set the effect that occurs when the game is over
     * @param win whether the animation should run on a win (true)
     * @param effect
     */
    //% group="Gameplay"
    //% blockId=setGameOverEffect block="set game over effect for win %win=toggleYesNo to %effect"
    export function setGameOverEffect(win: boolean, effect: effects.BackgroundEffect) {
        init();
        if (!effect) return;
        if (win)
            winEffect = effect;
        else
            loseEffect = effect;
    }

    /**
     * Finish the game and display the score
     */
    //% group="Gameplay"
    //% blockId=gameOver block="game over||win %win=toggleYesNo"
    //% weight=80 help=game/over
    export function over(win: boolean = false) {
        init();
        if (__isOver) return;
        __isOver = true;
        let chosenEffect = win ? winEffect : loseEffect;
        
        let background = screen.clone();
        // one last screenshot
        takeScreenshot();

        while (_sceneStack && _sceneStack.length)
            popScene();
        pushScene();
        scene.setBackgroundImage(background);

        if (gameOverSound) gameOverSound();
        chosenEffect.startSceneEffect();
        pause(500);

        game.eventContext().registerFrameHandler(95, () => {
            let top = showDialogBackground(46, 4);
            screen.printCenter(win ? "YOU WIN!" : "GAME OVER!", top + 8, screen.isMono ? 1 : 5, image.font8);
            if (info.hasScore()) {
                screen.printCenter("Score:" + info.score(), top + 23, screen.isMono ? 1 : 2, image.font8);
                if (info.score() > info.highScore()) {
                    info.saveHighScore();
                    screen.printCenter("New High Score!", top + 34, screen.isMono ? 1 : 2, image.font5);
                } else {
                    screen.printCenter("HI" + info.highScore(), top + 34, screen.isMono ? 1 : 2, image.font8);
                }
            }
        })

        pause(2000); // wait for users to stop pressing keys
        waitAnyButton();
        control.reset();
    }

    /**
     * Tells the game host to grab a screenshot
     */
    //% shim=game::takeScreenshot
    declare function takeScreenshot(): void;

    /**
     * Update the position and velocities of sprites
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/on-update weight=100 afterOnStart=true
    //% blockId=gameupdate block="on game update"
    //% blockAllowMultiple=1
    export function onUpdate(a: () => void): void {
        init();
        if (!a) return;
        game.eventContext().registerFrameHandler(20, a);
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