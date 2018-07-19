
/**
 * Head-up display
 *
*/
//% color=#AA5585 weight=80 icon="\uf2bb"
namespace info {
    let _score: number = null;
    let _highScore: number = null;
    let _life: number = null;
    let _hud: boolean = false;
    let _gameEnd: number = undefined;
    let _heartImage: Image;
    let _multiplierImage: Image;
    let _bgColor: number;
    let _borderColor: number;
    let _fontColor: number;
    let _countdownExpired: boolean;


    let _lifeOverHandler: () => void;
    let _countdownEndHandler: () => void;

    /**
     * Color of the HUD display
     */
    let color = 1;

    function initHUD() {
        if (_hud) return;
        _hud = true;

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
            // show score
            if (_score !== null) {
                drawScore();
            }
            // show life
            if (_life !== null) {
                drawLives();
                if (_life == 0) {
                    if (_lifeOverHandler) {
                        _lifeOverHandler();
                    }
                    else {
                        game.over();
                    }
                    _life = null;
                }
            }
            // show countdown
            if (_gameEnd !== undefined) {
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

    function initScore() {
        if (_score !== null) return
        _score = 0;
        _highScore = updateHighScore(_score);
        initHUD();
    }

    function initLife() {
        if (_life !== null) return
        _life = 3;
        initHUD();
    }

    /**
     * Ges the current score if any
     */
    //% weight=95 blockGap=8
    //% blockId=hudScore block="score"
    //% help=info/score
    export function score() {
        initScore()
        return _score || 0;
    }

    //%
    export function hasScore() {
        return _score !== null
    }

    /**
     * Get the last recorded high score
     */
    //% weight=94
    //% blockId=highScore block="high score"
    //% help=info/high-score
    export function highScore(): number {
        initScore();
        return _highScore || 0;
    }

    /**
     * Set the score
     */
    //% weight=93 blockGap=8
    //% blockId=hudsetScore block="set score to %value"
    //% help=info/set-score
    export function setScore(value: number) {
        initScore()
        _score = value | 0
    }

    /**
     * Change the score by the given amount
     * @param value the amount of change, eg: 1
     */
    //% weight=92
    //% blockId=hudChangeScoreBy block="change score by %value"
    //% help=info/change-score-by
    export function changeScoreBy(value: number) {
        initScore();
        setScore(_score + value)
    }

    /**
     * Updates the high score based on the current score
     */
    export function saveHighScore() {
        if (_score) {
            updateHighScore(_score);
        }
    }

    /**
     * Get the number of lives
     */
    //% weight=85 blockGap=8
    //% blockId=hudLife block="life"
    //% help=info/life
    export function life() {
        initLife()
        return _life
    }

    //%
    export function hasLife() {
        return _life !== null
    }

    /**
     * Set the number of lives
     * @param value the number of lives, eg: 3
     */
    //% weight=84 blockGap=8
    //% blockId=hudSetLife block="set life to %value"
    //% help=info/set-life
    export function setLife(value: number) {
        initLife()
        _life = value | 0
    }

    /**
     * Change the lives by the given amount
     * @param value the change of lives, eg: -1
     */
    //% weight=83
    //% blockId=hudChangeLifeBy block="change life by %value"
    //% help=info/change-life-by
    export function changeLifeBy(value: number) {
        initLife();
        setLife(_life + value)
    }

    /**
     * Register code to run when the player's life reaches 0. If this function
     * is not called then game.over() will be called instead
     */
    //% weight=82
    //% blockId=gamelifeevent block="on life zero"
    export function onLifeZero(handler: () => void) {
        _lifeOverHandler = handler;
    }

    /**
     * Start a countdown of the given duration in seconds
     * @param duration the duration of the countdown, eg: 10
     */
    //% blockId=gamecountdown block="start countdown %duration (s)"
    //% help=info/start-countdown weight=79 blockGap=8
    export function startCountdown(duration: number) {
        initHUD();
        _gameEnd = control.millis() + duration * 1000;
        _countdownExpired = false;
    }

    /**
     * Stops the current countdown and hides the timer UI
     */
    //% blockId=gamestopcountdown block="stop countdown" weight=78
    export function stopCountdown() {
        _gameEnd = undefined;
        _countdownExpired = true;
    }

    /**
     * Register code to run when the countdown reaches 0. If this function
     * is not called then game.over() will be called instead
     */
    //% blockId=gamecountdownevent block="on countdown end" weight=77
    export function onCountdownEnd(handler: () => void) {
        _countdownEndHandler = handler;
    }

    /**
     * Replaces the image used to represent the player's lives. Images
     * should be no larger than 8x8
     */
    //%
    export function setLifeImage(image: Image) {
        _heartImage = image;
    }

    /**
     * Sets the color of the borders around the score, countdown, and life
     * elements. Defaults to 3
     * @param color The index of the color (0-15)
     */
    export function setBorderColor(color: number) {
        _borderColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Sets the color of the background of the score, countdown, and life
     * elements. Defaults to 1
     * @param color The index of the color (0-15)
     */
    export function setBackgroundColor(color: number) {
        _bgColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Sets the color of the text used in the score, countdown, and life
     * elements. Defaults to 3
     * @param color The index of the color (0-15)
     */
    export function setFontColor(color: number) {
        _fontColor = Math.min(Math.max(color, 0), 15) | 0;
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

    function drawScore() {
        const s = score() | 0;

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

    function drawLives() {
        if (_life <= 0) return;

        const font = image.font8;
        if (_life <= 4) {
            screen.fillRect(0, 0, _life * (_heartImage.width + 1) + 3, _heartImage.height + 4, _borderColor);
            screen.fillRect(0, 0, _life * (_heartImage.width + 1) + 2,  _heartImage.height + 3, _bgColor);
            for (let i = 0; i < _life; i++) {
                screen.drawTransparentImage(_heartImage, 1 + i * (_heartImage.width + 1), 1);
            }
        }
        else {
            const num = _life.toString();
            const textWidth = num.length * font.charWidth - 1;
            screen.fillRect(0, 0, _heartImage.width + _multiplierImage.width + textWidth + 5, _heartImage.height + 4, _borderColor)
            screen.fillRect(0, 0, _heartImage.width + _multiplierImage.width + textWidth + 4, _heartImage.height + 3, _bgColor)
            screen.drawTransparentImage(_heartImage, 1, 1);

            let mult = _multiplierImage.clone();
            mult.replace(1, _fontColor);

            screen.drawTransparentImage(mult, _heartImage.width + 2,  font.charHeight - _multiplierImage.height - 1);
            screen.print(num, _heartImage.width + 3 + _multiplierImage.width, 1, _fontColor, font);
        }
    }

    function formatDecimal(val: number) {
        val |= 0;
        if (val < 10) {
            return "0" + val;
        }
        return val.toString();
    }
}

declare namespace info {
    /**
     * Sends the current score and the new high score
     */
    //% shim=info::updateHighScore
    function updateHighScore(score: number): number;
}
