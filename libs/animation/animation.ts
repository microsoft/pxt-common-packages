/*
    Animation library for sprites
*/
//% color="#03AA74" weight=88 icon="\uf021"
namespace animation {
    //Handles all the updates
    let _onAnimUpdate: (() => void)[] = null;
    let _onSpriteUpdate: (() => void)[] = null;

    export class Animation {

        frames: Image[];
        index: number;
        interval: number;
        action: number;
        lastTime: number;

        constructor(action: number, interval: number) {
            this.interval = interval;
            this.index = -1;
            this.action = action;
            this.frames = [];
            this.lastTime = control.millis();

            this._init();
        }

        _init() {
            if (!_onAnimUpdate) {
                _onAnimUpdate = [];
                game.eventContext().registerFrameHandler(15, () => {
                    _onAnimUpdate.forEach(element => {
                        element();
                    });
                });
            }
            _onAnimUpdate.push(() => this.update());
        }

        update() {
            let currentTime = control.millis();
            let dt = currentTime - this.lastTime;
            if (dt >= this.interval && this.frames.length) {
                this.index = (this.index + 1) % this.frames.length;
                this.lastTime = currentTime;
            }
        }

        getImage() {
            return this.frames[this.index];
        }

        getAction() {
            return this.action;
        }

        getInterval() {
            return this.interval;
        }

        setInterval(interval: number) {
            this.interval = interval;
        }

        /**
        * Add an image frame to an animation
        */
        //% blockId=addAnimationFrame
        //% block="add frame $frame=screen_image_picker to $this=variables_get(anim)"
        //% weight=40
        //% help=animation/add-animation
        addAnimationFrame(frame: Image) {
            this.frames[++this.index] = frame;
        }

    }

    //% shim=ENUM_GET
    //% blockId=action_enum_shim
    //% block="%arg"
    //% enumName="ActionKind"
    //% enumMemberName="action"
    //% enumPromptHint="e.g. Walking, Idle, Jumping, ..."
    //% enumInitialMembers="Walking, Idle, Jumping"
    //% weight=10
    export function _actionEnumShim(arg: number) {
        // This function should do nothing, but must take in a single
        // argument of type number and return a number value.
        return arg;
    }

    /**
     * Create an animation
     */
    //% blockId=createAnimation
    //% block="create animation of $action=action_enum_shim with interval $interval ms"
    //% interval.defl=1000
    //% blockSetVariable="anim"
    //% weight=50
    //% help=animation/create-animation
    export function createAnimation(action: number, interval: number) {
        return new Animation(action, interval);
    }

    /**
     * Attach an animation to a sprite
     */
    //% blockId=attachAnimation
    //% block="attach animation $set=variables_get(anim) to sprite $sprite=variables_get(mySprite)"
    //% weight=30
    //% help=animation/attach-animation
    export function attachAnimation(sprite: Sprite, set: Animation) {
        if (!_onSpriteUpdate) {
            //First attach register the update call back.
            //Priority 16 is slightly lower than 15 for animation update loop.
            //This is allow the animation to complete, so we have the new display ready to go.
            _onSpriteUpdate = [];
            game.eventContext().registerFrameHandler(16, () => {
                _onSpriteUpdate.forEach(element => {
                    element();
                });
            });
        }

        _onSpriteUpdate.push(() => {
            if (sprite._action === set.action) {
                let newImage = set.getImage();
                //Update only if the image has changed
                if (sprite.image !== newImage) {
                    sprite.setImage(newImage)
                }
            }
        })
    }

    /**
     * Set an animation action to a sprite
     */
    //% blockId=setAction
    //% block="activate animation $action=action_enum_shim on $sprite=variables_get(mySprite)"
    //% weight=20
    //% help=animation/set-action
    export function setAction(sprite: Sprite, action: number) {
        sprite._action = action;
    }

}