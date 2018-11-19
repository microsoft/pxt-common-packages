enum PlayerNumber {
    //% block="player one"
    One = 1,
    //% block="player two"
    Two,
    //% block="player three"
    Three,
    //% block="player four"
    Four
}

//% groups='["other","Multiplayer"]'
namespace controller {

    enum ButtonOffset {
        Left = 0,
        Up,
        Right,
        Down,
        A,
        B,
        Menu
    }

    interface ControlledPlayer {
        p: PlayerNumber;
        s: Sprite;
        vx: PlayerNumber;
        vy: PlayerNumber;
    }

    let playerSprites: Sprite[];
    let controlledPlayers: ControlledPlayer[];

    /**
     * Set the sprite for a player
     */
    //% weight=100 group="Multiplayer"
    //% blockId=local_setplayersprite block="set sprite for $player to $sprite"
    //% sprite.shadow="spritescreate"
    export function setPlayerSprite(player: PlayerNumber, sprite: Sprite) {
        if (!playerSprites) playerSprites = [];
        playerSprites[player] = sprite;

        for (let i = 0; controlledPlayers && i < controlledPlayers.length; i++) {
            if (controlledPlayers[i].p === player) {
                controlledPlayers[i].s = sprite;
                break;
            }
        }

        // Set up events
        multiLeft._initPlayer(player);
        multiUp._initPlayer(player);
        multiRight._initPlayer(player);
        multiDown._initPlayer(player);
        multiA._initPlayer(player);
        multiB._initPlayer(player);
    }

    /**
     * Get the sprite for a player
     */
    //% weight=20 group="Multiplayer"
    //% blockId=local_playersprite block="%player sprite"
    export function playerSprite(player: PlayerNumber): Sprite {
        if (!playerSprites || !playerSprites[player]) return null;
        return playerSprites[player];
    }

    /**
     * Control a sprite using the direction buttons from the controller. Note that this
     * control will take over the vx and vy of the sprite and overwrite any changes
     * made unless a 0 is passed.
     *
     * @param player The Player to control
     * @param vx The velocity used for horizontal movement when left/right is pressed
     * @param vy The velocity used for vertical movement when up/down is pressed
     */
    //% blockId="local_game_control_player" block="move $player with buttons||vx $vx vy $vy"
    //% weight=99 group="Multiplayer"
    //% vx.defl=100 vy.defl=100
    export function controlPlayer(player: PlayerNumber, vx: number = 100, vy: number = 100) {        
        if (!controlledPlayers) {
            controlledPlayers = [];
            game.currentScene().eventContext.registerFrameHandler(19, () => {
                controlledPlayers.forEach(controlled => {
                    if (!controlled.s) return;

                    if (controlled.vx) {
                        controlled.s.vx = 0;

                        if (controller.multiRight.isPressed(controlled.p)) {
                            controlled.s.vx = controlled.vx;
                        }
                        if (controller.multiLeft.isPressed(controlled.p)) {
                            controlled.s.vx = -controlled.vx;
                        }
                    }

                    if (controlled.vy) {
                        controlled.s.vy = 0;

                        if (controller.multiDown.isPressed(controlled.p)) {
                            controlled.s.vy = controlled.vy;
                        }
                        if (controller.multiUp.isPressed(controlled.p)) {
                            controlled.s.vy = -controlled.vy;
                        }
                    }
                });
            });
        }

        for (let i = 0; controlledPlayers && i < controlledPlayers.length; i++) {
            if (controlledPlayers[i].p === player) {
                controlledPlayers[i].vx = vx;
                controlledPlayers[i].vy = vy;
                return;
            }
        }

        controlledPlayers.push({
            p: player,
            s: playerSprite(player),
            vx: vx,
            vy: vy
        });
    }

    /**
     * Run code for each player that has been assigned a sprite
     * @param handler the code to run for each player
     */
    export function forEachPlayer(handler: (player: PlayerNumber) => void) {
        if (!playerSprites) return;

        for (let player = 0; player < playerSprites.length; ++player) {
            if (playerSprites[player]) {
                handler(player);
            }
        }
    }

    //% fixedInstances
    export class MetaButton {
        buttonOffset: ButtonOffset;
        buttons: controller.Button[];
        handlers: ((player: number, sprite: Sprite) => void)[];

        constructor(button: ButtonOffset) {
            this.buttonOffset = button;
        }

        _initPlayer(player: PlayerNumber) {
            if (!this.buttons) this.buttons = [];
            if (this.buttons[player]) return;

            const b = new controller.Button(1 + 7 * (player - 1) + this.buttonOffset);
            this.buttons[player] = b;
            this.registerPlayerEvent(b, player, ControllerButtonEvent.Pressed);
            this.registerPlayerEvent(b, player, ControllerButtonEvent.Released);
            this.registerPlayerEvent(b, player, ControllerButtonEvent.Repeated);
        }

        /**
         * Run some code when a button is pressed or released
         */
        //% weight=98 blockGap=8 help=controller/button/on-event draggableParameters group="Multiplayer"
        //% blockId=local_keyonevent block="on $this **button** $event $player $playerSprite"
        onEvent(event: ControllerButtonEvent, handler: (player: number, playerSprite: Sprite) => void) {
            if (!this.handlers) this.handlers = [];
            this.handlers[event] = handler;
        }

        /**
         * Pauses until a button is pressed or released
         */
        //% weight=97 blockGap=8 group="Multiplayer"
        //% blockId=local_keypauseuntil block="pause until $player $this **button** is $event"
        pauseUntil(player: PlayerNumber, event: ControllerButtonEvent) {
            this._initPlayer(player);
            this.buttons[player].pauseUntil(event);
        }


        /**
         * Indicates if the button is currently pressed
        */
        //% weight=95 blockGap=8 group="Multiplayer"
        //% blockId=local_keyispressed block="is $player $this **button** pressed"
        isPressed(player: PlayerNumber) {
            this._initPlayer(player);
            return this.buttons[player].isPressed();
        }

        private registerPlayerEvent(b: controller.Button, player: PlayerNumber, event: ControllerButtonEvent) {
            b.onEvent(event, () => this.handleEvent(event, player));
        }

        private handleEvent(event: ControllerButtonEvent, player: PlayerNumber) {
            if (!this.handlers) return;

            const s = playerSprites && playerSprites[player];
            if (!s) return;

            const h = this.handlers[event];
            if (!h) return;

            h(player, s);
        }
    }

    //% fixedInstance block="left"
    export const multiLeft = new MetaButton(ButtonOffset.Left)
    //% fixedInstance block="up"
    export const multiUp = new MetaButton(ButtonOffset.Up)
    //% fixedInstance block="right"
    export const multiRight = new MetaButton(ButtonOffset.Right)
    //% fixedInstance block="down"
    export const multiDown = new MetaButton(ButtonOffset.Down)
    //% fixedInstance block="A"
    export const multiA = new MetaButton(ButtonOffset.A)
    //% fixedInstance block="B"
    export const multiB = new MetaButton(ButtonOffset.B)
}