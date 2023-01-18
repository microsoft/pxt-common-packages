/*
    Animation library for sprites
*/
//% color="#03AA74" weight=100 icon="\uf021" block="Animation"
//% groups='["Animate", "Advanced"]'
//% advanced=true
namespace animation {
    const stateNamespace = "__animation";

    interface AnimationState {
        animations: SpriteAnimation[];
    }

    export class Point {
        public x: number;
        public y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    //% fixedInstances blockId=animation_path block="path %pathString"
    export class PathPreset {
        constructor(public pathString: string) {
        }
    }

    export class Path {
        length: number;

        protected args: number[];
        protected currentCommand: string;
        protected lastControlX: number;
        protected lastControlY: number;

        protected startX: number;
        protected startY: number;

        protected lastX: number;
        protected lastY: number;

        protected strIndex: number;
        protected commandIndex: number;

        constructor(protected path: string) {
            this.strIndex = 0;

            // Run through the path once to get the length and check for errors
            this.length = 0;
            while (this.strIndex < this.path.length) {
                this.readNextCommand();
                if (this.currentCommand) this.length++;
            }

            this.reset();
        }

        protected readNextCommand() {
            if (this.strIndex >= this.path.length) {
                this.currentCommand = undefined;
                return;
            }

            this.currentCommand = this.readNextToken();

            if (!this.currentCommand) return;

            this.args = [];

            const numArgs = Path.commandToArgCount(this.currentCommand);

            if (numArgs === -1) throw "Unknown path command '" + this.currentCommand +"'";

            for (let i = 0; i < numArgs; i++) {
                this.args.push(parseFloat(this.readNextToken()))
            }

            for (const arg of this.args) {
                if (Number.isNaN(arg)) throw "Invalid argument for path command '" + this.currentCommand + "'";
            }
        }

        reset() {
            this.args = undefined;
            this.currentCommand = undefined;
            this.lastControlX = undefined;
            this.lastControlY = undefined;
            this.startX = undefined;
            this.startY = undefined;
            this.lastX = undefined;
            this.lastY = undefined;
            this.strIndex = 0;
            this.commandIndex = 0;
        }

        protected readNextToken() {
            while (this.path.charCodeAt(this.strIndex) === 32 && this.strIndex < this.path.length) {
                this.strIndex ++;
            }

            if (this.strIndex >= this.path.length) return undefined;

            const tokenStart = this.strIndex;

            while (this.path.charCodeAt(this.strIndex) !== 32 && this.strIndex < this.path.length) {
                this.strIndex++;
            }

            return this.path.substr(tokenStart, this.strIndex - tokenStart);
        }

        private static commandToArgCount(command: string): number {
            switch (command) {
                case "M": // moveTo
                case "m":
                    return 2;
                case "L": // lineTo
                case "l":
                    return 2;
                case "H": // horizontalLineTo
                case "h":
                    return 1;
                case "V": // verticalLineTo
                case "v":
                    return 1;
                case "Q": // quadraticCurveTo
                case "q":
                    return 4;
                case "T": // smoothQuadraticCurveTo
                case "t":
                    return 2;
                case "C": // cubicCurveTo
                case "c":
                    return 6;
                case "S": // smoothCubicCurveTo
                case "s":
                    return 4;
                case "A": // arcTo
                case "a":
                    return 7;
                case "Z": // closePath
                case "z":
                    return 0;
                default:
                    return -1;
            }
        }

        public run(interval: number, target: Sprite, runningTime: number): boolean {
            const nodeIndex = Math.floor(runningTime / interval); // The current node
            const nodeTime = runningTime % interval; // The time the current node has been animating

            if (this.startX === undefined) {
                this.startX = target.x;
                this.startY = target.y;
                this.lastX = target.x;
                this.lastY = target.y;
                this.commandIndex = 0;
                this.readNextCommand();
            }

            while (this.commandIndex < nodeIndex) {
                if (this.currentCommand) {
                    this.runCurrentCommand(target, interval, interval);
                    this.lastX = target.x;
                    this.lastY = target.y;
                }
                this.commandIndex++
                this.readNextCommand();
            }

            if (nodeIndex >= this.length) {
                return true;
            }

            this.runCurrentCommand(target, nodeTime, interval);
            return false;
        }

        protected runCurrentCommand(target: Sprite, nodeTime: number, intervalTime: number) {
            switch (this.currentCommand) {
                case "M": // M x y
                    this.lastControlX = undefined;
                    this.lastControlY = undefined;
                    moveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.args[0],
                        this.args[1]
                    );
                    break;
                case "m": // m dx dy
                    this.lastControlX = undefined;
                    this.lastControlY = undefined;
                    moveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.args[0] + this.lastX,
                        this.args[1] + this.lastY
                    );
                    break;
                case "L": // L x y
                    this.lastControlX = undefined;
                    this.lastControlY = undefined;
                    lineTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.args[0],
                        this.args[1]
                    );
                    break;
                case "l": // l dx dy
                    this.lastControlX = undefined;
                    this.lastControlY = undefined;
                    lineTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.args[0] + this.lastX,
                        this.args[1] + this.lastY
                    );
                    break;
                case "H": // H x
                    this.lastControlX = undefined;
                    this.lastControlY = undefined;
                    lineTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.args[0],
                        this.lastY
                    );
                    break;
                case "h": // h dx
                    this.lastControlX = undefined;
                    this.lastControlY = undefined;
                    lineTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.args[0] + this.lastX,
                        this.lastY
                    );
                    break;
                case "V": // V y
                    this.lastControlX = undefined;
                    this.lastControlY = undefined;
                    lineTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.lastX,
                        this.args[0]
                    );
                    break;
                case "v": // v dy
                    this.lastControlX = undefined;
                    this.lastControlY = undefined;
                    lineTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.lastX,
                        this.args[0] + this.lastY
                    );
                    break;
                case "Q": // Q x1 y1 x2 y2
                    this.lastControlX = this.args[0];
                    this.lastControlY = this.args[1];
                    quadraticCurveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.args[0],
                        this.args[1],
                        this.args[2],
                        this.args[3]
                    )
                    break;
                case "q": // q dx1 dy1 dx2 dy2
                    this.lastControlX = this.args[0] + this.lastX;
                    this.lastControlY = this.args[1] + this.lastY;
                    quadraticCurveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.args[0] + this.lastX,
                        this.args[1] + this.lastY,
                        this.args[2] + this.lastX,
                        this.args[3] + this.lastY
                    );
                    break;
                case "T": // T x2 y2
                    this.ensureControlPoint();
                    quadraticCurveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.lastX + this.lastX - this.lastControlX,
                        this.lastY + this.lastY - this.lastControlY,
                        this.args[0],
                        this.args[1],
                    );
                    if (nodeTime === intervalTime) {
                        this.lastControlX = this.lastX + this.lastX - this.lastControlX;
                        this.lastControlY = this.lastY + this.lastY - this.lastControlY;
                    }
                    break;
                case "t": // t dx2 dy2
                    this.ensureControlPoint();
                    quadraticCurveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.lastX + this.lastX - this.lastControlX,
                        this.lastY + this.lastY - this.lastControlY,
                        this.args[0] + this.lastX,
                        this.args[1] + this.lastY,
                    );
                    if (nodeTime === intervalTime) {
                        this.lastControlX = this.lastX + this.lastX - this.lastControlX;
                        this.lastControlY = this.lastY + this.lastY - this.lastControlY;
                    }
                    break;
                case "C": // C x1 y1 x2 y2 x3 y3
                    this.lastControlX = this.args[2];
                    this.lastControlY = this.args[3];
                    cubicCurveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.args[0],
                        this.args[1],
                        this.args[2],
                        this.args[3],
                        this.args[4],
                        this.args[5],
                    );
                    break;
                case "c": // c dx1 dy1 dx2 dy2 dx3 dy3
                    this.lastControlX = this.args[2] + this.lastX;
                    this.lastControlY = this.args[3] + this.lastY;
                    cubicCurveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.args[0] + this.lastX,
                        this.args[1] + this.lastY,
                        this.args[2] + this.lastX,
                        this.args[3] + this.lastY,
                        this.args[4] + this.lastX,
                        this.args[5] + this.lastY,
                    );
                    break;
                case "S": // S x2 y2 x3 y3
                    this.ensureControlPoint();
                    cubicCurveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.lastX + this.lastX - this.lastControlX,
                        this.lastY + this.lastY - this.lastControlY,
                        this.args[0],
                        this.args[1],
                        this.args[2],
                        this.args[3]
                    );
                    if (nodeTime === intervalTime) {
                        this.lastControlX = this.args[0];
                        this.lastControlY = this.args[1];
                    }
                    break;
                case "s": // s dx2 dy2 dx3 dy3
                    this.ensureControlPoint();
                    cubicCurveTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.lastX + this.lastX - this.lastControlX,
                        this.lastY + this.lastY - this.lastControlY,
                        this.args[0] + this.lastX,
                        this.args[1] + this.lastY,
                        this.args[2] + this.lastX,
                        this.args[3] + this.lastY,
                    );
                    if (nodeTime === intervalTime) {
                        this.lastControlX = this.args[0] + this.lastX;
                        this.lastControlY = this.args[1] + this.lastY;
                    }
                    break;
                case "Z": // Z
                case "z": // z
                    this.lastControlX = undefined;
                    this.lastControlY = undefined;
                    lineTo(
                        target,
                        nodeTime,
                        intervalTime,
                        this.lastX,
                        this.lastY,
                        this.startX,
                        this.startY
                    );
                    break;
            }
        }

        protected ensureControlPoint() {
            if (this.lastControlX === undefined) throw "Invalid path command. S/s and T/t must follow either Q/q or C/c"
        }
    }

    function moveTo(target: Sprite, nodeTime: number, interval: number, x: number, y: number) {
        if (nodeTime >= interval) target.setPosition(x, y);
    }

    function lineTo(target: Sprite, nodeTime: number, interval: number, x0: number, y0: number, x1: number, y1: number) {
        target.setPosition(
            Math.round(((x1 - x0) / interval) * nodeTime) + x0,
            Math.round(((y1 - y0) / interval) * nodeTime) + y0
        );
    }

    function quadraticCurveTo(target: Sprite, nodeTime: number, interval: number, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) {
        const progress = nodeTime / interval;
        const diff = 1 - progress;
        const a = diff * diff;
        const b = 2 * diff * progress;
        const c = progress * progress;

        target.setPosition(
            Math.round(a * x0 + b * x1 + c * x2),
            Math.round(a * y0 + b * y1 + c * y2)
        );
    }

    function cubicCurveTo(target: Sprite, nodeTime: number, interval: number, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
        const progress = nodeTime / interval;
        const diff = 1 - progress;
        const a = diff * diff * diff;
        const b = 3 * diff * diff * progress;
        const c = 3 * diff * progress * progress;
        const d = progress * progress * progress;

        target.setPosition(
            Math.round(a * x0 + b * x1 + c * x2 + d * x3),
            Math.round(a * y0 + b * y1 + c * y2 + d * y3)
        );
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
                    ((anim instanceof ImageAnimation && this instanceof ImageAnimation) ||
                    (anim instanceof MovementAnimation && this instanceof MovementAnimation)));
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

    export class MovementAnimation extends SpriteAnimation {
        protected startX: number;
        protected startY: number;

        constructor(sprite: Sprite, private path: Path, private nodeInterval: number, loop?: boolean) {
            super(sprite, loop);
            this.startX = sprite.x;
            this.startY = sprite.y;
            this.elapsedTime = 0;
        }

        public update(): boolean {
            this.elapsedTime += game.eventContext().deltaTimeMillis;

            let result = this.path.run(this.nodeInterval, this.sprite, this.elapsedTime);
            if (result) {
                if (!this.loop) return true;
                this.elapsedTime = 0;
                this.path.reset();
                this.sprite.x = this.startX;
                this.sprite.y = this.startY;
            }
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

    /**
     * Create and run a movement animation on a sprite
     * @param sprite the sprite to move
     * @param pathString the SVG path to animate
     * @param duration how long the animation should play for, eg: 500
     */
    //% blockId=run_movement_animation
    //% block="animate $sprite=variables_get(mySprite) with $pathString=animation_path for (ms) $duration=timePicker loop $loop=toggleOnOff"
    //% duration.defl=2000
    //% weight=80
    //% group="Animate"
    //% help=animation/run-movement-animation
    export function runMovementAnimation(sprite: Sprite, pathString: string, duration?: number, loop?: boolean) {
        const path = new Path(pathString);
        const anim = new MovementAnimation(sprite, path, duration / path.length, !!loop);
        anim.init();
    }

    export enum AnimationTypes {
        //% block="all"
        All,
        //% block="frame"
        ImageAnimation,
        //% block="path"
        MovementAnimation
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
                        case AnimationTypes.MovementAnimation:
                            if (anim instanceof MovementAnimation) return false;
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

    //% fixedInstance whenUsed block="fly to center"
    export const flyToCenter = new PathPreset("L 80 60");

    //% fixedInstance whenUsed block="shake"
    export const shake = new PathPreset("m 4 -1 m 1 2 m -6 2 m -4 -8 m 8 8 m 2 -4 m -8 0 m 6 3 m -3 -2");

    //% fixedInstance whenUsed block="bounce (right)"
    export const bounceRight = new PathPreset("q 7 0 15 40 q 10 -30 15 -25 q 10 5 15 25 q 5 -25 10 0 q 4 -15 8 0 q 2 -10 4 0 q 1 -5 1 0 q 0 -2 1 0");

    //% fixedInstance whenUsed block="bounce (left)"
    export const bounceLeft = new PathPreset("q -7 0 -15 40 q -10 -30 -15 -25 q -10 5 -15 25 q -5 -25 -10 0 q -4 -15 -8 0 q -2 -10 -4 0 q -1 -5 -1 0 q 0 -2 -1 0");

    //% fixedInstance whenUsed block="parachute (right)"
    export const parachuteRight = new PathPreset("q 20 10 40 5 q 2 -2 0 0 q -15 10 -30 5 q -2 -2 0 0 q 10 10 20 5 q 2 -2 0 0 q -5 5 -10 3 q -1 -1 0 0 q 2 2 5 1 l 0 2 l 0 2 l 0 2");

    //% fixedInstance whenUsed block="parachute (left)"
    export const parachuteLeft = new PathPreset("q -20 10 -40 5 q -2 -2 0 0 q 15 10 30 5 q 2 -2 0 0 q -10 10 -20 5 q -2 -2 0 0 q 5 5 10 3 q 1 -1 0 0 q -2 2 -5 1 l 0 2 l 0 2 l 0 2");

    //% fixedInstance whenUsed block="ease (right)"
    export const easeRight = new PathPreset("h 5 h 10 h 20 h 30 h 20 h 10 h 5");

    //% fixedInstance whenUsed block="ease (left)"
    export const easeLeft = new PathPreset("h -5 h -10 h -20 h -30 h -20 h -10 h -5");

    //% fixedInstance whenUsed block="ease (down)"
    export const easeDown = new PathPreset("v 5 v 10 v 20 v 30 v 20 v 10 v 5");

    //% fixedInstance whenUsed block="ease (up)"
    export const easeUp = new PathPreset("v -5 v -10 v -20 v -30 v -20 v -10 v -5");

    //% fixedInstance whenUsed block="wave (right)"
    export const waveRight = new PathPreset("c 25 -15 15 -5 20 0");

    //% fixedInstance whenUsed block="wave (left)"
    export const waveLeft = new PathPreset("c -25 -15 -15 -5 -20 0");

    //% fixedInstance whenUsed block="bobbing (in place)"
    export const bobbing = new PathPreset("c 0 -20 0 20 0 0");

    //% fixedInstance whenUsed block="bobbing (right)"
    export const bobbingRight = new PathPreset("c 5 -20 15 20 20 0");

    //% fixedInstance whenUsed block="bobbing (left)"
    export const bobbingLeft = new PathPreset("c -5 -20 -15 20 -20 0");

    /**
     * Generates a path string for preset animation
     * @param animationPath The preset path
     */
    //% blockId=animation_path
    //% block="%animationPath"
    //% group="Animate"
    //% blockHidden=1
    export function animationPresets(animationPath: PathPreset) {
        return animationPath.pathString;
    }


    //% blockId=animation_editor block="%frames"
    //% shim=TD_ID
    //% frames.fieldEditor="animation"
    //% frames.fieldOptions.decompileLiterals="true"
    //% frames.fieldOptions.filter="!tile !dialog !background"
    //% weight=40
    //% group="Animate" duplicateShadowOnDrag
    export function _animationFrames(frames: Image[]) {
        return frames
    }
}
