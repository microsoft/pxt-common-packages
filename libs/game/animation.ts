/*
   Animation library for sprites (Image/Frame Animation only)
*/
//% color="#03AA74" weight=100 icon="\uf021" block="Animation"
//% groups='["Animate", "Advanced"]'
//% weight=5
namespace animation2 {
    const stateNamespace = "__animation";

    interface AnimationState {
        animations: SpriteAnimation[];
    }

    export abstract class SpriteAnimation {
        protected elapsedTime: number;

        constructor(public sprite: Sprite, protected loop: boolean) {
            this.elapsedTime = 0;
        }

        public init() {
            let state: AnimationState = game.currentScene().data[stateNamespace];

            // Register animation updates to fire when frames are rendered
            if (!state) {
                state = game.currentScene().data[stateNamespace] = {
                    animations: []
                } as AnimationState;

                game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                    state.animations = state.animations.filter((anim: SpriteAnimation) => {
                        if (anim.sprite.flags & sprites.Flag.Destroyed)
                            return false;
                        return !anim.update(); // If update returns true, the animation is done and will be removed
                    });
                });
            }

            // Remove any other animations of this type and attached to this sprite
            state.animations = state.animations.filter((anim: SpriteAnimation) => {
                return !(anim.sprite === this.sprite &&
                    ((anim instanceof ImageAnimation && this instanceof ImageAnimation)));
            });

            state.animations.push(this);
        }

        public update(): boolean {
            // This should be implemented by subclasses
            return false;
        }
    }

    export class ImageAnimation extends SpriteAnimation {
        private lastFrame: number;

        constructor(sprite: Sprite, private frames: Image[], private frameInterval: number, loop?: boolean) {
            super(sprite, loop);
            this.lastFrame = -1;
        }

        public update(): boolean {
            this.elapsedTime += game.eventContext().deltaTimeMillis;

            const frameIndex = Math.floor(this.elapsedTime / this.frameInterval);

            if (this.lastFrame != frameIndex && this.frames.length) {
                if (!this.loop && frameIndex >= this.frames.length) {
                    return true;
                }
                const newImage = this.frames[frameIndex % this.frames.length];
                if (this.sprite.image !== newImage) {
                    this.sprite.setImage(newImage);
                }
            }
            this.lastFrame = frameIndex;
            return false;
        }
    }

    /**
     * Create and run an image animation on a sprite
     * @param frames the frames to animate through
     * @param sprite the sprite to animate on
     * @param frameInterval the time between changes, eg: 500
     */
    //% blockId=run_image_animation
    //% block="animate $sprite=variables_get(mySprite) frames $frames=animation_editor interval (ms) $frameInterval=timePicker loop $loop=toggleOnOff"
    //% group="Animate"
    //% weight=100
    //% help=animation/run-image-animation
    export function runImageAnimation(sprite: Sprite, frames: Image[], frameInterval?: number, loop?: boolean) {
        const anim = new ImageAnimation(sprite, frames, frameInterval || 500, !!loop);
        anim.init();
    }

    export enum AnimationTypes {
        //% block="all"
        All,
        //% block="frame"
        ImageAnimation
    }

    /**
     * Stop one type or all animations (simple and looping) on a sprite
     * @param type the animation type to stop
     * @param sprite the sprite to filter animations by
     */
    //% blockId=stop_animations
    //% block="stop %type animations on %sprite=variables_get(mySprite)"
    //% group="Animate"
    //% weight=60
    //% help=animation/stop-animation
    export function stopAnimation(type: AnimationTypes, sprite: Sprite) {
        let state: AnimationState = game.currentScene().data[stateNamespace];
        if (state && state.animations) {
            state.animations = state.animations.filter((anim: SpriteAnimation) => {
                if (anim.sprite === sprite) {
                    switch (type) {
                        case AnimationTypes.ImageAnimation:
                            if (anim instanceof ImageAnimation) return false;
                            break;
                        case AnimationTypes.All:
                            return false;
                    }
                }
                return true;
            });
        }
        if (type == AnimationTypes.All || type == AnimationTypes.ImageAnimation) {
            //stop state based animation if any as well
            sprite._action = -1
        }
    }

    //% blockId=animation_editor block="%frames"
    //% shim=TD_ID
    //% frames.fieldEditor="animation"
    //% frames.fieldOptions.decompileLiterals="true"
    //% frames.fieldOptions.filter="!tile !dialog !background"
    //% weight=40
    //% group="Animate" duplicateShadowOnDrag
    //% help=animation/animation-frames
    export function _animationFrames(frames: Image[]) {
        return frames
    }
}
