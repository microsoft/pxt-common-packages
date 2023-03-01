
/**
 * Head-up display
 *
*/
//% color=#cf6a87 weight=80 icon="\uf2bb" blockGap=8
//% groups='["Score", "Life", "Countdown", "Multiplayer"]'
//% blockGap=8
namespace info {

    export enum Visibility {
        None = 0,
        Countdown = 1 << 0,
        Score = 1 << 1,
        Life = 1 << 2,
        Hud = 1 << 3,
        Multi = 1 << 4,
        UserHeartImage = 1 << 5,
        _ExplicitlySetScore = 1 << 6,
        _ExplicitlySetLife = 1 << 7,
    }

    class ScoreReachedHandler {
        public isTriggered: boolean;
        constructor(public score: number, public handler: () => void) {
            this.isTriggered = false;
        }
    }

    export class PlayerState {
        public score: number;
        // undefined: not used
        // null: reached 0 and callback was invoked
        public life: number;
        public lifeZeroHandler: () => void;
        public scoreReachedHandlers: ScoreReachedHandler[];

        public showScore?: boolean;
        public showLife?: boolean;
        public visibility: Visibility;
        public showPlayer?: boolean;

        constructor() {
            this.visibility = Visibility.None;
            this.showScore = undefined;
            this.showLife = undefined;
            this.showPlayer = undefined;
            this.scoreReachedHandlers = [];
        }
    }

    class InfoState {
        public playerStates: PlayerState[];
        public visibilityFlag: number;

        public gameEnd: number;
        public heartImage: Image;
        public multiplierImage: Image;
        public bgColor: number;
        public borderColor: number;
        public fontColor: number;
        public countdownExpired: boolean;
        public countdownEndHandler: () => void;

        constructor() {
            this.visibilityFlag = Visibility.Hud;
            this.playerStates = [];
            this.heartImage = defaultHeartImage();
            this.multiplierImage = img`
                1 . . . 1
                . 1 . 1 .
                . . 1 . .
                . 1 . 1 .
                1 . . . 1
            `;
            this.bgColor = screen.isMono ? 0 : 1;
            this.borderColor = screen.isMono ? 1 : 3;
            this.fontColor = screen.isMono ? 1 : 3;
            this.countdownExpired = undefined;
            this.countdownEndHandler = undefined;
            this.gameEnd = undefined;
            this.playerStates = [];
        }
    }

    let infoState: InfoState = undefined;

    let players: PlayerInfo[];

    let infoStateStack: {
        state: InfoState,
        scene: scene.Scene
    }[];

    game.addScenePushHandler(oldScene => {
        if (infoState) {
            if (!infoStateStack) infoStateStack = [];
            infoStateStack.push({
                state: infoState,
                scene: oldScene
            });
            infoState = undefined;
        }
    });

    game.addScenePopHandler(() => {
        const scene = game.currentScene();
        infoState = undefined;
        if (infoStateStack && infoStateStack.length) {
            const nextState = infoStateStack.pop();
            if (nextState.scene == scene) {
                infoState = nextState.state;
            } else {
                infoStateStack.push(nextState);
            }
        }
    });

    function initHUD() {
        if (infoState) return;

        infoState = new InfoState();

        scene.createRenderable(
            scene.HUD_Z,
            () => {
                if (!infoState) return;
                control.enablePerfCounter("info")
                // show score, lifes
                if (infoState.visibilityFlag & Visibility.Multi) {
                    const ps = players.filter(p => !!p);
                    // First draw players
                    ps.forEach(p => p.drawPlayer());
                    // Then run life over events
                    ps.forEach(p => p.impl.raiseLifeZero(false));
                } else { // single player
                    // show score
                    const p = player1;
                    if (p.impl.hasScore() && (infoState.visibilityFlag & Visibility.Score)) {
                        p.drawScore();
                    }
                    // show life
                    if (p.impl.hasLife() && (infoState.visibilityFlag & Visibility.Life)) {
                        p.drawLives();
                    }
                    p.impl.raiseLifeZero(true);
                }
                // show countdown in both modes
                if (infoState.gameEnd !== undefined && infoState.visibilityFlag & Visibility.Countdown) {
                    const scene = game.currentScene();
                    const elapsed = infoState.gameEnd - scene.millis();
                    drawTimer(elapsed);
                    let t = elapsed / 1000;
                    if (t <= 0) {
                        t = 0;
                        if (!infoState.countdownExpired) {
                            infoState.countdownExpired = true;
                            infoState.gameEnd = undefined;
                            if (infoState.countdownEndHandler) {
                                infoState.countdownEndHandler();
                            } else {
                                // Clear effect and sound, unless set by user
                                const goc = game.gameOverConfig();
                                goc.setEffect(false, null, false);
                                goc.setSound(false, null, false, false);
                                game.gameOver(false);
                            }
                        }
                    }
                }
            }
        );
    }

    function initMultiHUD() {
        if (infoState.visibilityFlag & Visibility.Multi) return;

        infoState.visibilityFlag |= Visibility.Multi;
        if (!(infoState.visibilityFlag & Visibility.UserHeartImage))
            infoState.heartImage = defaultMultiplayerHeartImage();
        infoState.multiplierImage = img`
            1 . 1
            . 1 .
            1 . 1
        `;
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
            `
            :
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

    function defaultMultiplayerHeartImage() {
        return screen.isMono ?
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
    }

    export function multiplayerScoring() {
        const pws = playersWithScores();
        for (const p of pws) {
            if (p.number > 1) {
                return true;
            }
        }
        return false;
    }

    export function playersWithScores(): PlayerInfo[] {
        return players ? players.filter(item => item.impl.hasScore()) : [];
    }

    export function saveAllScores() {
        const allScoresKey = "all-scores";
        let allScores: number[];
        const pws = playersWithScores();
        if (pws) {
            allScores = pws.map(item => item.impl.score());
        }
        else {
            allScores = [];
        }

        settings.writeJSON(allScoresKey, allScores);
    }

    export function winningPlayer(): PlayerInfo {
        let winner: PlayerInfo = null;
        const pws = playersWithScores();
        if (pws) {
            const goc = game.gameOverConfig();
            let hs: number = null;
            pws.forEach(p => {
                const s = p.impl.score();
                if (isBetterScore(s, hs)) {
                    hs = s;
                    winner = p;
                }
            });
        }
        return winner;
    }

    export function isBetterScore(newScore: number, prevScore: number): boolean {
        const goc = game.gameOverConfig();
        switch (goc.scoringType) {
            case game.ScoringType.HighScore: {
                return prevScore == null || newScore > prevScore;
            }
            case game.ScoringType.LowScore: {
                return prevScore == null || newScore < prevScore;
            }
        }
        return false;
    }

    export function saveHighScore() {
        const winner = winningPlayer();
        if (winner) {
            let hs = winner.impl.score();
            let curr = settings.readNumber("high-score");
            if (isBetterScore(hs, curr)) {
                settings.writeNumber("high-score", hs);
            }
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
        return player1.impl.score();
    }

    //%
    //% group="Score"
    export function hasScore() {
        return player1.impl.hasScore();
    }

    /**
     * Get the last recorded high score
     */
    //% weight=94
    //% blockId=highScore block="high score"
    //% help=info/high-score
    //% group="Score"
    export function highScore(): number {
        return settings.readNumber("high-score") || 0;
    }

    /**
     * Set the score
     */
    //% weight=93 blockGap=8
    //% blockId=hudsetScore block="set score to %value"
    //% help=info/set-score
    //% group="Score"
    export function setScore(value: number) {
        player1.impl.setScore(value);
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
        player1.impl.changeScoreBy(value);
    }

    /**
     * Get the number of lives
     */
    //% weight=85 blockGap=8
    //% blockId=hudLife block="life"
    //% help=info/life
    //% group="Life"
    export function life() {
        return player1.impl.life();
    }

    //% group="Life"
    export function hasLife() {
        return player1.impl.hasLife();
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
        player1.impl.setLife(value);
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
        player1.impl.changeLifeBy(value);
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
        player1.impl.onLifeZero(handler);
    }

    /**
     * Runs code once each time the score reaches a given value. This will also
     * run if the score "passes" the given value in either direction without ever
     * having the exact value (e.g. if score is changed by more than 1)
     *
     * @param score the score to fire the event on
     * @param handler code to run when the score reaches the given value
     */
    //% weight=10
    //% blockId=gameonscore
    //% block="on score $score"
    //% score.defl=100
    //% help=info/on-score
    //% group="Score"
    export function onScore(score: number, handler: () => void) {
        player1.impl.onScore(score, handler);
    }

    /**
     * Get the value of the current count down
     */
    //% block="countdown"
    //% blockId=gamegetcountdown
    //% weight=79
    //% group="Countdown"
    export function countdown(): number {
        initHUD();
        return infoState.gameEnd ? ((infoState.gameEnd - game.currentScene().millis()) / 1000) : 0;
    }

    /**
     * Start a countdown of the given duration in seconds
     * @param duration the duration of the countdown, eg: 10
     */
    //% blockId=gamecountdown block="start countdown %duration (s)"
    //% help=info/start-countdown weight=78 blockGap=8
    //% group="Countdown"
    export function startCountdown(duration: number) {
        updateFlag(Visibility.Countdown, true);
        infoState.gameEnd = game.currentScene().millis() + duration * 1000;
        infoState.countdownExpired = false;
    }

    /**
     * Change the running countdown by the given number of seconds
     * @param seconds the number of seconds the countdown should be changed by
     */
    //% block="change countdown by $seconds (s)"
    //% blockId=gamechangecountdown
    //% weight=77
    //% group="Countdown"
    export function changeCountdownBy(seconds: number) {
        startCountdown((countdown() + seconds));
    }

    /**
     * Stop the current countdown and hides the timer display
     */
    //% blockId=gamestopcountdown block="stop countdown" weight=76
    //% help=info/stop-countdown
    //% group="Countdown"
    export function stopCountdown() {
        updateFlag(Visibility.Countdown, false);
        infoState.gameEnd = undefined;
        infoState.countdownExpired = true;
    }

    /**
     * Run code when the countdown reaches 0. If this function
     * is not called then game.over() is called instead
     */
    //% blockId=gamecountdownevent block="on countdown end" weight=75
    //% help=info/on-countdown-end
    //% group="Countdown"
    export function onCountdownEnd(handler: () => void) {
        initHUD();
        infoState.countdownEndHandler = handler;
    }

    /**
     * Replaces the image used to represent the player's lives. Images
     * should be no larger than 8x8
     */
    //% group="Life"
    export function setLifeImage(image: Image) {
        updateFlag(Visibility.UserHeartImage, true);
        infoState.heartImage = image;
    }

    /**
     * Set whether life should be displayed
     * @param on if true, lives are shown; otherwise, lives are hidden
     */
    //% group="Life"
    export function showLife(on: boolean) {
        updateFlag(Visibility.Life, on);
        updateFlag(Visibility._ExplicitlySetLife, true);
    }

    /**
     * Set whether score should be displayed
     * @param on if true, score is shown; otherwise, score is hidden
     */
    //% group="Score"
    export function showScore(on: boolean) {
        updateFlag(Visibility.Score, on);
        updateFlag(Visibility._ExplicitlySetScore, true);
    }

    /**
     * Set whether countdown should be displayed
     * @param on if true, countdown is shown; otherwise, countdown is hidden
     */
    //% group="Countdown"
    export function showCountdown(on: boolean) {
        updateFlag(Visibility.Countdown, on);
    }

    function updateFlag(flag: Visibility, on: boolean) {
        initHUD();
        if (on) infoState.visibilityFlag |= flag;
        else infoState.visibilityFlag = ~(~infoState.visibilityFlag | flag);
    }

    /**
     * Sets the color of the borders around the score, countdown, and life
     * elements. Defaults to 3
     * @param color The index of the color (0-15)
     */
    //% group="Theme"
    export function setBorderColor(color: number) {
        initHUD();
        infoState.borderColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Sets the color of the background of the score, countdown, and life
     * elements. Defaults to 1
     * @param color The index of the color (0-15)
     */
    //% group="Theme"
    export function setBackgroundColor(color: number) {
        initHUD();
        infoState.bgColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Sets the color of the text used in the score, countdown, and life
     * elements. Defaults to 3
     * @param color The index of the color (0-15)
     */
    //% group="Theme"
    export function setFontColor(color: number) {
        initHUD();
        infoState.fontColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Get the current color of the borders around the score, countdown, and life
     * elements
     */
    //% group="Theme"
    export function borderColor(): number {
        initHUD();
        return infoState.borderColor ? infoState.borderColor : 3;
    }

    /**
     * Get the current color of the background of the score, countdown, and life
     * elements
     */
    //% group="Theme"
    export function backgroundColor(): number {
        initHUD();
        return infoState.bgColor ? infoState.bgColor : 1;
    }

    /**
     * Get the current color of the text usded in the score, countdown, and life
     * elements
     */
    //% group="Theme"
    export function fontColor(): number {
        initHUD();
        return infoState.fontColor ? infoState.fontColor : 3;
    }

    function drawTimer(millis: number) {
        if (millis < 0) millis = 0;
        millis |= 0;

        const font = image.font8;
        const smallFont = image.font5;
        const seconds = Math.idiv(millis, 1000);
        const width = font.charWidth * 5 - 2;
        let left = (screen.width >> 1) - (width >> 1) + 1;
        let color1 = infoState.fontColor;
        let color2 = infoState.bgColor;

        if (seconds < 10 && (seconds & 1) && !screen.isMono) {
            const temp = color1;
            color1 = color2;
            color2 = temp;
        }

        screen.fillRect(left - 3, 0, width + 6, font.charHeight + 3, infoState.borderColor)
        screen.fillRect(left - 2, 0, width + 4, font.charHeight + 2, color2)


        if (seconds < 60) {
            const top = 1;
            const remainder = Math.idiv(millis % 1000, 10);

            screen.print(formatDecimal(seconds) + ".", left, top, color1, font)
            const decimalLeft = left + 3 * font.charWidth;
            screen.print(formatDecimal(remainder), decimalLeft, top + 2, color1, smallFont)
        }
        else {
            const minutes = Math.idiv(seconds, 60);
            const remainder = seconds % 60;
            screen.print(formatDecimal(minutes) + ":" + formatDecimal(remainder), left, 1, color1, font);
        }
    }

    /**
     * Splits the implementation of the player info from the user-facing APIs so that
     * we can reference this internally without causing the "multiplayer" part to show
     * up in the usedParts array of the user program's compile result. Make sure to
     * use the APIs on this class and not the PlayerInfo to avoid false-positives when
     * we detect if a game is multiplayer or not
     */
    export class PlayerInfoImpl {
        protected _player: number;
        public bg: number; // background color
        public border: number; // border color
        public fc: number; // font color
        public x?: number;
        public y?: number;
        public left?: boolean; // if true banner goes from x to the left, else goes rightward
        public up?: boolean; // if true banner goes from y up, else goes downward

        constructor(player: number) {
            this._player = player;
            this.border = 1;
            this.fc = 1;
            this.left = undefined;
            this.up = undefined;
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
                // bottom left, banner is white on green
                this.bg = screen.isMono ? 0 : 7;
                this.x = screen.width;
                this.y = screen.height;
                this.left = true;
                this.up = true;
            }
        }

        private init() {
            initHUD();
            if (this._player > 1) initMultiHUD();
            if (!infoState.playerStates[this._player - 1]) {
                infoState.playerStates[this._player - 1] = new PlayerState();
            }
        }

        getState(): PlayerState {
            this.init();
            return infoState.playerStates[this._player - 1];
        }

        // the id numbera of the player
        id(): number {
            return this._player;
        }

        score(): number {
            const state = this.getState();

            if (state.showScore === undefined) state.showScore = true;
            if (state.showPlayer === undefined) state.showPlayer = true;

            if (state.score == null)
                state.score = 0;
            return state.score;
        }

        setScore(value: number) {
            const state = this.getState();
            if (!(infoState.visibilityFlag & Visibility._ExplicitlySetScore)) {
                updateFlag(Visibility.Score, true);
            }

            this.score(); // invoked for side effects

            const oldScore = state.score || 0;
            state.score = (value | 0);

            state.scoreReachedHandlers.forEach(srh => {
                if ((oldScore < srh.score && state.score >= srh.score) ||
                    (oldScore > srh.score && state.score <= srh.score)) {
                    srh.handler();
                }
            });
        }

        changeScoreBy(value: number): void {
            this.setScore(this.score() + value);
        }

        hasScore() {
            const state = this.getState();
            return state.score !== undefined;
        }

        life(): number {
            const state = this.getState();

            if (state.showLife === undefined) state.showLife = true;
            if (state.showPlayer === undefined) state.showPlayer = true;

            if (state.life === undefined) {
                state.life = 3;
            }
            return state.life || 0;
        }

        setLife(value: number): void {
            const state = this.getState();
            if (!(infoState.visibilityFlag & Visibility._ExplicitlySetLife)) {
                updateFlag(Visibility.Life, true);
            }

            this.life(); // invoked for side effects
            state.life = (value | 0);
        }

        changeLifeBy(value: number): void {
            this.setLife(this.life() + value);
        }

        hasLife(): boolean {
            const state = this.getState();
            return state.life !== undefined && state.life !== null;
        }

        onLifeZero(handler: () => void) {
            const state = this.getState();
            state.lifeZeroHandler = handler;
        }

        onScore(score: number, handler: () => void) {
            const state = this.getState();

            for (const element of state.scoreReachedHandlers) {
                if (element.score === score) {
                    // Score handlers are implemented as "last one wins."
                    element.handler = handler;
                    return;
                }
            }

            state.scoreReachedHandlers.push(new ScoreReachedHandler(score, handler));
        }

        raiseLifeZero(gameOver: boolean) {
            const state = this.getState();
            if (state.life !== null && state.life <= 0) {
                state.life = null;
                if (state.lifeZeroHandler) {
                    state.lifeZeroHandler();
                } else if (gameOver) {
                    // Clear effect and sound, unless set by user
                    const goc = game.gameOverConfig();
                    goc.setEffect(false, null, false);
                    goc.setSound(false, null, false, false);
                    game.gameOver(false);
                }
            }
        }
    }

    //% fixedInstances
    //% blockGap=8
    export class PlayerInfo {
        protected _player: number;
        public impl: PlayerInfoImpl;

        constructor(player: number) {
            this._player = player;
            this.impl = new PlayerInfoImpl(player);

            if (!players) players = [];
            players[this._player - 1] = this;
        }

        private init() {
            initHUD();
            if (this._player > 1) initMultiHUD();
            if (!infoState.playerStates[this._player - 1]) {
                infoState.playerStates[this._player - 1] = new PlayerState();
            }
        }

        /**
         * Returns the one-based number of the player
         */
        get number() {
            return this._player;
        }

        get bg(): number {
            return this.impl.bg;
        }

        set bg(value: number) {
            this.impl.bg = value;
        }

        get border(): number {
            return this.impl.border;
        }

        set border(value: number) {
            this.impl.border = value;
        }

        get fc(): number {
            return this.impl.fc;
        }

        set fc(value: number) {
            this.impl.fc = value;
        }

        get showScore(): boolean {
            return this.impl.getState().showScore;
        }

        set showScore(value: boolean) {
            this.impl.getState().showScore = value;
        }

        get showLife(): boolean {
            return this.impl.getState().showLife;
        }

        set showLife(value: boolean) {
            this.impl.getState().showLife = value;
        }

        get visibility(): Visibility {
            return this.impl.getState().visibility;
        }

        set visibility(value: Visibility) {
            this.impl.getState().visibility = value;
        }

        get showPlayer(): boolean {
            return this.impl.getState().showPlayer;
        }

        set showPlayer(value: boolean) {
            this.impl.getState().showPlayer = value;
        }

        get x(): number {
            return this.impl.x;
        }

        set x(value: number) {
            this.impl.x = value;
        }

        get y(): number {
            return this.impl.y;
        }

        set y(value: number) {
            this.impl.y = value;
        }

        get left(): boolean {
            return this.impl.left;
        }

        set left(value: boolean) {
            this.impl.left = value;
        }

        get up(): boolean {
            return this.impl.up;
        }

        set up(value: boolean) {
            this.impl.up = value;
        }

        getState(): PlayerState {
            this.init();
            return infoState.playerStates[this._player - 1];
        }

        // the id numbera of the player
        id(): number {
            return this.impl.id();
        }

        /**
         * Get the player score
         */
        //% group="Multiplayer"
        //% blockId=piscore block="%player score"
        //% help=info/score
        //% parts="multiplayer"
        score(): number {
            return this.impl.score();
        }

        /**
         * Set the player score
         */
        //% group="Multiplayer"
        //% blockId=pisetscore block="set %player score to %value"
        //% value.defl=0
        //% help=info/set-score
        //% parts="multiplayer"
        setScore(value: number) {
            this.impl.setScore(value);
        }

        /**
         * Change the score of a player
         * @param value
         */
        //% group="Multiplayer"
        //% blockId=pichangescore block="change %player score by %value"
        //% value.defl=1
        //% help=info/change-score-by
        //% parts="multiplayer"
        changeScoreBy(value: number): void {
            this.impl.changeScoreBy(value);
        }

        hasScore() {
            return this.impl.hasScore();
        }

        /**
         * Get the player life
         */
        //% group="Multiplayer"
        //% blockid=piflife block="%player life"
        //% help=info/life
        //% parts="multiplayer"
        life(): number {
            return this.impl.life();
        }

        /**
         * Set the player life
         */
        //% group="Multiplayer"
        //% blockId=pisetlife block="set %player life to %value"
        //% value.defl=3
        //% help=info/set-life
        //% parts="multiplayer"
        setLife(value: number): void {
            this.impl.setLife(value);
        }

        /**
         * Change the life of a player
         * @param value
         */
        //% group="Multiplayer"
        //% blockId=pichangelife block="change %player life by %value"
        //% value.defl=-1
        //% help=info/change-life-by
        //% parts="multiplayer"
        changeLifeBy(value: number): void {
            this.impl.changeLifeBy(value);
        }

        /**
         * Return true if the given player currently has a value set for health,
         * and false otherwise.
         * @param player player to check life of
         */
        //% group="Multiplayer"
        //% blockId=pihaslife block="%player has life"
        //% help=info/has-life
        //% parts="multiplayer"
        hasLife(): boolean {
            return this.impl.hasLife();
        }

        /**
         * Runs code when life reaches zero
         * @param handler
         */
        //% group="Multiplayer"
        //% blockId=playerinfoonlifezero block="on %player life zero"
        //% help=info/on-life-zero
        //% parts="multiplayer"
        onLifeZero(handler: () => void) {
            this.impl.onLifeZero(handler);
        }

        /**
         * Runs code once each time the score reaches a given value. This will also
         * run if the score "passes" the given value in either direction without ever
         * having the exact value (e.g. if score is changed by more than 1)
         *
         * @param score the score to fire the event on
         * @param handler code to run when the score reaches the given value
         */
        //% blockId=playerinfoonscore
        //% block="on $this score $score"
        //% score.defl=100
        //% help=info/on-score
        //% group="Multiplayer"
        //% parts="multiplayer"
        onScore(score: number, handler: () => void) {
            this.impl.onScore(score, handler);
        }

        drawPlayer() {
            const state = this.getState();

            const font = image.font5;
            let score: string;
            let life: string;
            let height = 4;
            let scoreWidth = 0;
            let lifeWidth = 0;
            const offsetX = 1;
            let offsetY = 2;
            let showScore = state.showScore && state.score !== undefined;
            let showLife = state.showLife && state.life !== undefined;

            if (showScore) {
                score = "" + state.score;
                scoreWidth = score.length * font.charWidth + 3;
                height += font.charHeight;
                offsetY += font.charHeight + 1;
            }

            if (showLife) {
                life = "" + (state.life || 0);
                lifeWidth = infoState.heartImage.width + infoState.multiplierImage.width + life.length * font.charWidth + 3;
                height += infoState.heartImage.height;
            }

            const width = Math.max(scoreWidth, lifeWidth);

            // bump size for space between lines
            if (showScore && showLife) height++;

            const x = this.impl.x - (this.impl.left ? width : 0);
            const y = this.impl.y - (this.impl.up ? height : 0);

            // Bordered Box
            if (showScore || showLife) {
                screen.fillRect(x, y, width, height, this.impl.border);
                screen.fillRect(x + 1, y + 1, width - 2, height - 2, this.impl.bg);
            }

            // print score
            if (showScore) {
                const bump = this.impl.left ? width - scoreWidth : 0;
                screen.print(score, x + offsetX + bump + 1, y + 2, this.impl.fc, font);
            }

            // print life
            if (showLife) {
                const xLoc = x + offsetX + (this.impl.left ? width - lifeWidth : 0);

                let mult = infoState.multiplierImage.clone();
                mult.replace(1, this.impl.fc);

                screen.drawTransparentImage(
                    infoState.heartImage,
                    xLoc,
                    y + offsetY
                );
                screen.drawTransparentImage(
                    mult,
                    xLoc + infoState.heartImage.width,
                    y + offsetY + font.charHeight - infoState.multiplierImage.height - 1
                );
                screen.print(
                    life,
                    xLoc + infoState.heartImage.width + infoState.multiplierImage.width + 1,
                    y + offsetY,
                    this.impl.fc,
                    font
                );
            }

            // print player icon
            if (state.showPlayer) {
                const pNum = "" + this._player;

                let iconWidth = pNum.length * font.charWidth + 1;
                const iconHeight = Math.max(height, font.charHeight + 2);
                let iconX = this.impl.left ? (x - iconWidth + 1) : (x + width - 1);
                let iconY = y;

                // adjustments when only player icon shown
                if (!showScore && !showLife) {
                    iconX += this.impl.left ? -1 : 1;
                    if (this.impl.up) iconY -= 3;
                }

                screen.fillRect(
                    iconX,
                    iconY,
                    iconWidth,
                    iconHeight,
                    this.impl.border
                );
                screen.print(
                    pNum,
                    iconX + 1,
                    iconY + (iconHeight >> 1) - (font.charHeight >> 1),
                    this.impl.bg,
                    font
                );
            }
        }

        drawScore() {
            const s = this.impl.score() | 0;

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

            screen.fillRect(
                screen.width - width - 2,
                0,
                screen.width,
                image.font8.charHeight + 3,
                infoState.borderColor
            );
            screen.fillRect(
                screen.width - width - 1,
                0,
                screen.width,
                image.font8.charHeight + 2,
                infoState.bgColor
            );
            screen.print(
                num,
                screen.width - width,
                offsetY,
                infoState.fontColor,
                font
            );
        }

        drawLives() {
            const state = this.getState();
            if (state.life < 0) return;
            const font = image.font8;
            if (state.life <= 4) {
                screen.fillRect(
                    0,
                    0,
                    state.life * (infoState.heartImage.width + 1) + 3,
                    infoState.heartImage.height + 4,
                    infoState.borderColor
                );
                screen.fillRect(
                    0,
                    0,
                    state.life * (infoState.heartImage.width + 1) + 2,
                    infoState.heartImage.height + 3,
                    infoState.bgColor
                );
                for (let i = 0; i < state.life; i++) {
                    screen.drawTransparentImage(
                        infoState.heartImage,
                        1 + i * (infoState.heartImage.width + 1),
                        1
                    );
                }
            }
            else {
                const num = state.life + "";
                const textWidth = num.length * font.charWidth - 1;
                screen.fillRect(
                    0,
                    0,
                    infoState.heartImage.width + infoState.multiplierImage.width + textWidth + 5,
                    infoState.heartImage.height + 4,
                    infoState.borderColor
                );
                screen.fillRect(
                    0,
                    0,
                    infoState.heartImage.width + infoState.multiplierImage.width + textWidth + 4,
                    infoState.heartImage.height + 3,
                    infoState.bgColor
                );
                screen.drawTransparentImage(
                    infoState.heartImage,
                    1,
                    1
                );

                let mult = infoState.multiplierImage.clone();
                mult.replace(1, infoState.fontColor);

                screen.drawTransparentImage(
                    mult,
                    infoState.heartImage.width + 2,
                    font.charHeight - infoState.multiplierImage.height - 1
                );
                screen.print(
                    num,
                    infoState.heartImage.width + 3 + infoState.multiplierImage.width,
                    1,
                    infoState.fontColor,
                    font
                );
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

    //% fixedInstance whenUsed block="player 2"
    export const player2 = new PlayerInfo(2);
    //% fixedInstance whenUsed block="player 3"
    export const player3 = new PlayerInfo(3);
    //% fixedInstance whenUsed block="player 4"
    export const player4 = new PlayerInfo(4);
    //% fixedInstance whenUsed block="player 1"
    export const player1 = new PlayerInfo(1);
}
