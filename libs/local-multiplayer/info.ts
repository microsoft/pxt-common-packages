//% groups='["other","Multiplayer"]'
namespace info {

    /** Only players one and two will have their score and lives displayed on screen
     * others will only be stored. Only players one and two are defined in the blocks
     * for  this reason
     */
    export enum PlayerNumber {
        //% block="player one"
        One = 1,
        //% block="player two"
        Two,
        Three,
        Four
    }

    let _scores: number[] = null;
    let _life: number = null;
    let _hud: boolean = false;
    let _gameEnd: number = undefined;
    let _heartImage: Image;
    let _multiplierImage: Image;
    let _bgColor: number;
    let _borderColor: number;
    let _fontColor: number;


    function initHUD() {
        if (_hud) return;
        _hud = true;

        // suppress standard score and life display
        showScore(false);
        showLife(false);

        // _heartImage = _heartImage || defaultHeartImage();

        _multiplierImage = _multiplierImage || img`
            1 . 1
            . 1 .
            1 . 1
        `;

        _bgColor = info.backgroundColor();
        _borderColor = info.borderColor();;
        _fontColor = info.fontColor();
        game.eventContext().registerFrameHandler(95, () => {
            for (let player = 1; player <= 2; player++) {
                // show score
                if (_scores && _scores[player] !== null) {
                    drawPlayerScore(player);
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
            }
        })
    }

    function initPlayer(player: PlayerNumber) {
        // TODO
    }

    function initPlayerScore(player: PlayerNumber) {
        if (_scores === null) _scores = [];
        else if (_scores[player]) return;
        
        _scores[player] = 0;
        saveMultiplayerHighScore();
        initPlayer(player);
    }

    /**
     * Updates the high score based on the scores of all players
     */
    export function saveMultiplayerHighScore() {
        if (_scores) {
            let oldScore = score();
            let maxScore = info.highScore();
            for (let i = 0; i < _scores.length; i++) {
                if (maxScore && _scores[i]) {
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
    //% blockId=local_playerScore block="score"
    export function playerScore(player: PlayerNumber): number {
        initPlayerScore(player);
        return _scores[player] || 0;
    }

    /**
     * Set the score of a given player
     * @param player the player
     * @param value the score to set the player to
     */
    //% weight=93 blockGap=8 group="Multiplayer"
    //% blockId=local_setPlayerScore block="set $player score to $value"
    export function setPlayerScore(player: PlayerNumber, value: number) {
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
    export function changePlayerScoreBy(player: PlayerNumber, value: number) {
        initPlayerScore(player);
        setScore(_scores[player] + value);
    }

    function drawPlayerScore(player: PlayerNumber) {
        const s = score() | 0;

        let font: image.Font;
        let offsetY = 2;
        font = image.font5;

        const num = s.toString();
        const width = num.length * font.charWidth;

        screen.fillRect(screen.width - width - 2, 0, screen.width, image.font5.charHeight + 3, _borderColor)
        screen.fillRect(screen.width - width - 1, 0, screen.width, image.font5.charHeight + 2, _bgColor)
        screen.print(num, screen.width - width, offsetY, _fontColor, font);
    }
}