/**
 * Game transitions and dialog
 **/
namespace game {
    /**
     * Determines if diagnostics are shown
     */
    export let debug = false;
    export let stats = false;

    export enum ScoringType {
        //% block="high score"
        HighScore,
        //% block="low score"
        LowScore,
        //% block="none"
        None
    }

    export class GameOverConfig {
        scoringType: ScoringType;
        winEffect: effects.BackgroundEffect;
        loseEffect: effects.BackgroundEffect;
        loseSound: music.Playable;
        winSound: music.Playable;
        loseSoundLooping: boolean;
        winSoundLooping: boolean;
        winMessage: string;
        winMessageMultiplayer: string;
        loseMessage: string;
        effectSetByUser: boolean;
        soundSetByUser: boolean;
        messageSetByUser: boolean;
        scoringTypeSetByUser: boolean;

        constructor() {
            this.init();
        }

        init() {
            this.scoringType = ScoringType.HighScore;
            this.winEffect = effects.confetti;
            this.loseEffect = effects.melt;
            this.winSound = music.melodyPlayable(music.powerUp);
            this.loseSound = music.melodyPlayable(music.wawawawaa);
            this.winSoundLooping = false;
            this.loseSoundLooping  = false;
            this.winMessage = "YOU WIN!";
            this.winMessageMultiplayer = "${WINNER} WINS!";
            this.loseMessage = "GAME OVER";
            this.effectSetByUser = false;
            this.soundSetByUser = false;
            this.messageSetByUser = false;
            this.scoringTypeSetByUser = false;
        }

        setScoringType(type: ScoringType, explicit: boolean) {
            if (!explicit && this.scoringTypeSetByUser) return;
            this.scoringType = type;
            if (explicit) this.scoringTypeSetByUser = true;
        }

        setEffect(win: boolean, effect: effects.BackgroundEffect, explicit: boolean) {
            if (!explicit && this.effectSetByUser) return;
            if (win) this.winEffect = effect;
            else this.loseEffect = effect;
            if (explicit) this.effectSetByUser = true;
        }
        getEffect(win: boolean) {
            return win ? this.winEffect : this.loseEffect;
        }

        setSound(win: boolean, sound: music.Playable, looping: boolean, explicit: boolean) {
            if (!explicit && this.soundSetByUser) return;
            if (win) {
                this.winSound = sound;
                this.winSoundLooping = looping;
            } else {
                this.loseSound = sound;
                this.loseSoundLooping = looping;
            }
            if (explicit) this.soundSetByUser = true;
        }
        getSound(win: boolean) {
            return win ? this.winSound : this.loseSound;
        }
        getSoundLooping(win: boolean) {
            return win ? this.winSoundLooping : this.loseSoundLooping;
        }

        setMessage(win: boolean, message: string, explicit: boolean) {
            if (!explicit && this.messageSetByUser) return;
            if (win) this.winMessage = message;
            else this.loseMessage = message;
            if (explicit) this.messageSetByUser = true;
        }
        getMessage(win: boolean, preferMultiplayer?: boolean) {
            if (this.messageSetByUser)
                return win ? this.winMessage : this.loseMessage;
            else if (preferMultiplayer)
                return win ? this.winMessageMultiplayer : this.loseMessage;
            else
                return win ? this.winMessage : this.loseMessage;
        }
    }

    let _gameOverConfig: GameOverConfig;
    export const gameOverConfig = () => {
        if (!_gameOverConfig) _gameOverConfig = new GameOverConfig();
        return _gameOverConfig;
    }

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
     * @param win whether the effect should run on a win (true) or lose (false)
     * @param effect
     */
    //% blockId=game_setgameovereffect
    //% block="use effect $effect for $win"
    //% effect.defl=effects.confetti
    //% win.shadow=toggleWinLose
    //% win.defl=true
    //% group="Game Over"
    //% weight=90
    //% blockGap=8
    //% help=game/set-game-over-effect
    export function setGameOverEffect(win: boolean, effect: effects.BackgroundEffect) {
        init();
        const goc = game.gameOverConfig();
        goc.setEffect(win, effect, true);
    }

    /**
     * Set the music that occurs when the game is over
     * @param win whether the sound should play on a win (true) or lose (false)
     * @param effect
     */
    //% blockId=game_setgameoverplayable
    //% block="use $sound looping $looping for $win"
    //% sound.shadow=music_melody_playable
    //% sound.defl=music.powerUp
    //% looping.shadow=toggleOnOff
    //% looping.defl=false
    //% win.shadow=toggleWinLose
    //% win.defl=true
    //% group="Game Over"
    //% weight=80
    //% blockGap=8
    //% help=game/set-game-over-sound
    export function setGameOverPlayable(win: boolean, sound: music.Playable, looping: boolean) {
        init();
        const goc = game.gameOverConfig();
        goc.setSound(win, sound, looping, true);
    }

    // Legacy api. Older extensions may still use this.
    export function setGameOverSound(win: boolean, sound: music.Melody) {
        init();
        const goc = game.gameOverConfig();
        goc.setSound(win, music.melodyPlayable(sound), false, true);
    }

    /**
     * Set the message that displays when the game is over
     * @param win whether the message should show on a win (true) or lose (false)
     * @param message 
     */
    //% blockId=game_setgameovermessage
    //% block="use message $message for $win"
    //% message.defl="GAME OVER!"
    //% win.shadow=toggleWinLose
    //% win.defl=true
    //% group="Game Over"
    //% weight=70
    //% blockGap=8
    //% help=game/set-game-over-message
    export function setGameOverMessage(win: boolean, message: string) {
        init();
        const goc = game.gameOverConfig();
        goc.setMessage(win, message, true);
    }

    /**
     * Set the method of judging the best score for the game
     * @param type the scoring type
     */
    //% blockId=game_setgameoverscoringtype
    //% block="use $type as best score"
    //% type.defl=ScoringType.HighScore
    //% group="Game Over"
    //% weight=60
    //% blockGap=8
    //% help=game/set-game-over-scoring-type
    export function setGameOverScoringType(type: ScoringType) {
        init();
        const goc = game.gameOverConfig();
        goc.setScoringType(type, true);
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
    //% deprecated=true
    export function over(win: boolean = false, effect?: effects.BackgroundEffect) {
        // Match legacy behavior unless effect was set by user
        const goc = game.gameOverConfig();
        goc.setEffect(win, effect, false);
        _gameOverImpl(win);
    }

    //% blockId=gameOver2 block="game over $win"
    //% win.shadow=toggleWinLose
    //% win.defl=true
    //% weight=100
    //% blockGap=8
    //% help=game/over
    //% group="Game Over"
    export function gameOver(win: boolean) {
        _gameOverImpl(win);
    }

    export function gameOverPlayerWin(player: number) {
        _gameOverImpl(true, player);
    }

    function _gameOverImpl(win: boolean, winnerOverride?: number) {
        init();
        if (__isOver) return;
        __isOver = true;

        if (__gameOverHandler) {
            __gameOverHandler(win);
        } else {
            const goc = game.gameOverConfig();

            const judged = !winnerOverride && goc.scoringType !== ScoringType.None;
            const playersWithScores = info.playersWithScores();
            const prevBestScore = judged && info.highScore();
            const winner = judged && win && info.winningPlayer();
            const scores = playersWithScores.map(player => new GameOverPlayerScore(player.number, player.impl.score(), player === winner));

            // Save all scores. Dependency Note: this action triggers Kiosk to exit the simulator and show the high score screen.
            info.saveAllScores();

            // Save high score if this was a judged game and there was a winner (don't save in the LOSE case).
            if (judged && winner) {
                info.saveHighScore();
            }

            const preferMultiplayer = !!winnerOverride || (judged && info.multiplayerScoring());
            const message = goc.getMessage(win, preferMultiplayer);
            const effect = goc.getEffect(win);
            const sound = goc.getSound(win);
            const looping = goc.getSoundLooping(win);
            const playbackMode = looping ? music.PlaybackMode.LoopingInBackground : music.PlaybackMode.InBackground;

            // releasing memory and clear fibers. Do not add anything that releases the fiber until background is set below,
            // or screen will be cleared on the new frame and will not appear as background in the game over screen.
            while (_sceneStack && _sceneStack.length) {
                _scene.destroy();
                popScene();
            }
            pushScene();
            scene.setBackgroundImage(screen.clone());

            if (sound) music.play(sound, playbackMode);
            if (effect) effect.startScreenEffect();

            pause(400);

            const overDialog = new GameOverDialog(win, message, judged, scores, prevBestScore, winnerOverride);
            scene.createRenderable(scene.HUD_Z, target => {
                overDialog.update();
                target.drawTransparentImage(
                    overDialog.image,
                    0,
                    (screen.height - overDialog.image.height) >> 1
                );
            });

            pause(500); // wait for users to stop pressing keys
            overDialog.displayCursor();
            waitAnyButton();
            control.reset();
        }
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
