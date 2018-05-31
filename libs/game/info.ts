
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
    /**
     * Color of the HUD display
     */
    let color = 1;

    function initHUD() {
        if (_hud) return;
        _hud = true;

        const font = image.font8;
        const maxW = 8;
        game.eventContext().registerFrameHandler(95, () => {
            // show score
            if (_score !== null) {
                let s = ""
                if (_highScore)
                    s += "HI" + _highScore + "  ";
                s += _score + ""
                while (s.length < maxW) s = " " + s
                screen.print(s, screen.width - font.charWidth * maxW - 10, font.charHeight, color, font)    
            }
            // show life
            if (_life !== null) {
                let s = _life + ""
                screen.print(s, 10, font.charHeight, color, font)
                if (_life == 0)
                    game.over();
            }
            // show countdown
            if (_gameEnd !== undefined) {
                let t = Math.max(0, _gameEnd - control.millis()) / 1000;
                // slow down timer
                // turn to second
                t = Math.ceil(t);
                // print time
                let s = t.toString();
                screen.print(s, (screen.width - s.length * font.charWidth) / 2, font.charHeight, color, font);                
                if (t <= 0)
                    game.over();
            }
        })
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
    //% weight=60
    //% blockId=highScore block="high score"
    //% help=info/high-score
    export function highScore(): number {
        initScore();
        return _highScore || 0;
    }

    /**
     * Set the score
     */
    //% weight=94 blockGap=8
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
    //% weight=93
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
     * Start a countdown of the given duration in seconds
     * @param duration the duration of the countdown, eg: 10
     */
    //% blockId=gamecountdown block="start countdown %duration (s)"
    //% help=info/start-countdown
    export function startCountdown(duration: number) {
        initHUD();
        _gameEnd = control.millis() + duration * 1000;
    }
}

declare namespace info {
    /**
     * Sends the current score and the new high score
     */
    //% shim=info::updateHighScore
    function updateHighScore(score: number): number;
}
