//% groups='["other","Multiplayer"]'
namespace info {

    enum Visibility {
        None = 0,
        ScoreOne = 1 << 0,
        ScoreTwo = 1 << 1,
        LifeOne = 1 << 2,
        LifeTwo = 1 << 3,
        All = ~(~0 << 4)
    }

    let _scores: number[] = null;
    // let _life: number = null;
    let _multiplayerHud: boolean = false;
    let _visibilityFlag: number = Visibility.None;
    // let _gameEnd: number = undefined;
    // let _heartImage: Image;
    // let _multiplierImage: Image;
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

        // _heartImage = _heartImage || defaultHeartImage();

        // _multiplierImage = _multiplierImage || img`
        //     1 . 1
        //     . 1 .
        //     1 . 1
        // `;

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
            // if (_life !== null) {
            //     drawLives();
            //     if (_life <= 0) {
            //         if (_lifeOverHandler) {
            //             _lifeOverHandler();
            //         }
            //         else {
            //             game.over();
            //         }
            //         _life = null;
            //     }
            // }
            // show player number
            // TODO
            // }
        })
    }

    function initPlayer(player: controller.PlayerNumber) {
        // TODO
    }

    function initPlayerScore(player: controller.PlayerNumber) {
        if (player === controller.PlayerNumber.One) {
            updateFlag(Visibility.ScoreOne, true);
        } else if (player === controller.PlayerNumber.Two) {
            updateFlag(Visibility.ScoreTwo, true);
        }
        if (_scores) return;

        _scores = [];
        _scores[player] = 0;
        saveMultiplayerHighScore();
        initPlayer(player);
        initMultiplayerHUD();
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

    // Only players one and two will have their score and lives displayed on screen.

    function drawPlayerScore(player: controller.PlayerNumber) {
        const s = playerScore(player);
        const font = image.font5;
        const offsetY = 1;
        const num = s.toString();
        const width = num.length * font.charWidth;

        if (player === controller.PlayerNumber.One) {
            screen.fillRect(0, 0, width + 2, image.font5.charHeight + 3, _borderColor);
            screen.fillRect(0, 0, width + 1, image.font5.charHeight + 2, _bgColor);
            screen.print(num, 1, offsetY, _fontColor, font);
        } else if (player === controller.PlayerNumber.Two) {
            screen.fillRect(screen.width - width - 2, 0, screen.width, image.font5.charHeight + 3, _borderColor);
            screen.fillRect(screen.width - width - 1, 0, screen.width, image.font5.charHeight + 2, _bgColor);
            screen.print(num, screen.width - width, offsetY, _fontColor, font);
        }
    }
}