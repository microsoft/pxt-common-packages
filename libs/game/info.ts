
/**
 * Head-up display
 *
*/
//% color=#AA5585 weight=80 icon="\uf2bb" blockGap=8
//% groups='["Score", "Life", "Countdown", "Multi Player"]'
namespace info {

    enum Visibility {
        None = 0,
        Countdown = 1 << 0,
        Score = 1 << 1,
        Life = 1 << 2,
        All = Countdown | Score | Life,
        Hud = 1 << 4,
        Multi = 1 << 5
    }

    let _players: PlayerInfo[];
    let _visibilityFlag: number = Visibility.None;

    let _gameEnd: number = undefined;
    let _heartImage: Image;
    let _multiplierImage: Image;
    let _bgColor: number;
    let _borderColor: number;
    let _fontColor: number;
    let _countdownExpired: boolean;

    let _countdownEndHandler: () => void;

    //% fixedInstance whenUsed block="player 1"
    function player1(): PlayerInfo {
        if (!_players || !_players[0])
            new PlayerInfo(1);
        return _players[0];
    }

    function initHUD() {
        if ((_visibilityFlag & Visibility.Hud)
            || (_visibilityFlag && Visibility.Multi)) return;
        _visibilityFlag |= Visibility.Hud;

        _heartImage = _heartImage || defaultHeartImage();
        _multiplierImage = _multiplierImage || img`
        1 . . . 1
        . 1 . 1 .
        . . 1 . .
        . 1 . 1 .
        1 . . . 1
        `;
        _bgColor = screen.isMono ? 0 : 1;
        _borderColor = screen.isMono ? 1 : 3;
        _fontColor = screen.isMono ? 1 : 3;
        game.eventContext().registerFrameHandler(95, () => {
            control.enablePerfCounter("info")
            if (_visibilityFlag & Visibility.Multi) {
                const ps = _players.filter(p => !!p);
                // First draw players
                ps.forEach(p => p.drawPlayer());
                // Then run life over events
                ps.forEach(p => p.raiseLifeZero(false));
            } else {
                // show score
                const p = player1();
                if (p._score !== null && (_visibilityFlag & Visibility.Score)) {
                    p.drawScore();
                }
                // show life
                if (p._life !== null && (_visibilityFlag & Visibility.Life)) {
                    p.drawLives();
                }
                p.raiseLifeZero(true);
                // show countdown
                if (_gameEnd !== undefined && _visibilityFlag & Visibility.Countdown) {
                    drawTimer(_gameEnd - control.millis())
                    let t = Math.max(0, _gameEnd - control.millis()) / 1000;
                    if (t <= 0) {
                        t = 0;
                        if (!_countdownExpired) {
                            _countdownExpired = true;
                            if (_countdownEndHandler) {
                                _countdownEndHandler();
                            }
                            else {
                                game.over();
                            }
                        }
                    }
                }
            }
        })
    }

    function defaultHeartImage() {
        return screen.isMono ?
            img`
        . 1 1 . 1 1 . .
        1 . . 1 . . 1 .
        1 . . . . . 1 .
        1 . . . . . 1 .
        . 1 . . . 1 . .
        . . 1 . 1 . . .
        . . . 1 . . . .
`         :
            img`
        . c 2 2 . 2 2 .
        c 2 2 2 2 2 4 2
        c 2 2 2 2 4 2 2
        c 2 2 2 2 2 2 2
        . c 2 2 2 2 2 .
        . . c 2 2 2 . .
        . . . c 2 . . .
        `;

    }

    export function saveHighScore() {
        if (_players) {
            let hs = 0;
            _players.filter(p => p && !!p._score).forEach(p => hs = Math.max(hs, p._score));
            updateHighScore(hs);
        }
    }

    /**
     * Get the current score if any
     */
    //% weight=95 blockGap=8
    //% blockId=hudScore block="score"
    //% help=info/score
    //% group="Score"
    export function score() {
        return player1().score;
    }

    //%
    //% group="Score"
    export function hasScore() {
        return player1()._score !== null
    }

    /**
     * Get the last recorded high score
     */
    //% weight=94
    //% blockId=highScore block="high score"
    //% help=info/high-score
    //% group="Score"
    export function highScore(): number {
        return updateHighScore(0) || 0;
    }

    /**
     * Set the score
     */
    //% weight=93 blockGap=8
    //% blockId=hudsetScore block="set score to %value"
    //% help=info/set-score
    //% group="Score"
    export function setScore(value: number) {
        player1().score = value;
    }

    /**
     * Change the score by the given amount
     * @param value the amount of change, eg: 1
     */
    //% weight=92
    //% blockId=hudChangeScoreBy block="change score by %value"
    //% help=info/change-score-by
    //% group="Score"
    export function changeScoreBy(value: number) {
        player1().score += value;
    }


    /**
     * Get the number of lives
     */
    //% weight=85 blockGap=8
    //% blockId=hudLife block="life"
    //% help=info/life
    //% group="Life"
    export function life() {
        return player1().life;
    }

    //% group="Life"
    export function hasLife() {
        return player1().hasLife();
    }

    /**
     * Set the number of lives
     * @param value the number of lives, eg: 3
     */
    //% weight=84 blockGap=8
    //% blockId=hudSetLife block="set life to %value"
    //% help=info/set-life
    //% group="Life"
    export function setLife(value: number) {
        player1().life = value;
    }

    /**
     * Change the lives by the given amount
     * @param value the change of lives, eg: -1
     */
    //% weight=83
    //% blockId=hudChangeLifeBy block="change life by %value"
    //% help=info/change-life-by
    //% group="Life"
    export function changeLifeBy(value: number) {
        player1().life += value;
    }

    /**
     * Run code when the player's life reaches 0. If this function
     * is not called then game.over() is called instead
     */
    //% weight=82
    //% blockId=gamelifeevent block="on life zero"
    //% help=info/on-life-zero
    //% group="Life"
    export function onLifeZero(handler: () => void) {
        player1().onLifeZero(handler);
    }

    /**
     * Start a countdown of the given duration in seconds
     * @param duration the duration of the countdown, eg: 10
     */
    //% blockId=gamecountdown block="start countdown %duration (s)"
    //% help=info/start-countdown weight=79 blockGap=8
    //% group="Countdown"
    export function startCountdown(duration: number) {
        initHUD();
        _gameEnd = control.millis() + duration * 1000;
        updateFlag(Visibility.Countdown, true);
        _countdownExpired = false;
    }

    /**
     * Stop the current countdown and hides the timer display
     */
    //% blockId=gamestopcountdown block="stop countdown" weight=78
    //% help=info/stop-countdown
    //% group="Countdown"
    export function stopCountdown() {
        _gameEnd = undefined;
        updateFlag(Visibility.Countdown, false);
        _countdownExpired = true;
    }

    /**
     * Run code when the countdown reaches 0. If this function
     * is not called then game.over() is called instead
     */
    //% blockId=gamecountdownevent block="on countdown end" weight=77
    //% help=info/on-countdown-end
    //% group="Countdown"
    export function onCountdownEnd(handler: () => void) {
        _countdownEndHandler = handler;
    }

    /**
     * Replaces the image used to represent the player's lives. Images
     * should be no larger than 8x8
     */
    //% group="Life"
    export function setLifeImage(image: Image) {
        _heartImage = image;
    }

    /**
     * Set whether life should be displayed
     * @param on if true, lives are shown; otherwise, lives are hidden
     */
    //% group="Life"
    export function showLife(on: boolean) {
        updateFlag(Visibility.Life, on);
    }

    /**
     * Set whether score should be displayed
     * @param on if true, score is shown; otherwise, score is hidden
     */
    //% group="Score"
    export function showScore(on: boolean) {
        updateFlag(Visibility.Score, on);
    }

    /**
     * Set whether score should be displayed
     * @param on if true, score is shown; otherwise, score is hidden
     */
    //% group="Countdown"
    export function showCountdown(on: boolean) {
        updateFlag(Visibility.Countdown, on);
    }

    function updateFlag(flag: Visibility, on: boolean) {
        if (on) _visibilityFlag |= flag;
        else _visibilityFlag = ~(~_visibilityFlag | flag);
        initHUD();
    }

    /**
     * Sets the color of the borders around the score, countdown, and life
     * elements. Defaults to 3
     * @param color The index of the color (0-15)
     */
    //% group="Theme"
    export function setBorderColor(color: number) {
        _borderColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Sets the color of the background of the score, countdown, and life
     * elements. Defaults to 1
     * @param color The index of the color (0-15)
     */
    //% group="Theme"
    export function setBackgroundColor(color: number) {
        _bgColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Sets the color of the text used in the score, countdown, and life
     * elements. Defaults to 3
     * @param color The index of the color (0-15)
     */
    //% group="Theme"
    export function setFontColor(color: number) {
        _fontColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Get the current color of the borders around the score, countdown, and life
     * elements
     */
    //% group="Theme"
    export function borderColor(): number {
        return _borderColor ? _borderColor : 3;
    }

    /**
     * Get the current color of the background of the score, countdown, and life
     * elements
     */
    //% group="Theme"
    export function backgroundColor(): number {
        return _bgColor ? _bgColor : 1;
    }

    /**
     * Get the current color of the text usded in the score, countdown, and life
     * elements
     */
    //% group="Theme"
    export function fontColor(): number {
        return _fontColor ? _fontColor : 3;
    }

    function drawTimer(millis: number) {
        if (millis < 0) millis = 0;
        millis |= 0;

        const font = image.font8;
        const smallFont = image.font5;
        const seconds = Math.idiv(millis, 1000);
        const width = font.charWidth * 5 - 2;
        let left = (screen.width >> 1) - (width >> 1) + 1;
        let color1 = _fontColor;
        let color2 = _bgColor;

        if (seconds < 10 && (seconds & 1) && !screen.isMono) {
            const temp = color1;
            color1 = color2;
            color2 = temp;
        }

        screen.fillRect(left - 3, 0, width + 6, font.charHeight + 3, _borderColor)
        screen.fillRect(left - 2, 0, width + 4, font.charHeight + 2, color2)


        if (seconds < 60) {
            left += 3
            const top = 1;
            const remainder = Math.idiv(millis % 1000, 10);

            screen.print(formatDecimal(seconds) + ".", left, top, color1, font)
            const decimalLeft = left + 3 * font.charWidth - 2;
            screen.print(formatDecimal(remainder), decimalLeft, top + 2, color1, smallFont)
        }
        else {
            const minutes = Math.idiv(seconds, 60);
            const remainder = seconds % 60;
            screen.print(formatDecimal(minutes) + ":" + formatDecimal(remainder), left, 1, color1, font);
        }
    }

    //% fixedInstances
    export class PlayerInfo {
        _score: number;
        _life: number;
        _player: number;
        bg: number; // background color
        border: number; // border color
        fc: number; // font color
        showScore?: boolean;
        showLife?: boolean;
        showPlayer?: boolean;
        private _lifeZeroHandler?: () => void; // onPlayerLifeOver handler
        x?: number;
        y?: number;
        left?: boolean; // if true banner goes from x to the left, else goes rightward
        up?: boolean; // if true banner goes from y up, else goes downward

        constructor(player: number) {
            this._player = player;
            this.border = 1;
            this.fc = 1;
            this._life = null;
            this._score = null;
            if (this._player === 1) {
                // Top left, and banner is white on red
                this.bg = screen.isMono ? 0 : 2;
                this.x = 0;
                this.y = 0;
            } else if (player === 2) {
                // Top right, and banner is white on blue
                this.bg = screen.isMono ? 0 : 8;
                this.x = screen.width;
                this.y = 0;
                this.left = true;
            } else if (player === 3) {
                this.bg = screen.isMono ? 0 : 4;
                this.x = 0;
                this.y = screen.height;
                this.up = true;
            } else {
                // Not displayed by default, bottom left, banner is white on green
                this.bg = screen.isMono ? 0 : 7;
                this.x = screen.width;
                this.y = screen.height;
                this.left = true;
                this.up = true;
            }

            // init hud
            if (!_players)
                _players = [];
            _players[this._player - 1] = this;
            if (this._player == 1)
                initHUD();
            else
                initMultiplayerHUD();
        }

        /**
         * Gets the player score
         */
        //% group="Multi Player"
        //% blockCombine block="score"
        get score() {
            if (this.showScore === null) this.showScore = true;
            if (this.showPlayer === null) this.showPlayer = true;

            if (!this._score) {
                this._score = 0;
                saveHighScore();
            }
            return this._score;
        }

        /**
         * Sets the player score
         */
        //% group="Multi Player"
        //% blockCombine block="score"
        set score(value: number) {
            updateFlag(Visibility.Score, true);
            this._score = (value | 0);
        }

        /**
         * Gets the player life
         */
        //% group="Multi Player"
        //% blockCombine block="life"
        get life() {
            if (this.showLife === null) this.showLife = true;
            if (this.showPlayer === null) this.showPlayer = true;

            if (this._life === null) {
                this._life = 3;
            }
            return this._life;
        }

        /**
         * Sets the player life
         */
        //% group="Multi Player"
        //% blockCombine block="life"
        set life(value: number) {
            updateFlag(Visibility.Life, true);
            this._life = (value | 0);
        }

        /**
         * Returns true if the given player currently has a value set for health,
         * and false otherwise.
         * @param player player to check life of
         */
        //% group="Multi Player"
        //% blockId=playerinfolifeset block="%player has life"
        hasLife(): boolean {
            return this.life !== null;
        }

        /**
         * Runs code when life reaches zero
         * @param handler 
         */
        //% group="Multi Player"
        //% blockId=playerinfoonlifezero block="on %player life zero"
        onLifeZero(handler: () => void) {
            this._lifeZeroHandler = handler;
        }

        raiseLifeZero(gameOver: boolean) {
            if (this._life !== null && this._life <= 0) {
                this._life = null;
                if (this._lifeZeroHandler) this._lifeZeroHandler();
                else if (gameOver) game.over();
            }
        }

        drawPlayer() {
            const font = image.font5;
            let score: string;
            let life: string;
            let height = 4;
            let scoreWidth = 0;
            let lifeWidth = 0;
            const offsetX = 1;
            let offsetY = 2;
            let showScore = this.showScore && this._score !== null
            let showLife = this.showLife && this._life !== null;

            if (showScore) {
                score = "" + this.score;
                scoreWidth = score.length * font.charWidth + 3;
                height += font.charHeight;
                offsetY += font.charHeight + 1;
            }

            if (showLife) {
                life = "" + this.life;
                lifeWidth = _heartImage.width + _multiplierImage.width + life.length * font.charWidth + 3;
                height += _heartImage.height;
            }

            const width = Math.max(scoreWidth, lifeWidth);

            // bump size for space between lines
            if (showScore && showLife) height++;

            const x = this.x - (this.left ? width : 0);
            const y = this.y - (this.up ? height : 0);

            // Bordered Box
            if (showScore || showLife) {
                screen.fillRect(x, y, width, height, this.border);
                screen.fillRect(x + 1, y + 1, width - 2, height - 2, this.bg);
            }

            // print score
            if (showScore) {
                const bump = this.left ? width - scoreWidth : 0;
                screen.print(score, x + offsetX + bump + 1, y + 2, this.fc, font);
            }

            // print life
            if (showLife) {
                const xLoc = x + offsetX + (this.left ? width - lifeWidth : 0);

                let mult = _multiplierImage.clone();
                mult.replace(1, this.fc);

                screen.drawTransparentImage(_heartImage,
                    xLoc,
                    y + offsetY);
                screen.drawTransparentImage(mult,
                    xLoc + _heartImage.width,
                    y + offsetY + font.charHeight - _multiplierImage.height - 1);
                screen.print(life,
                    xLoc + _heartImage.width + _multiplierImage.width + 1,
                    y + offsetY,
                    this.fc,
                    font);
            }

            // print player icon
            if (this.showPlayer) {
                const pNum = "" + this._player;

                let iconWidth = pNum.length * font.charWidth + 1;
                const iconHeight = Math.max(height, font.charHeight + 2);
                let iconX = this.left ? (x - iconWidth + 1) : (x + width - 1);
                let iconY = y;

                // adjustments when only player icon shown
                if (!showScore && !showLife) {
                    iconX += this.left ? -1 : 1;
                    if (this.up) iconY -= 3;
                }

                screen.fillRect(iconX, iconY, iconWidth, iconHeight, this.border);
                screen.print(pNum, iconX + 1, iconY + (iconHeight >> 1) - (font.charHeight >> 1), this.bg, font);
            }
        }

        drawScore() {
            const s = this.score | 0;

            let font: image.Font;
            let offsetY: number;
            if (s >= 1000000) {
                offsetY = 2;
                font = image.font5;
            }
            else {
                offsetY = 1;
                font = image.font8;
            }

            const num = s.toString();
            const width = num.length * font.charWidth;

            screen.fillRect(screen.width - width - 2, 0, screen.width, image.font8.charHeight + 3, _borderColor)
            screen.fillRect(screen.width - width - 1, 0, screen.width, image.font8.charHeight + 2, _bgColor)
            screen.print(num, screen.width - width, offsetY, _fontColor, font);
        }

        drawLives() {
            if (this._life < 0) return;
            const font = image.font8;
            if (this._life <= 4) {
                screen.fillRect(0, 0, this._life * (_heartImage.width + 1) + 3, _heartImage.height + 4, _borderColor);
                screen.fillRect(0, 0, this._life * (_heartImage.width + 1) + 2, _heartImage.height + 3, _bgColor);
                for (let i = 0; i < this._life; i++) {
                    screen.drawTransparentImage(_heartImage, 1 + i * (_heartImage.width + 1), 1);
                }
            }
            else {
                const num = this._life.toString();
                const textWidth = num.length * font.charWidth - 1;
                screen.fillRect(0, 0, _heartImage.width + _multiplierImage.width + textWidth + 5, _heartImage.height + 4, _borderColor)
                screen.fillRect(0, 0, _heartImage.width + _multiplierImage.width + textWidth + 4, _heartImage.height + 3, _bgColor)
                screen.drawTransparentImage(_heartImage, 1, 1);

                let mult = _multiplierImage.clone();
                mult.replace(1, _fontColor);

                screen.drawTransparentImage(mult, _heartImage.width + 2, font.charHeight - _multiplierImage.height - 1);
                screen.print(num, _heartImage.width + 3 + _multiplierImage.width, 1, _fontColor, font);
            }
        }

    }

    function formatDecimal(val: number) {
        val |= 0;
        if (val < 10) {
            return "0" + val;
        }
        return val.toString();
    }

    function initMultiplayerHUD() {
        initHUD();
        if (_visibilityFlag & Visibility.Multi) return;
        _visibilityFlag |= Visibility.Multi;
        _heartImage = _heartImage || screen.isMono ?
            img`
                . . 1 . 1 . .
                . 1 . 1 . 1 .
                . 1 . . . 1 .
                . . 1 . 1 . .
                . . . 1 . . .
            `
            :
            img`
                . . 1 . 1 . .
                . 1 2 1 4 1 .
                . 1 2 4 2 1 .
                . . 1 2 1 . .
                . . . 1 . . .
            `;
        _multiplierImage = _multiplierImage || img`
                1 . 1
                . 1 .
                1 . 1
            `;
    }

    //% fixedInstance whenUsed block="player 2"
    export const player2 = new PlayerInfo(2);
    //% fixedInstance whenUsed block="player 3"
    export const player3 = new PlayerInfo(3);
    //% fixedInstance whenUsed block="player 4"
    export const player4 = new PlayerInfo(4);
}

declare namespace info {
    /**
     * Sends the current score and the new high score
     */
    //% shim=info::updateHighScore
    function updateHighScore(score: number): number;
}
