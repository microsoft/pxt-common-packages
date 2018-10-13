//% groups='["other","Multiplayer"]'
namespace info {

    enum Visibility {
        None = 0,
        ScoreOne = 1 << 0,
        ScoreTwo = 1 << 1,
        LifeOne = 1 << 2,
        LifeTwo = 1 << 3,
        PlayerOne = 1 << 4,
        PlayerTwo = 1 << 5,
        All = ~(~0 << 6)
    }

    let _scores: number[] = null;
    let _lives: number[] = null;
    // let _life: number = null;
    let _multiplayerHud: boolean = false;
    let _visibilityFlag: number = Visibility.None;
    // let _gameEnd: number = undefined;
    let _heartImage: Image;
    let _multiplierImage: Image;
    let _bgColor: number;
    let _borderColor: number;
    let _fontColor: number;

    function updateFlag(flag: Visibility, on: boolean) {
        if (on) _visibilityFlag |= flag;
        else _visibilityFlag &= Visibility.All ^ flag;
    }

    function initMultiplayerHUD() {
        if (_multiplayerHud) return;
        _multiplayerHud = true;

        // suppress standard score and life display
        showScore(false);
        showLife(false);

        _heartImage = defaultHeartImage();

        _multiplierImage = _multiplierImage || img`
                . . . . .
                1 . . . 1
                . 1 . 1 .
                . . 1 . .
                . 1 . 1 .
                1 . . . 1
            `;

        _bgColor = info.backgroundColor();
        _borderColor = info.borderColor();
        _fontColor = info.fontColor();
        game.eventContext().registerFrameHandler(95, () => {
            // show score
            if (_visibilityFlag & Visibility.ScoreOne) {
                drawPlayerScore(controller.PlayerNumber.One);
            }
            if (_visibilityFlag & Visibility.ScoreTwo) {
                drawPlayerScore(controller.PlayerNumber.Two);
            }

            // show life
            if (_visibilityFlag & Visibility.LifeOne) {
                drawPlayerLives(controller.PlayerNumber.One);
            }
            if (_visibilityFlag & Visibility.LifeTwo) {
                drawPlayerLives(controller.PlayerNumber.One);
            }

            // TODO: add playerLifeOverHandlers
            // * need to keep bool array of what is 'alive'; nums in array not nullable like outside of array
            // Maybe store as interface:
            // interface LifeOver {
            //     h: () => void; // handler event
            //     a: boolean; // whether player is currently alive
            // }
            // if (_life <= 0) {
            //     if (_lifeOverHandler) {
            //         _lifeOverHandler();
            //     }
            //     _life = 0;
            //     _isAlive = false
            // }

            // TODO: show player number
            // }
        })
    }

    function defaultHeartImage() {
        return screen.isMono ?
                img`
                    . 1 1 . 1 1 .
                    1 . . 1 . . 1
                    1 . . . . . 1
                    . 1 . . . 1 .
                    . . 1 . 1 . .
                    . . . 1 . . .
                `
                :
                img`
                    . c 2 . 2 2 .
                    c 2 2 2 4 2 2
                    c 2 2 4 2 2 2
                    . c 2 2 2 2 .
                    . . c 2 2 . .
                    . . . c . . .
                `;
    }


    function initPlayer(player: controller.PlayerNumber) {
        // TODO
        // red (player one) and blue (player two), or maybe just border color with bkgd color for font
    }

    function initPlayerScore(player: controller.PlayerNumber) {
        if (player === controller.PlayerNumber.One) {
            updateFlag(Visibility.ScoreOne, true);
        } else if (player === controller.PlayerNumber.Two) {
            updateFlag(Visibility.ScoreTwo, true);
        }
        if (!_scores) {
            _scores = [];
            _scores[player] = 0;
            saveMultiplayerHighScore();
            initPlayer(player);
            initMultiplayerHUD();
        }
    }

    function initPlayerLife(player: controller.PlayerNumber) {
        if (player === controller.PlayerNumber.One) {
            updateFlag(Visibility.LifeOne, true);
        } else if (player === controller.PlayerNumber.Two) {
            updateFlag(Visibility.LifeTwo, true);
        }

        if (!_lives) {
            _lives = [];
            _lives[player] = 3;
            initPlayer(player);
            initMultiplayerHUD();
        }
    }

    /**
     * Updates the high score based on the scores of all players
     */
    export function saveMultiplayerHighScore() {
        if (_scores) {
            let oldScore = score();
            let maxScore = info.highScore();
            for (let i = 0; i < _scores.length; i++) {
                if (maxScore && _scores[i] != null) {
                    maxScore = Math.max(maxScore, _scores[i]);
                }
            }
            setScore(maxScore);
            saveHighScore();
            setScore(oldScore);
        }
    }

    /**
     * Get the current score for the given player if any
     */
    //% weight=95 blockGap=8 group="Multiplayer"
    //% blockId=local_playerScore block="$player score"
    export function playerScore(player: controller.PlayerNumber): number {
        initPlayerScore(player);
        return _scores[player];
    }

    /**
     * Set the score of a given player
     * @param player the player
     * @param value the score to set the player to
     */
    //% weight=93 blockGap=8 group="Multiplayer"
    //% blockId=local_setPlayerScore block="set $player score to $value"
    export function setPlayerScore(player: controller.PlayerNumber, value: number) {
        initPlayerScore(player);
        _scores[player] = value | 0;
    }

    /**
     * Change the score of a given player by the given amount
     * @param player the player
     * @param value the amount of change, eg: 1
     */
    //% weight=92 group="Multiplayer"
    //% blockId=local_changePlayerScoreBy block="change $player score by $value"
    export function changePlayerScoreBy(player: controller.PlayerNumber, value: number) {
        initPlayerScore(player);
        setPlayerScore(player, _scores[player] + value);
    }

    /**
     * Get the number of lives for the given player
     * @param player the chosen player
     */
    //% weight=85 blockGap=8 group="Multiplayer"
    //% blockId=local_life block="$player life"
    export function playerLife(player: controller.PlayerNumber) {
        initPlayerLife(player);
        return _lives[player];
    }


    /**
     * Set the number of lives for the given player
     * @param player the chosen player
     * @param value the number of lives, eg: 3
     */
    //% weight=84 blockGap=8 group="Multiplayer"
    //% blockId=local_setLife block="set $player life to %value"
    export function setPlayerLife(player: controller.PlayerNumber, value: number) {
        initPlayerLife(player);
        _lives[player] = value | 0;
    }

    /**
     * Change the lives by the given amount
     * @param player the chosen player
     * @param value the change of lives, eg: -1
     */
    //% weight=83 group="Multiplayer"
    //% blockId=local_changeLifeBy block="change $player life by %value"
    export function changePlayerLifeBy(player: controller.PlayerNumber, value: number) {
        initPlayerLife(player);
        setPlayerLife(player, _lives[player] + value);
    }

    // Only players one and two will have their score and lives displayed on screen.

    function drawPlayerScore(player: controller.PlayerNumber) {
        const s = playerScore(player);
        const font = image.font5;
        const offsetY = 1;
        const num = s.toString();
        const width = num.length * font.charWidth;

        if (player === controller.PlayerNumber.One) {
            screen.fillRect(0, 0, width + 2, font.charHeight + 3, _borderColor);
            screen.fillRect(0, 0, width + 1, font.charHeight + 2, _bgColor);
            screen.print(num, 1, offsetY, _fontColor, font);
        } else if (player === controller.PlayerNumber.Two) {
            screen.fillRect(screen.width - width - 2, 0, width + 2, font.charHeight + 3, _borderColor);
            screen.fillRect(screen.width - width - 1, 0, width + 1, font.charHeight + 2, _bgColor);
            screen.print(num, screen.width - width, offsetY, _fontColor, font);
        }
    }

    function drawPlayerLives(player: controller.PlayerNumber) {
        if (_lives[player] <= 0) return;

        const font = image.font5;
        const num = _lives[player].toString();
        const textWidth = num.length * font.charWidth;
        let offsetY: number;
        if (player == controller.PlayerNumber.One && Visibility.ScoreOne & _visibilityFlag
                || player == controller.PlayerNumber.Two && Visibility.ScoreTwo & _visibilityFlag) {
            offsetY = font.charHeight + 3;
        } else {
            offsetY = 0;
        }
        let mult = _multiplierImage.clone();
        mult.replace(1, _fontColor);

        // TODOS
        // * currently set for player one only; add shift for player two
        // * Remove border between life and score
        // * One larger box for score and drawPlayerLives; probably refactor drawPlayerLives
        //      and drawPlayerScore into drawPlayerData w/ lives, score, and player icon all at once
        screen.fillRect(0, offsetY - 1, _heartImage.width + _multiplierImage.width + textWidth + 4, _heartImage.height + 4, _borderColor)
        screen.fillRect(0, offsetY, _heartImage.width + _multiplierImage.width + textWidth + 3, _heartImage.height + 2, _bgColor)
        screen.drawTransparentImage(_heartImage, 1, offsetY + 1);

        screen.drawTransparentImage(mult, _heartImage.width + 2, offsetY + font.charHeight - _multiplierImage.height + 2);
        screen.print(num, _heartImage.width + 3 + _multiplierImage.width, offsetY + 2, _fontColor, font);
    }
}