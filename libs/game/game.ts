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
    export let winEffect: effects.BackgroundEffect = undefined;
    export let loseEffect: effects.BackgroundEffect = undefined;
    let loseSound: music.Melody = undefined;
    let winSound: music.Melody = undefined;

    let _scene: scene.Scene;
    let _sceneStack: scene.Scene[];

    let _scenePushHandlers: (() => void)[];
    let _scenePopHandlers: (() => void)[];

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

        if (!winSound)
            winSound = music.powerUp;
        if (!loseSound)
            loseSound = music.wawawawaa;
    }

    export function pushScene() {
        init();
        particles.clearAll();
        particles.disableAll();
        if (!_sceneStack) _sceneStack = [];
        _sceneStack.push(_scene);
        _scene = undefined;
        init();

        if (_scenePushHandlers) {
            _scenePushHandlers.forEach(cb => cb());
        }
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
        if (_scene)
            particles.enableAll();

        if (_scenePopHandlers) {
            _scenePopHandlers.forEach(cb => cb());
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
            const footerTop = screen.height - font.charHeight - 4;
            screen.fillRect(0, footerTop, screen.width, font.charHeight + 4, 0);
            screen.drawLine(0, footerTop, screen.width, footerTop, 1);
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
    export function setGameOverEffect(win: boolean, effect: effects.BackgroundEffect) {
        init();
        if (!effect) return;
        if (win)
            winEffect = effect;
        else
            loseEffect = effect;
    }

    /**
     * Set the music that occurs when the player wins
     * @param win
     * @param effect
     */
    export function setGameOverSound(win: boolean, sound: music.Melody) {
        init();
        if (!sound) return;
        if (win)
            winSound = sound;
        else
            loseSound = sound;
    }

    /**
     * Finish the game and display the score
     */
    //% group="Gameplay"
    //% blockId=gameOver block="game over || %win=toggleWinLose with %effect effect"
    //% weight=80 help=game/over
    export function over(win: boolean = false, effect?: effects.BackgroundEffect) {
        init();
        if (__isOver) return;
        __isOver = true;

        if (!effect) {
            effect = win ? winEffect : loseEffect;
        }

        // releasing memory and clear fibers. Do not add anything that releases the fiber until background is set below,
        // or screen will be cleared on the new frame and will not appear as background in the game over screen.
        while (_sceneStack && _sceneStack.length) {
            _scene.destroy();
            popScene();
        }
        pushScene();
        scene.setBackgroundImage(screen.clone());

        if (win)
            winSound.play();
        else
            loseSound.play();

        effect.startScreenEffect();

        pause(500);

        game.eventContext().registerFrameHandler(scene.HUD_PRIORITY, () => {
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
        });

        pause(2000); // wait for users to stop pressing keys
        waitAnyButton();
        control.reset();
    }

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
        init();
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
     * Draw on screen before sprites, after background
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/paint weight=10 afterOnStart=true
    export function onPaint(a: () => void): void {
        init();
        if (!a) return;
        game.eventContext().registerFrameHandler(scene.PAINT_PRIORITY, a);
    }

    /**
     * Draw on screen after sprites
     * @param body code to execute
     */
    //% group="Gameplay"
    //% help=game/shade weight=10 afterOnStart=true
    export function onShade(a: () => void): void {
        init();
        if (!a) return;
        game.eventContext().registerFrameHandler(scene.SHADE_PRIORITY, a);
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

    /**
     * Register a handler that runs whenever a scene is pushed onto the scene
     * stack. Useful for extensions that need to store/restore state as the
     * event context changes. The handler is run AFTER the push operation (i.e.
     * after game.currentScene() has changed)
     *
     * @param handler Code to run when a scene is pushed onto the stack
     */
    export function addScenePushHandler(handler: () => void) {
        if (!_scenePushHandlers) _scenePushHandlers = [];
        _scenePushHandlers.push(handler);
    }

    /**
     * Remove a scene push handler. Useful for extensions that need to store/restore state as the
     * event context changes.
     *
     * @param handler The handler to remove
     */
    export function removeScenePushHandler(handler: () => void) {
        if (_scenePushHandlers) _scenePushHandlers.removeElement(handler);
    }

    /**
     * Register a handler that runs whenever a scene is popped off of the scene
     * stack. Useful for extensions that need to store/restore state as the
     * event context changes. The handler is run AFTER the pop operation. (i.e.
     * after game.currentScene() has changed)
     *
     * @param handler Code to run when a scene is removed from the top of the stack
     */
    export function addScenePopHandler(handler: () => void) {
        if (!_scenePopHandlers) _scenePopHandlers = [];
        _scenePopHandlers.push(handler);
    }

    /**
     * Remove a scene pop handler. Useful for extensions that need to store/restore state as the
     * event context changes.
     *
     * @param handler The handler to remove
     */
    export function removeScenePopHandler(handler: () => void) {
        if (_scenePopHandlers) _scenePopHandlers.removeElement(handler);
    }
}
