/*
    Animation library for sprites
*/
//% color="#03AA74" weight=88 icon="\uf021"
namespace animation {

    export class Animation {

        frames: Image[];
        index: number;
        interval: number;
        action: number;
        timer: number;
            
        constructor(action: number, interval: number) {
            this.interval = interval;
            this.timer = interval;
            this.index = -1;
            this.action = action;
            this.frames = [];
        }
    
        update(dt: number) {
            this.timer -= dt;
            if (this.timer <= 0 && this.frames.length) {
                this.index = (this.index + 1) % this.frames.length;
                this.timer = this.interval;
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

        //% blockId=addAnimationFrame
        //% block="add frame $frame=screen_image_picker to $this=variables_get(anim)"
        //% weight=40
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
     * Creates an animation
     */
    //% blockId=createAnimation 
    //% block="create animation of $action=action_enum_shim with interval $interval ms"
    //% interval.defl=1000
    //% blockSetVariable="anim" 
    //% weight=50
    export function createAnimation(action: number, interval: number) {
        const f = new Animation(action, interval);
        let lastTime = control.millis();
        game.onUpdate(function () {
            let currentTime = control.millis();
            f.update(currentTime - lastTime);
            lastTime = currentTime;
        })
        return f;
    }

    /**
     * attaches an animation to a sprite
     */
    //% blockId=attachAnimation 
    //% block="attach animation $set=variables_get(anim) to sprite $sprite=variables_get(agent)"
    //% weight=30
    export function attachAnimation(sprite: Sprite, set: Animation) {
        game.onUpdate(function () {
            if (sprite._action === set.action) {
                sprite.setImage(set.getImage())
            }
        })
    }

    /**
     * Sets the action to Sprite
     */
    //% blockId=setAction
    //% block="activate animation $action=action_enum_shim on $sprite=variables_get(agent)"
    //% weight=20
    export function setAction(sprite: Sprite, action: number) {
        sprite._action = action;
    }    
  
}