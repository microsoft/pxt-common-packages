//% groups='["other","Multiplayer"]'
namespace info {
    export interface PlayerInfo {
        _score: number;
        _life: number;
        _player: PlayerNumber;
        bg: number; // background color
        border: number; // border color
        fc: number; // font color
        showScore?: boolean;
        showLife?: boolean;
        showPlayer?: boolean;
        _h?: () => void; // onPlayerLifeOver handler
        x?: number;
        y?: number;
        left?: boolean; // if true banner goes from x to the left, else goes rightward
        up?: boolean; // if true banner goes from y up, else goes downward
    }

    let _players: PlayerInfo[];
    let _multiplayerHud: boolean = false; 
    let _heartImage: Image;
    let _multiplierImage: Image;

    function initMultiplayerHUD() {
        if (_multiplayerHud) return;
        _multiplayerHud = true;

        // suppress standard score and life display
        showScore(false);
        showLife(false);

        _heartImage = _heartImage || defaultHeartImage();

        _multiplierImage = _multiplierImage || img`
                1 . 1
                . 1 .
                1 . 1
            `;

        game.eventContext().registerFrameHandler(95, () => {
            // First draw players
            for (let player = PlayerNumber.One; player < _players.length; player++) {
                drawPlayer(player);
            }

            // Then run life over events
            for (let player = PlayerNumber.One; player < _players.length; player++) {
                const p = _players[player];
                if (p && p._life !== null && p._life <= 0) {
                    p._life = null;
                    if (p._h) p._h();
                }
            }
        })
    }

    function defaultHeartImage() {
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


    function initPlayer(player: PlayerNumber) {
        if (!_players) _players = [];
        if (_players[player]) return;
        initMultiplayerHUD();

        if (player === PlayerNumber.One) {
            // Top left, and banner is white on red
            _players[player] = {
                _score: null,
                _life: null,
                _player: player,
                bg: screen.isMono ? 0 : 2,
                border: 1,
                fc: 1,
                showScore: null,
                showLife: null,
                showPlayer: null,
                x: 0,
                y: 0
            };
        } else if (player === PlayerNumber.Two) {
            // Top right, and banner is white on blue
            _players[player] = {
                _score: null,
                _life: null,
                _player: player,
                bg: screen.isMono ? 0 : 8,
                border: 1,
                fc: 1,
                showScore: null,
                showLife: null,
                showPlayer: null,
                x: screen.width,
                y: 0,
                left: true
            };
        } else if (player === PlayerNumber.Three) {
            // Not displayed by default, bottom left, banner is white on yellow
            _players[player] = {
                _score: null,
                _life: null,
                _player: player,
                bg: screen.isMono ? 0 : 4,
                border: 1,
                fc: 1,
                showLife: false,
                showScore: false,
                showPlayer: false,
                x: 0,
                y: screen.height,
                up: true
            };
        } else {
            // Not displayed by default, bottom left, banner is white on green
            _players[player] = {
                _score: null,
                _life: null,
                _player: player,
                bg: screen.isMono ? 0 : 7,
                border: 1,
                fc: 1,
                showLife: false,
                showScore: false,
                showPlayer: false,
                x: screen.width,
                y: screen.height,
                left: true,
                up: true
            };
        }
    }

    /**
     * Get the PlayerInfo object for the given player
     * @param player player to get representation of
     */
    export function playerInfo(player: PlayerNumber): PlayerInfo {
        initPlayer(player);
        return _players[player];
    }

    function initPlayerScore(player: PlayerNumber) {
        initPlayer(player);
        const p = _players[player];
        if (p.showScore === null) p.showScore = true;
        if (p.showPlayer === null) p.showPlayer = true;

        if (!p._score) {
            p._score = 0;
            saveMultiplayerHighScore();
        }
    }

    function initPlayerLife(player: PlayerNumber) {
        initPlayer(player);
        const p = _players[player];
        if (p.showLife === null) p.showLife = true;
        if (p.showPlayer === null) p.showPlayer = true;

        if (p._life === null) {
            p._life = 3;
        }
    }

    /**
     * Updates the high score based on the scores of all players
     */
    export function saveMultiplayerHighScore() {
        if (_players) {
            const oS = info.score();
            const hS = info.highScore();
            let maxScore = hS;
            for (let player = PlayerNumber.One; player < _players.length; player++) {
                const p = _players[player]
                if (p && p._score) {
                    maxScore = Math.max(maxScore, p._score);
                }
            }
            if (maxScore > hS) {
                setScore(maxScore);
                saveHighScore();
                setScore(oS);
            }
        }
    }

    /**
     * Get the current score for the given player if any
     */
    //% weight=95 blockGap=8 group="Multiplayer"
    //% blockId=local_playerScore block="$player score"
    export function playerScore(player: PlayerNumber): number {
        initPlayerScore(player);
        return _players[player]._score;
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
        _players[player]._score = value | 0;
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
        setPlayerScore(player, _players[player]._score + value);
    }

    /**
     * Get the number of lives for the given player
     * @param player the chosen player
     */
    //% weight=85 blockGap=8 group="Multiplayer"
    //% blockId=local_life block="$player life"
    export function playerLife(player: PlayerNumber) {
        initPlayerLife(player);
        return _players[player]._life;
    }


    /**
     * Set the number of lives for the given player
     * @param player the chosen player
     * @param value the number of lives, eg: 3
     */
    //% weight=84 blockGap=8 group="Multiplayer"
    //% blockId=local_setLife block="set $player life to %value"
    export function setPlayerLife(player: PlayerNumber, value: number) {
        initPlayerLife(player);
        _players[player]._life = value | 0;
    }

    /**
     * Change the lives by the given amount
     * @param player the chosen player
     * @param value the change of lives, eg: -1
     */
    //% weight=83 group="Multiplayer"
    //% blockId=local_changeLifeBy block="change $player life by %value"
    export function changePlayerLifeBy(player: PlayerNumber, value: number) {
        initPlayerLife(player);
        setPlayerLife(player, _players[player]._life + value);
    }

    /**
     * Run code when the given player's life is at or below 0
     * @param player Player for the event to apply to
     * @param handler code to run on life over
     */
    //% weight=82 group="Multiplayer"
    //% blockId=local_gamelifeevent block="on $player life zero"
    export function onPlayerLifeZero(player: PlayerNumber, handler: () => void) {
        initPlayer(player);
        _players[player]._h = handler;
    }

    /**
     * Returns true if the given player currently has a value set for health,
     * and false otherwise.
     * @param player player to check life of
     */
    export function playerHasLife(player: PlayerNumber): boolean {
        initPlayer(player);
        return _players[player]._life !== null;
    }

    function drawPlayer(player: PlayerNumber) {
        if (!_players || !_players[player]) return;

        const font = image.font5;
        const p = _players[player];
        
        let score: string;
        let life: string;
        let height = 4;
        let scoreWidth = 0;
        let lifeWidth = 0;
        const offsetX = 1;
        let offsetY = 2;
        let showScore = p.showScore && p._score !== null
        let showLife = p.showLife && p._life !== null;

        if (showScore) {
            score = "" + playerScore(player);
            scoreWidth = score.length * font.charWidth + 3;
            height += font.charHeight;
            offsetY += font.charHeight + 1;
        }
        
        if (showLife) {
            life = "" + playerLife(player);
            lifeWidth = _heartImage.width + _multiplierImage.width + life.length * font.charWidth + 3;
            height += _heartImage.height;
        }

        const width = Math.max(scoreWidth, lifeWidth);

        // bump size for space between lines
        if (showScore && showLife) height++;

        const x = p.x - (p.left ? width : 0);
        const y = p.y - (p.up ? height : 0);

        // Bordered Box
        if (showScore || showLife) {
            screen.fillRect(x, y, width, height, p.border);
            screen.fillRect(x + 1, y + 1, width - 2, height - 2, p.bg);
        }

        // print score
        if (showScore) {
            const bump = p.left ? width - scoreWidth: 0;
            screen.print(score, x + offsetX + bump + 1, y + 2, p.fc, font);
        }

        // print life
        if (showLife) {
            const xLoc = x + offsetX + (p.left ? width - lifeWidth : 0);
            
            let mult = _multiplierImage.clone();
            mult.replace(1, p.fc);

            screen.drawTransparentImage(_heartImage,
                            xLoc,
                            y + offsetY);
            screen.drawTransparentImage(mult,
                            xLoc + _heartImage.width,
                            y + offsetY + font.charHeight - _multiplierImage.height - 1);
            screen.print(life,
                            xLoc + _heartImage.width + _multiplierImage.width + 1,
                            y + offsetY,
                            p.fc,
                            font);
        }

        // print player icon
        if (p.showPlayer) {
            const pNum = "" + p._player;
            
            let iconWidth = pNum.length * font.charWidth + 1;
            const iconHeight = Math.max(height, font.charHeight + 2);
            let iconX = p.left ? (x - iconWidth + 1) : (x + width - 1);
            let iconY = y;

            // adjustments when only player icon shown
            if (!showScore && !showLife) {
                iconX += p.left ? -1 : 1;
                if (p.up) iconY -= 3;
            }

            screen.fillRect(iconX, iconY, iconWidth, iconHeight, p.border);
            screen.print(pNum, iconX + 1, iconY + (iconHeight >> 1) - (font.charHeight >> 1), p.bg, font);
        }
    }
}