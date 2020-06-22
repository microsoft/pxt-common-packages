/*
    Animation library for sprites
*/
//% color="#03AA74" weight=78 icon="\uf021" block="Animation"
//% groups='["Animate", "Legacy"]'
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
        protected nodes: PathNode[];
        protected lastNode: number; // The index of the last node to fire

        constructor() {
            this.nodes = [];
            this.lastNode = -1;
        }

        private static generateNode(p0: Point, command: string, args: number[], metadata: [ Point, PathNode ]): PathNode {
            const [ pathStart, lastNode ] = metadata;
            let node: PathNode;
            switch (command) {
                case "M": { // M x y
                    const p1 = new Point(args[0], args[1]);
                    node = new MoveTo(p1);
                    break;
                }
                case "m": { // m dx dy
                    const p1 = new Point(p0.x + args[0], p0.y + args[1]);
                    node = new MoveTo(p1);
                    break;
                }
                case "L": { // L x y
                    const p1 = new Point(args[0], args[1]);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "l": { // l dx dy
                    const p1 = new Point(p0.x + args[0], p0.y + args[1]);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "H": { // H x
                    const p1 = new Point(args[0], p0.y);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "h": { // h dx
                    const p1 = new Point(p0.x + args[0], p0.y);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "V": { // V y
                    const p1 = new Point(p0.x, args[0]);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "v": { // v dy
                    const p1 = new Point(p0.x, p0.y + args[0]);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "Q": { // Q x1 y1 x2 y2
                    const p1 = new Point(args[0], args[1]);
                    const p2 = new Point(args[2], args[3]);
                    node = new QuadraticCurveTo(p0, p1, p2);
                    break;
                }
                case "q": { // q dx1 dy1 dx2 dy2
                    const p1 = new Point(p0.x + args[0], p0.y + args[1]);
                    const p2 = new Point(p0.x + args[2], p0.y + args[3]);
                    node = new QuadraticCurveTo(p0, p1, p2);
                    break;
                }
                case "T": { // T x2 y2
                    let lastControlPoint: Point = lastNode.getLastControlPoint();
                    if (!lastControlPoint) break;

                    const p1 = new Point(p0.x + (p0.x - lastControlPoint.x), p0.y + (p0.y - lastControlPoint.y));
                    const p2 = new Point(args[0], args[1]);
                    node = new QuadraticCurveTo(p0, p1, p2);
                    break;
                }
                case "t": { // t dx2 dy2
                    let lastControlPoint: Point = lastNode.getLastControlPoint();
                    if (!lastControlPoint) break;

                    const p1 = new Point(p0.x + (p0.x - lastControlPoint.x), p0.y + (p0.y - lastControlPoint.y));
                    const p2 = new Point(p0.x + args[0], p0.y + args[1]);
                    node = new QuadraticCurveTo(p0, p1, p2);
                    break;
                }
                case "C": { // C x1 y1 x2 y2 x3 y3
                    const p1 = new Point(args[0], args[1]);
                    const p2 = new Point(args[2], args[3]);
                    const p3 = new Point(args[4], args[5]);
                    node = new CubicCurveTo(p0, p1, p2, p3);
                    break;
                }
                case "c": { // c dx1 dy1 dx2 dy2 dx3 dy3
                    const p1 = new Point(p0.x + args[0], p0.y + args[1]);
                    const p2 = new Point(p0.x + args[2], p0.y + args[3]);
                    const p3 = new Point(p0.x + args[4], p0.y + args[5]);
                    node = new CubicCurveTo(p0, p1, p2, p3);
                    break;
                }
                case "S": { // S x2 y2 x3 y3
                    let lastControlPoint: Point = lastNode.getLastControlPoint();
                    if (!lastControlPoint) break;

                    const p1 = new Point(p0.x + (p0.x - lastControlPoint.x), p0.y + (p0.y - lastControlPoint.y));
                    const p2 = new Point(args[0], args[1]);
                    const p3 = new Point(args[2], args[3]);
                    node = new CubicCurveTo(p0, p1, p2, p3);
                    break;
                }
                case "s": { // s dx2 dy2 dx3 dy3
                    let lastControlPoint: Point = lastNode.getLastControlPoint();
                    if (!lastControlPoint) break;

                    const p1 = new Point(p0.x + (p0.x - lastControlPoint.x), p0.y + (p0.y - lastControlPoint.y));
                    const p2 = new Point(p0.x + args[0], p0.y + args[1]);
                    const p3 = new Point(p0.x + args[2], p0.y + args[3]);
                    node = new CubicCurveTo(p0, p1, p2, p3);
                    break;
                }
                case "Z": // Z
                case "z": { // z
                    node = new LineTo(p0, pathStart);
                    break;
                }
            }

            return node;
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

        public static parse(pathStart: Point, pathString: string): Path {
            let path: Path = new Path();
            let p0: Point = pathStart;

            // This implementation of SVG parsing does not support the A/a commands, nor does it support exponents in arguments
            const digits = "0123456789";
            const separators = ", \t\n\r\f\v";
            const signs = "+-";

            let currentArg: string = "";
            let command: string = null;
            let args: number[] = [];

            for (let i = 0; i < pathString.length; i++) {
                const char = pathString.charAt(i);
                const lastNode = path.nodes[path.nodes.length - 1];

                // This is an SVG path parser. It's kinda complicated. For each character, evaluate the following conditions:
                // - if it's a digit, add it to the current argument
                // - else if it's whitespace or newline, finish the current argument and prepare for the next one
                // - else if it's a command, complete the previous argument, and prepare for the next one
                //   - if there's sufficient data to make a node during this step, create it and continue
                // - else if it's a plus/minus sign, and if it's the start of a new argument, add it to allow for positive/negative numbers
                // - if it's the end of the string, complete the current argument before proceeding to the next step
                // - if there's sufficient data to make a node after all of these steps, create it
                if (digits.indexOf(char) > -1) { // Parses number arguments
                    currentArg += char;
                } else if (separators.indexOf(char) > -1 && currentArg) { // Terminates number arguments
                    args.push(parseInt(currentArg));
                    currentArg = "";
                } else if (this.commandToArgCount(char) > -1) { // Parses command arguments
                    if (command && currentArg) {
                        args.push(parseInt(currentArg));

                        // Try to finish up this node, otherwise just toss it out
                        if (command && args.length >= this.commandToArgCount(command)) {
                            let node: PathNode = this.generateNode(p0, command, args, [
                                pathStart,
                                lastNode
                            ]);
                            path.add(node);
                            p0 = node.getEndPoint(); // Set the start for the next node to the end of this node
                            if (node.setStart) pathStart = p0; // If this is a move command, then this sets the new start of the path (for the Z/z command)
                        }

                        // Clean up before continuing
                        command = "";
                        args = [];
                        currentArg = "";
                    }
                    command = char;
                } else if (signs.indexOf(char) > -1) { // Allows for positive/negative values
                    if (currentArg) {
                        args.push(parseInt(currentArg));
                        currentArg = "";
                    }
                    currentArg = char;
                }

                // If the end of the path has been reached, cleans up the last argument before continuing parsing
                if (i === pathString.length - 1) {
                    if (currentArg) {
                        args.push(parseInt(currentArg));
                    }
                }

                // If the command has a sufficient amount of arguments, then create a node for it
                if (command && args.length >= this.commandToArgCount(command)) {
                    // Generate the node
                    let node: PathNode = this.generateNode(p0, command, args, [
                        pathStart,
                        lastNode
                    ]);
                    path.add(node);
                    p0 = node.getEndPoint();
                    if (node.setStart) pathStart = p0;

                    // Reset and prepare for the next command
                    command = "";
                    args = [];
                    currentArg = "";
                }
            }

            return path;
        }

        public add(node: PathNode) {
            this.nodes.push(node);
        }

        get length(): number {
            return this.nodes.length;
        }

        public run(interval: number, target: Sprite, startedAt: number): boolean {
            const runningTime = control.millis() - startedAt; // The time since the start of the path
            const nodeIndex = Math.floor(runningTime / interval); // The current node
            const nodeTime = runningTime % interval; // The time the current node has been animating

            if (this.lastNode > -1 && this.lastNode < nodeIndex && this.nodes.length) { // If the last node hasn't been completed yet
                this.nodes[this.lastNode].apply(target, interval, interval); // Applies the last state of the previous node in case it was missed (this makes sure all moveTos fire)

                if (nodeIndex >= this.nodes.length) return true; // Once the nodeIndex is past the last item of the array, only then end the animation
            }
            this.lastNode = nodeIndex;

            this.nodes[nodeIndex].apply(target, nodeTime, interval);
            return false;
        }
    }

    export abstract class PathNode {
        setStart: boolean;
        constructor() {
            this.setStart = false;
        }

        apply(target: Sprite, nodeTime: number, interval: number) {};

        getLastControlPoint(): Point {
            return null;
        };

        getEndPoint(): Point {
            return null;
        };
    }

    export class MoveTo extends PathNode {
        constructor(public p1: Point) {
            super();

            this.setStart = true;
        }

        apply(target: Sprite, nodeTime: number, interval: number) {
            nodeTime >= interval && target.setPosition(this.p1.x, this.p1.y);
        }

        getEndPoint(): Point {
            return this.p1;
        }
    }

    export class LineTo extends PathNode {
        constructor(public p0: Point, public p1: Point) {
            super();
        }

        apply(target: Sprite, nodeTime: number, interval: number) {
            const x = Math.round(((this.p1.x - this.p0.x) / interval) * nodeTime) + this.p0.x;
            const y = Math.round(((this.p1.y - this.p0.y) / interval) * nodeTime) + this.p0.y;

            target.setPosition(x, y);
        }

        getEndPoint(): Point {
            return this.p1;
        }
    }

    export class QuadraticCurveTo extends PathNode {
        constructor(public p0: Point, public p1: Point, public p2: Point) {
            super();
        }

        apply(target: Sprite, nodeTime: number, interval: number) {
            const progress = nodeTime / interval;
            const diff = 1 - progress;
            const a = Math.pow(diff, 2);
            const b = 2 * diff * progress;
            const c = Math.pow(progress, 2);

            const x = Math.round(a * this.p0.x + b * this.p1.x + c * this.p2.x);
            const y = Math.round(a * this.p0.y + b * this.p1.y + c * this.p2.y);

            target.setPosition(x, y);
        }

        getLastControlPoint(): Point {
            return this.p1;
        }

        getEndPoint(): Point {
            return this.p2;
        }
    }

    export class CubicCurveTo extends PathNode {
        constructor(public p0: Point, public p1: Point, public p2: Point, public p3: Point) {
            super();
        }

        apply(target: Sprite, nodeTime: number, interval: number) {
            const progress = nodeTime / interval;
            const diff = 1 - progress;
            const a = Math.pow(diff, 3);
            const b = 3 * Math.pow(diff, 2) * progress;
            const c = 3 * diff * Math.pow(progress, 2);
            const d = Math.pow(progress, 3);

            const x = Math.round(a * this.p0.x + b * this.p1.x + c * this.p2.x + d * this.p3.x);
            const y = Math.round(a * this.p0.y + b * this.p1.y + c * this.p2.y + d * this.p3.y);

            target.setPosition(x, y);
        }

        getLastControlPoint(): Point {
            return this.p2;
        }

        getEndPoint(): Point {
            return this.p3;
        }
    }

    export abstract class SpriteAnimation {
        protected startedAt: number;

        constructor(public sprite: Sprite, protected loop: boolean) {
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
                        if (this.sprite.flags & sprites.Flag.Destroyed)
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
            if (this.startedAt == null)
                this.startedAt = control.millis();
            const runningTime = control.millis() - this.startedAt;
            const frameIndex = Math.floor(runningTime / this.frameInterval);

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
        constructor(sprite: Sprite, private path: Path, private nodeInterval: number, loop?: boolean) {
            super(sprite, loop);

            this.loop = loop;
        }

        public update(): boolean {
            if (this.startedAt == null) this.startedAt = control.millis();

            let result = this.path.run(this.nodeInterval, this.sprite, this.startedAt);
            if (result) {
                if (!this.loop) return true;
                this.startedAt = control.millis();
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
    //% group="Animate"
    //% help=animation/run-movement-animation
    export function runMovementAnimation(sprite: Sprite, pathString: string, duration?: number, loop?: boolean) {
        const path = Path.parse(new Point(sprite.x, sprite.y), pathString);
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
    //% group="Animate" duplicateShadowOnDrag
    export function _animationFrames(frames: Image[]) {
        return frames
    }
}
