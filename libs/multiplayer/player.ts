namespace mp {
    const MAX_PLAYERS = 4;

    export enum PlayerNumber {
        //% block="1"
        One = 1,
        //% block="2"
        Two = 2,
        //% block="3"
        Three = 3,
        //% block="4"
        Four = 4
    }

    export enum PlayerProperty {
        //% block="index"
        Index = 1,
        //% block="number"
        Number = 2
    }

    export enum MultiplayerButton {
        //% block="A"
        A,
        //% block="B"
        B,
        //% block="up"
        Up,
        //% block="right"
        Right,
        //% block="down"
        Down,
        //% block="left"
        Left
    }

    class ButtonHandler {
        constructor(public button: MultiplayerButton, public event: ControllerButtonEvent, public handler: (player: Player) => void) {
        }
    }

    class ControllerEventHandler {
        constructor(public event: ControllerEvent, public handler: (player: Player) => void) {
        }
    }

    class ScoreHandler {
        constructor(public target: number, public handler: (player: Player) => void) {
        }
    }

    /**
     * A player in the game
     */
    export class Player {
        _sprite: Sprite;
        _state: number[];
        _index: number;
        _data: any;
        _mwb: boolean;
        _vx: number;
        _vy: number;

        constructor(index: number) {
            this._index = index;
        }

        get index(): number {
            return this._index;
        }

        get number(): number {
            return this._index + 1;
        }

        get data(): any {
            if (!this._data) this._data = {};
            return this._data;
        }

        set data(value: any) {
            this._data = value;
        }

        getProperty(prop: PlayerProperty): number {
            switch (prop) {
                case PlayerProperty.Index: return this.index;
                case PlayerProperty.Number: return this.number;
                default: return 0;
            }
        }

        getSprite(): Sprite {
            return this._sprite;
        }

        setSprite(sprite: Sprite) {
            if (sprite && sprite.image) {
                // Passing 'implicit' flag so we don't override icons that
                // user has explicitly defined.
                mp.postPresenceIcon(
                    this.number,
                    sprite.image,
                    /** implicit **/ true
                );
            } else {
                // Passing 'implicit' flag so we don't override icons that
                // user has explicitly defined.
                mp.postPresenceIcon(
                    this.number,
                    undefined,
                    /** implicit **/ true
                );

            }

            if (this._sprite && this._mwb) {
                this._getController().stopControllingSprite(this._sprite);
            }

            this._sprite = sprite;

            if (this._sprite && this._mwb) {
                this._getController().moveSprite(this._sprite, this._vx, this._vy);
            }
        }

        moveWithButtons(vx?: number, vy?: number) {
            this._mwb = true;
            this._vx = vx;
            this._vy = vy;
            this._getController().moveSprite(this.getSprite(), vx, vy);
        }

        getState(key: number): number {
            if (key === MultiplayerState.score) {
                return this._getInfo().score();
            }
            if (key === MultiplayerState.life) {
                return this._getInfo().life();
            }
            return this._getState(key);
        }

        setState(key: number, val: number) {
            if (key === MultiplayerState.score) {
                this._getInfo().setScore(val);
            }
            if (key === MultiplayerState.life) {
                this._getInfo().setLife(val);
            }
            this._setState(key, val);
        }

        _setState(key: number, val: number) {
            this._ensureState(key);
            if (this._state.length > key)
                this._state[key] = val;
        }

        _getState(key: number): number {
            this._ensureState(key);
            return (this._state.length > key) ? this._state[key] : 0;
        }

        _ensureState(key: number) {
            if (!this._state) this._state = [];
            if (key < 0 || key > 255) return;
            while (this._state.length < key) this._state.push(0);
        }

        _getInfo(): info.PlayerInfo {
            switch (this._index) {
                case 0: return info.player1;
                case 1: return info.player2;
                case 2: return info.player3;
                case 3: return info.player4;
                default: return undefined;
            }
        }

        _getController(): controller.Controller {
            switch (this._index) {
                case 0: return controller.player1 as any;
                case 1: return controller.player2;
                case 2: return controller.player3;
                case 3: return controller.player4;
            }
            return undefined;
        }
    }

    class MPState {
        players: Player[];
        buttonHandlers: ButtonHandler[];
        controllerEventHandlers: ControllerEventHandler[];
        scoreHandlers: ScoreHandler[];
        lifeZeroHandler: (player: Player) => void;
        indicatorsVisible: boolean;
        indicatorRenderable: scene.Renderable;

        constructor() {
            this.players = [];
            for (let i = 0; i < MAX_PLAYERS; ++i)
                this.players.push(new Player(i));
            this.buttonHandlers = [];
            this.controllerEventHandlers = [];
            this.scoreHandlers = [];
            this.indicatorsVisible = false;
        }

        onButtonEvent(button: MultiplayerButton, event: ControllerButtonEvent, handler: (player: Player) => void) {
            const existing = this.getButtonHandler(button, event);

            if (existing) {
                existing.handler = handler;
                return;
            }

            this.buttonHandlers.push(new ButtonHandler(button, event, handler));

            for (const player of this.players) {
                getButton(player._getController(), button).onEvent(event, () => {
                    this.getButtonHandler(button, event).handler(player);
                })
            }
        }

        onControllerEvent(event: ControllerEvent, handler: (player: Player) => void) {
            const existing = this.getControllerEventHandler(event);

            if (existing) {
                existing.handler = handler;
                return;
            }

            this.controllerEventHandlers.push(new ControllerEventHandler(event, handler));

            for (const player of this.players) {
                player._getController().onEvent(event, () => {
                    this.getControllerEventHandler(event).handler(player);
                })
            }
        }

        onReachedScore(score: number, handler: (player: Player) => void) {
            const existing = this.getScoreHandler(score);

            // Overwrite the existing handler for this score. Last one wins.
            if (existing) {
                existing.handler = handler;
                return;
            }

            this.scoreHandlers.push(new ScoreHandler(score, handler));

            for (const player of this.players) {
                player._getInfo().onScore(score, () => {
                    this.getScoreHandler(score).handler(player);
                })
            }
        }

        onLifeZero(handler: (player: Player) => void) {
            if (!this.lifeZeroHandler) {
                for (const player of this.players) {
                    player._getInfo().onLifeZero(() => {
                        this.lifeZeroHandler(player);
                    })
                }
            }
            this.lifeZeroHandler = handler;
        }

        setPlayerIndicatorsVisible(visible: boolean) {
            this.indicatorsVisible = visible;

            if (visible && !this.indicatorRenderable) {
                this.indicatorRenderable = scene.createRenderable(99, (target, camera) => {
                    if (this.indicatorsVisible) this.drawIndicators(target, camera);
                })
            }
        }

        getButtonHandler(button: MultiplayerButton, event: ControllerButtonEvent) {
            for (const handler of this.buttonHandlers) {
                if (handler.button === button && handler.event === event) return handler;
            }
            return undefined;
        }

        getControllerEventHandler(event: ControllerEvent) {
            for (const handler of this.controllerEventHandlers) {
                if (handler.event === event) return handler;
            }
            return undefined;
        }


        getScoreHandler(score: number) {
            for (const handler of this.scoreHandlers) {
                if (handler.target === score) return handler;
            }
            return undefined;
        }

        drawIndicators(target: Image, camera: scene.Camera) {
            for (const player of this.players) {
                const sprite = player.getSprite();

                if (!sprite || sprite.flags & (sprites.Flag.Destroyed | sprites.Flag.Invisible)) {
                    continue;
                }

                let top = Fx.toInt(sprite._hitbox.top)
                let bottom = Fx.toInt(sprite._hitbox.bottom)
                let left = Fx.toInt(sprite._hitbox.left)
                let right = Fx.toInt(sprite._hitbox.right)

                if (!(sprite.flags & sprites.Flag.RelativeToCamera)) {
                    top -= camera.drawOffsetY;
                    bottom -= camera.drawOffsetY;
                    left -= camera.drawOffsetX;
                    right -= camera.drawOffsetX;
                }

                if (left < 0) {
                    const indicator = _indicatorForPlayer(player.number, CollisionDirection.Right);
                    target.drawTransparentImage(
                        indicator,
                        Math.max(right + 2, 0),
                        Math.min(
                            Math.max(
                                (top + ((bottom - top) >> 1) - (indicator.height >> 1)),
                                0
                            ),
                            screen.height - indicator.height
                        )
                    )
                }
                else if (right > 160) {
                    const indicator = _indicatorForPlayer(player.number, CollisionDirection.Left);
                    target.drawTransparentImage(
                        indicator,
                        Math.min(left - indicator.width - 2, screen.width - indicator.width),
                        Math.min(
                            Math.max(
                                (top + ((bottom - top) >> 1) - (indicator.height >> 1)),
                                0
                            ),
                            screen.height - indicator.height
                        )
                    )
                }
                else if (top < 18) {
                    const indicator = _indicatorForPlayer(player.number, CollisionDirection.Bottom);
                    target.drawTransparentImage(
                        indicator,
                        (left + ((right - left) >> 1) - (indicator.width >> 1)),
                        Math.max(bottom + 2, 0)
                    )
                }
                else {
                    const indicator = _indicatorForPlayer(player.number, CollisionDirection.Top);
                    target.drawTransparentImage(
                        indicator,
                        (left + ((right - left) >> 1) - (indicator.width >> 1)),
                        Math.min(top - indicator.height - 2, screen.height - indicator.height)
                    )
                }
            }
        }
    }

    let stateStack: MPState[];

    function init() {
        if (stateStack) return;
        stateStack = [new MPState()];
        game.addScenePushHandler(() => {
            stateStack.push(new MPState());
        });
        game.addScenePopHandler(() => {
            stateStack.pop();
            if (stateStack.length === 0) stateStack.push(new MPState());
        });
    }

    export function _mpstate() {
        init();
        return stateStack[stateStack.length - 1];
    }

    function getButton(ctrl: controller.Controller, button: MultiplayerButton) {
        switch (button) {
            case MultiplayerButton.A: return ctrl.A;
            case MultiplayerButton.B: return ctrl.B;
            case MultiplayerButton.Up: return ctrl.up;
            case MultiplayerButton.Right: return ctrl.right;
            case MultiplayerButton.Down: return ctrl.down;
            case MultiplayerButton.Left: return ctrl.left;
        }
    }

    /**
     * Gets the sprite of the player
     * @param player The player to get the sprite of
     * @returns The sprite of the player, or undefined if the player has no assigned sprite
     */
    //% blockId=mp_getPlayerSprite
    //% block="$player sprite"
    //% player.shadow=mp_playerSelector
    //% group=Player
    //% weight=80
    //% blockGap=8
    //% help=multiplayer/get-player-sprite
    //% parts="multiplayer"
    export function getPlayerSprite(player: Player): Sprite {
        if (!player) return undefined;
        return player.getSprite();
    }

    /**
     * Sets the sprite of the player
     * @param player The player to set the sprite for
     * @param sprite The sprite to set
     */
    //% blockId=mp_setPlayerSprite
    //% block="set $player sprite to $sprite"
    //% player.shadow=mp_playerSelector
    //% sprite.shadow=spritescreate
    //% group=Player
    //% weight=120
    //% blockGap=8
    //% help=multiplayer/set-player-sprite
    //% parts="multiplayer"
    export function setPlayerSprite(player: Player, sprite: Sprite) {
        if (!player) return;
        player.setSprite(sprite);
    }

    /**
     * Selects one of the players by number
     * @param number The player number
     * @returns The player
     */
    //% blockId=mp_playerSelector
    //% block="player $number"
    //% group=Player
    //% weight=100
    //% blockGap=8
    //% help=multiplayer/player-selector
    //% parts="multiplayer"
    export function playerSelector(number: PlayerNumber): Player {
        const index = number - 1;
        return getPlayerByIndex(index);
    }

    /**
     * Returns an array of all players
     */
    //% blockId=mp_allPlayers
    //% block="array of all players"
    //% group=Player
    //% weight=90
    //% blockGap=8
    //% help=multiplayer/get-all-players
    //% parts="multiplayer"
    export function allPlayers(): Player[] {
        return _mpstate().players.slice();
    }

    /**
     * Gets the player the sprite is assigned to
     * @param sprite the sprite
     * @returns Player, or undefined if not found
     */
    //% blockId=mp_getPlayerBySprite
    //% block="$sprite player"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% group=Player
    //% weight=70
    //% blockGap=8
    //% help=multiplayer/get-player-by-sprite
    //% parts="multiplayer"
    export function getPlayerBySprite(sprite: Sprite): Player {
        for (const player of _mpstate().players) {
            if (player.getSprite() === sprite) return player;
        }
        return undefined;
    }

    /**
     * Control a player's sprite with directional buttons
     * @param player The player to control
     * @param vx The horizontal velocity of the sprite (optional)
     * @param vy The vertical velocity of the sprite (optional)
     */
    //% blockId=mp_moveWithButtons
    //% block="move $player with buttons||vx $vx vy $vy"
    //% player.shadow=mp_playerSelector
    //% vx.defl=100
    //% vy.defl=100
    //% vx.shadow="spriteSpeedPicker"
    //% vy.shadow="spriteSpeedPicker"
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% group=Controller
    //% weight=100
    //% blockGap=8
    //% help=multiplayer/move-with-buttons
    //% parts="multiplayer"
    export function moveWithButtons(player: Player, vx?: number, vy?: number) {
        if (!player) return;
        player.moveWithButtons(vx, vy);
    }

    /**
     * Runs code when a button on any controller is pressed, released, or held
     * @param button The button to listen for
     * @param event The event to listen for (pressed, released, or held)
     * @param handler The code to run when the button is pressed, released, or held
     */
    //% blockId=mp_onButtonEvent
    //% block="on $button button $event for $player"
    //% draggableParameters=reporter
    //% group=Controller
    //% weight=90
    //% blockGap=8
    //% help=multiplayer/on-button-event
    //% parts="multiplayer"
    export function onButtonEvent(button: MultiplayerButton, event: ControllerButtonEvent, handler: (player: Player) => void) {
        _mpstate().onButtonEvent(button, event, handler);
    }

    /**
     * Queries the state of a button on a controller
     * @param player The player to query
     * @param button The button to query
     * @returns true if the button is pressed
     */
    //% blockId=mp_isButtonPressed
    //% block="is $player $button button pressed"
    //% player.shadow=mp_playerSelector
    //% group=Controller
    //% weight=80
    //% blockGap=8
    //% help=multiplayer/is-button-pressed
    //% parts="multiplayer"
    export function isButtonPressed(player: Player, button: MultiplayerButton): boolean {
        if (!player) return false;
        return getButton(player._getController(), button).isPressed();
    }

    /**
     * Runs code when a controller is connected or disconnected
     * @param event The event to listen for (controller connected or disconnected)
     * @param handler Code to run when the event is raised
     */
    //% blockId=mp_onControllerEvent
    //% block="on $player $event"
    //% draggableParameters=reporter
    //% group=Controller
    //% weight=70
    //% blockGap=8
    //% help=multiplayer/on-controller-event
    //% parts="multiplayer"
    export function onControllerEvent(event: ControllerEvent, handler: (player: Player) => void) {
        _mpstate().onControllerEvent(event, handler);
    }

    /**
     * Queries the connected state of the player
     * @param player The player to query
     * @returns true if the player is connected
     */
    //% blockId=mp_isConnected
    //% block="$player connected"
    //% player.shadow=mp_playerSelector
    //% group=Controller
    //% weight=60
    //% blockGap=8
    //% help=multiplayer/is-connected
    //% parts="multiplayer"
    export function isConnected(player: Player): boolean {
        if (!player) return false;
        return player._getController().connected;
    }

    /**
     * Gets the value of the specified player state
     * @param player The player to get the state for
     * @param state The state to get
     * @returns The value of the state
     */
    //% blockId=mp_getPlayerState
    //% block="$player $state"
    //% player.shadow=mp_playerSelector
    //% state.shadow=mp_multiplayerstate
    //% group=Info
    //% weight=100
    //% blockGap=8
    //% help=multiplayer/get-player-state
    //% parts="multiplayer"
    export function getPlayerState(player: Player, state: number): number {
        if (!player) return 0;
        return player.getState(state);
    }

    /**
     * Sets the value of the specified player state
     * @param player The player to set the state for
     * @param state The state to set
     * @param value The value to set the state to
     */
    //% blockId=mp_setPlayerState
    //% block="set $player $state to $value"
    //% player.shadow=mp_playerSelector
    //% state.shadow=mp_multiplayerstate
    //% group=Info
    //% weight=90
    //% blockGap=8
    //% help=multiplayer/set-player-state
    //% parts="multiplayer"
    export function setPlayerState(player: Player, state: number, value: number) {
        if (!player) return;
        player.setState(state, value);
    }

    /**
     * Changes the value of the specified player state
     * @param player The player to change the state for
     * @param state The state to change
     * @param delta The amount to change the state by
     */
    //% blockId=mp_changePlayerStateBy
    //% block="change $player $state by $delta"
    //% player.shadow=mp_playerSelector
    //% state.shadow=mp_multiplayerstate
    //% delta.defl=1
    //% group=Info
    //% weight=80
    //% blockGap=8
    //% help=multiplayer/change-player-state-by
    //% parts="multiplayer"
    export function changePlayerStateBy(player: Player, state: number, delta: number) {
        if (!player) return;
        player.setState(state, player.getState(state) + delta);
    }

    /**
     * Gets a property of the player
     * @param player The player to get the property of
     * @param prop The property to get
     * @returns The value of the property
     */
    //% blockId=mp_getPlayerProperty
    //% block="$player $prop"
    //% player.shadow=mp_playerSelector
    //% group=Info
    //% weight=100
    //% blockGap=8
    //% help=multiplayer/get-player-property
    //% parts="multiplayer"
    export function getPlayerProperty(player: Player, prop: PlayerProperty): number {
        if (!player) return 0;
        return player.getProperty(prop);
    }

    /**
     * Runs code once each time a player's score reaches a given value.
     * @param score The score to check for, eg: 100
     * @param handler The code to run when the score is reached
     */
    //% blockId=mp_onScore
    //% block="on score $score for $player"
    //% score.defl=100
    //% draggableParameters=reporter
    //% group=Info
    //% weight=70
    //% blockGap=8
    //% help=multiplayer/on-score
    //% parts="multiplayer"
    export function onScore(score: number, handler: (player: Player) => void) {
        _mpstate().onReachedScore(score, handler);
    }

    /**
     * Runs code when a player's number of lives reaches zero
     * @param handler The code to run when the lives reach zero
     */
    //% blockId=mp_onLifeZero
    //% block="on life zero for $player"
    //% draggableParameters=reporter
    //% group=Info
    //% weight=60
    //% blockGap=8
    //% help=multiplayer/on-life-zero
    //% parts="multiplayer"
    export function onLifeZero(handler: (player: Player) => void) {
        _mpstate().onLifeZero(handler);
    }

    //% blockId=mp_gameOverPlayerWin
    //% block="game over $player wins"
    //% player.shadow=mp_playerSelector
    //% group=Game
    //% weight=100
    //% blockGap=8
    //% help=multiplayer/game-over-player-win
    //% parts="multiplayer"
    export function gameOverPlayerWin(player: Player) {
        if (!player) return;
        game.gameOverPlayerWin(player.number);
    }

    /**
     * Gets the player by number
     * @param number The one-based number of the player
     * @returns Player, or undefined if not found
     */
    //% blockId=mp_getPlayerByNumber
    //% block="player $number"
    //% number.shadow=variables_get
    //% number.defl=number
    //% group=Utility
    //% weight=80
    //% blockGap=8
    //% help=multiplayer/get-player-by-number
    //% parts="multiplayer"
    export function getPlayerByNumber(number: number): Player {
        const index = number - 1;
        return getPlayerByIndex(index);
    }

    /**
     * Gets the player by index
     * @param index The zero-based index of the player
     * @returns Player, or undefined if not found
     */
    //% blockId=mp_getPlayerByIndex
    //% block="player at $index"
    //% index.shadow=variables_get
    //% index.defl=index
    //% group=Utility
    //% weight=80
    //% blockGap=8
    //% help=multiplayer/get-player-by-index
    //% parts="multiplayer"
    export function getPlayerByIndex(index: number): Player {
        if (index < 0 || index >= MAX_PLAYERS) return undefined;
        return _mpstate().players[index];
    }

    /**
     * Turns player indicators on or off
     * @param visible indicator visibility
     */
    //% blockId=mp_setPlayerIndicatorsVisible
    //% block="set player indicators $visible"
    //% visible.shadow=toggleOnOff
    //% visible.defl=true
    //% group=Utility
    //% weight=100
    //% blockGap=8
    //% help=multiplayer/set-player-indicators-visible
    //% parts="multiplayer"
    export function setPlayerIndicatorsVisible(visible: boolean) {
        _mpstate().setPlayerIndicatorsVisible(visible);
    }
}
