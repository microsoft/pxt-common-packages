/**
 * Game transitions and dialog
 **/
//% color=#8854d0 weight=97 icon="\uf111"
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

    let _scenePushHandlers: ((scene: scene.Scene) => void)[];
    let _scenePopHandlers: ((scene: scene.Scene) => void)[];

    export function currentScene(): scene.Scene {
        init();
        return _scene;
    }

    let __waitAnyButton: () => void;
    let __gameOverHandler: (win: boolean) => void;
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

    function init(forceNewScene ?: boolean) {
        if (!_scene || forceNewScene) {
            _scene = new scene.Scene(control.pushEventContext(), _scene);
        }
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
        const oldScene = game.currentScene()
        particles.clearAll();
        particles.disableAll();
        if (!_sceneStack) _sceneStack = [];
        _sceneStack.push(_scene);
        init(/** forceNewScene **/ true);

        if (_scenePushHandlers) {
            _scenePushHandlers.forEach(cb => cb(oldScene));
        }
    }

    export function popScene() {
        const oldScene = game.currentScene()
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
            _scenePopHandlers.forEach(cb => cb(oldScene));
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
        const titleFont = image.getFontForText(title || "");
        const subFont = image.getFontForText(subtitle || "")
        const footerFont = image.getFontForText(footer || "");
        let h = 8;
        if (title)
            h += titleFont.charHeight;
        if (subtitle)
            h += 2 + subFont.charHeight
        h += 8;
        const top = showDialogBackground(h, 9)
        let y = top + 8;
        if (title) {
            screen.print(title, 8, y, screen.isMono ? 1 : 7, titleFont);
            y += titleFont.charHeight + 2;
        }
        if (subtitle) {
            screen.print(subtitle, 8, y, screen.isMono ? 1 : 6, subFont);
            y += subFont.charHeight + 2;
        }
        if (footer) {
            const footerTop = screen.height - footerFont.charHeight - 4;
            screen.fillRect(0, footerTop, screen.width, footerFont.charHeight + 4, 0);
            screen.drawLine(0, footerTop, screen.width, footerTop, 1);
            screen.print(
                footer,
                screen.width - footer.length * footerFont.charWidth - 8,
                screen.height - footerFont.charHeight - 2,
                1,
                footerFont
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
     * Set the function to call on game over. The 'win' boolean is
     * passed to the handler.
     * @param handler
     */
    export function onGameOver(handler: (win: boolean) => void) {
        __gameOverHandler = handler;
    }

    /**
     * Finish the game and display the score
     */
    //% group="Gameplay"
    //% blockId=gameOver block="game over %win=toggleWinLose || with %effect effect"
    //% weight=80 help=game/over
    export function over(win: boolean = false, effect?: effects.BackgroundEffect) {
        init();
        if (__isOver) return;
        __isOver = true;

        if (__gameOverHandler) {
            __gameOverHandler(win);
        } else {
            if (!effect) {
                effect = win ? winEffect : loseEffect;
            }

            // collect the scores before poping the scenes
            const scoreInfo = info.player1.getState();
            const highScore = info.highScore();
            if (scoreInfo.score > highScore)
                info.saveHighScore();

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

            pause(400);

            const overDialog = new GameOverDialog(win, scoreInfo.score, highScore);
            scene.createRenderable(scene.HUD_Z, target => {
                overDialog.update();
                target.drawTransparentImage(
                    overDialog.image,
                    0,
                    (screen.height - overDialog.image.height()) >> 1
                );
            });

            pause(500); // wait for users to stop pressing keys
            overDialog.displayCursor();
            waitAnyButton();
            control.reset();
        }
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

    // Indicates whether the fiber needs to be created
    let foreverRunning = false;

    /**
     * Repeats the code forever in the background for this scene.
     * On each iteration, allows other codes to run.
     * @param body code to execute
     */
    export function forever(action: () => void): void {
        if (!foreverRunning) {
            foreverRunning = true;
            control.runInParallel(() => {
                while (1) {
                    const handlers = game.currentScene().gameForeverHandlers;
                    handlers.forEach(h => {
                        if (!h.lock) {
                            h.lock = true;
                            control.runInParallel(() => {
                                h.handler();
                                h.lock = false;
                            });
                        }
                    });
                    pause(20);
                }
            });
        }

        game.currentScene().gameForeverHandlers.push(
            new scene.GameForeverHandler(action)
        );
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
        scene.createRenderable(scene.ON_PAINT_Z, a);
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
        scene.createRenderable(scene.ON_SHADE_Z, a);
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
    export function addScenePushHandler(handler: (oldScene: scene.Scene) => void) {
        if (!_scenePushHandlers) _scenePushHandlers = [];
        if (_scenePushHandlers.indexOf(handler) < 0)
            _scenePushHandlers.push(handler);
    }

    /**
     * Remove a scene push handler. Useful for extensions that need to store/restore state as the
     * event context changes.
     *
     * @param handler The handler to remove
     */
    export function removeScenePushHandler(handler: (oldScene: scene.Scene) => void) {
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
    export function addScenePopHandler(handler: (oldScene: scene.Scene) => void) {
        if (!_scenePopHandlers) _scenePopHandlers = [];
        if (_scenePopHandlers.indexOf(handler) < 0)
            _scenePopHandlers.push(handler);
    }

    /**
     * Remove a scene pop handler. Useful for extensions that need to store/restore state as the
     * event context changes.
     *
     * @param handler The handler to remove
     */
    export function removeScenePopHandler(handler: (oldScene: scene.Scene) => void) {
        if (_scenePopHandlers) _scenePopHandlers.removeElement(handler);
    }
}
