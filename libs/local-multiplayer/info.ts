//% groups='["other","Multiplayer"]'
namespace info {
    export interface PlayerInfo {
        score: number;
        life: number;
        player: controller.PlayerNumber;
        bg: number; // background color
        border: number; // border color
        fc: number; // font color
        showScore?: boolean;
        showLife?: boolean;
        showPlayer?: boolean;
        h?: () => void; // onPlayerLifeOver handler
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
            // show score

            for (let player = controller.PlayerNumber.One; player < _players.length; player++) {
                drawPlayer(player);
            }

            // TODO: add playerLifeOverHandlers
            // NO DEFAULT BEHAVIOR FOR _lifeOverHandler
            // if (_life <= 0) {
            //     if (_lifeOverHandler) {
            //         _lifeOverHandler();
            //     }
            //     _life = 0;
            //     _isAlive = false
            // }
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


    function initPlayer(player: controller.PlayerNumber) {
        if (!_players) _players = [];
        if (_players[player]) return;
        initMultiplayerHUD();

        if (player === controller.PlayerNumber.One) {
            // Top left, and banner is white on red
            _players[player] = {
                score: null,
                life: null,
                player: player,
                bg: screen.isMono ? 0 : 3,
                border: 1,
                fc: 1,
                showScore: null,
                showLife: null,
                showPlayer: true,
                x: -1,
                y: -1
            }
        } else if (player === controller.PlayerNumber.Two) {
            // Top right, and banner is white on blue
            _players[player] = {
                score: null,
                life: null,
                player: player,
                bg: screen.isMono ? 0 : 8,
                border: 1,
                fc: 1,
                showScore: null,
                showLife: null,
                showPlayer: true,
                x: screen.width + 1,
                y: -1,
                left: true
            }
        } else {
            // Not displayed by default, standard info color
            _players[player + 0] = {
                // this weird hack is needed to compile the code. Otherwise gets
                //      non-numeric indexer on Array_::setAt
                //      (property) player: controller.PlayerNumber
                // Ask someone smart what this is for, seems like an internal bug?
                score: null,
                life: null,
                player: player,
                bg: screen.isMono ? 0 : 1,
                border: screen.isMono ? 1 : 3,
                fc: screen.isMono ? 1 : 3,
                showLife: false,
                showScore: false,
                showPlayer: false
            }
        }
    }

    //todo comment
    export function playerInfo(player: controller.PlayerNumber) {
        initPlayer(player);
        return _players[player];
    }

    function initPlayerScore(player: controller.PlayerNumber) {
        initPlayer(player);
        const p = _players[player];
        if (p.showScore === null) p.showScore = true;

        if (!p.score) {
            p.score = 0;
            saveMultiplayerHighScore();
        }
    }

    function initPlayerLife(player: controller.PlayerNumber) {
        initPlayer(player);
        const p = _players[player];
        if (p.showLife === null) p.showLife = true;

        if (!p.life) {
            p.life = 3;
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
            for (let player = controller.PlayerNumber.One; player < _players.length; player++) {
                const p = _players[player]
                if (p && p.score) {
                    maxScore = Math.max(maxScore, p.score);
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
    export function playerScore(player: controller.PlayerNumber): number {
        initPlayerScore(player);
        return _players[player].score;
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
        _players[player].score = value | 0;
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
        setPlayerScore(player, _players[player].score + value);
    }

    /**
     * Get the number of lives for the given player
     * @param player the chosen player
     */
    //% weight=85 blockGap=8 group="Multiplayer"
    //% blockId=local_life block="$player life"
    export function playerLife(player: controller.PlayerNumber) {
        initPlayerLife(player);
        return _players[player].life;
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
        _players[player].life = value | 0;
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
        setPlayerLife(player, _players[player].life + value);
    }

    function drawPlayer(player: controller.PlayerNumber) {
        if (!_players || !_players[player]) return;

        const font = image.font5;
        const p = _players[player];
        
        let s: string;
        let l: string;
        let h = 4;
        let sW = 0;
        let lW = 0;
        const offsetX = 1;
        let offsetY = 2;

        // maybe w / h should be gotten through exported functions, to making laying stuff out more reasonable?
        if (p.showScore) {
            s = "" + playerScore(player);
            sW = s.length * font.charWidth + 3;
            h += font.charHeight;
            offsetY += font.charHeight + 1;
        }
        if (p.showLife) {
            l = "" + playerLife(player);
            lW = _heartImage.width + _multiplierImage.width + l.length * font.charWidth + 2;
            h += _heartImage.height;
        }

        const w = Math.max(sW, lW);

        // bump size for space between lines
        if (p.showScore && p.showLife) h++;

        const x = p.x - (p.left ? w : 0);
        const y = p.y - (p.up ? h : 0);

        // Bordered Box
        if (p.showScore || p.showLife) {
            screen.fillRect(x, y, w, h, p.border);
            screen.fillRect(x + 1, y + 1, w - 2, h - 2, p.bg);
        }

        // print score
        if (p.showScore) {
            const bump = p.left ? w - sW: 0;
            screen.print(s, x + offsetX + bump + 1, y + 2, p.fc, font);
        }

        // print life
        if (p.showLife) {
            const bump = p.left ? w - lW: 0;
            let mult = _multiplierImage.clone();
            mult.replace(1, p.fc);

            screen.drawTransparentImage(_heartImage, x + offsetX + bump, y + offsetY);
            screen.drawTransparentImage(mult, x + _heartImage.width + offsetX + bump, y + offsetY + font.charHeight - _multiplierImage.height - 1);
            screen.print(l, x + offsetX + _heartImage.width + _multiplierImage.width + 1 + bump, y + offsetY, p.fc, font);
        }

        // print player
        if (p.showPlayer) {
            const pNum = "" + p.player;
            const pW = pNum.length * font.charWidth;
            const pH = Math.max(h, font.charHeight + 2);
            const pX = p.left ? (x - pW + 1) : (x + w - 1);

            screen.fillRect(pX, y, pW, pH, p.border);
            screen.print(pNum, pX + 1, y + (pH / 2) - (font.charHeight / 2), p.bg, font);
        }
    }
}