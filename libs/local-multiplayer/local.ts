//%
namespace local {
    export enum PlayerNumber {
        //% block="player one"
        One = 1,
        //% block="player two"
        Two,
        //% block="player three"
        Three,
        //% block="player four"
        Four
    }

    enum ButtonOffset {
        Left = 0,
        Up,
        Right,
        Down,
        A,
        B,
        Menu
    }

    let playerSprites: Sprite[];

    /**
     * Set the sprite for a player
     */
    //% weight=100
    //% blockId=local_setplayersprite block="set sprite for $player to $sprite"
    export function setPlayerSprite(player: PlayerNumber, sprite: Sprite) {
        if (!playerSprites) playerSprites = [];
        playerSprites[player] = sprite;

        // Set up events
        left._initPlayer(player);
        up._initPlayer(player);
        right._initPlayer(player);
        down._initPlayer(player);
        A._initPlayer(player);
        B._initPlayer(player);
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
        //% weight=99 blockGap=8 help=controller/button/on-event draggableParameters
        //% blockId=local_keyonevent block="on $this **button** $event $player $playerSprite"
        onEvent(event: ControllerButtonEvent, handler: (player: number, playerSprite: Sprite) => void) {
            if (!this.handlers) this.handlers = [];
            this.handlers[event] = handler;
        }

        /**
         * Pauses until a button is pressed or released
         */
        //% weight=98 blockGap=8 help=controller/button/pause-until
        //% blockId=local_keypauseuntil block="pause until $player $this **button** is $event"
        pauseUntil(player: PlayerNumber, event: ControllerButtonEvent) {
            this._initPlayer(player);
            this.buttons[player].pauseUntil(event);
        }
        

        /**
         * Indicates if the button is currently pressed
        */
        //% weight=96 blockGap=8 help=controller/button/is-pressed
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
    export const left = new MetaButton(ButtonOffset.Left)
    //% fixedInstance block="up"
    export const up = new MetaButton(ButtonOffset.Up)
    //% fixedInstance block="right"
    export const right = new MetaButton(ButtonOffset.Right)
    //% fixedInstance block="down"
    export const down = new MetaButton(ButtonOffset.Down)
    //% fixedInstance block="A"
    export const A = new MetaButton(ButtonOffset.A)
    //% fixedInstance block="B"
    export const B = new MetaButton(ButtonOffset.B)
}