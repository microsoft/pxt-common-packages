/*
    Animation library for sprites
*/
//% color="#03AA74" weight=78 icon="\uf021"
namespace animation {
    const stateNamespace = "__animation";

    interface AnimationState {
        animations: Animation[];
    }

    const initializeAnimationHandler = () => {
        let state: AnimationState = game.currentScene().data[stateNamespace];

        // Register animation updates to fire when frames are rendered
        if(!state) {
            state = game.currentScene().data[stateNamespace] = {
                animations: []
            } as AnimationState;

            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                state.animations.forEach((anim: Animation) => {
                    if(anim) anim.update();
                });
            });
        }
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
        protected startedAt: number;
        protected lastNode: number; // The index of the last node to fire

        constructor() {
            this.nodes = [];
            this.lastNode = -1;
        }

        private static generateNode(p0: Point, command: string, args: number[], metadata: { pathStart: Point, lastNode: PathNode }): PathNode {
            // Sets the start point for the path (that can be changed using moveTo)
            let node: PathNode;
            switch (command) {
                case "M": { // M x y
                    let p1: Point = new Point(args[0], args[1]);
                    node = new MoveTo(p1);
                    break;
                }
                case "m": { // m dx dy
                    const p1: Point = new Point(p0.x + args[0], p0.y + args[1]);
                    node = new MoveTo(p1);
                    break;
                }
                case "L": { // L x y
                    const p1: Point = new Point(args[0], args[1]);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "l": { // l dx dy
                    const p1: Point = new Point(p0.x + args[0], p0.y + args[1]);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "H": { // H x
                    const p1: Point = new Point(args[0], p0.y);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "h": { // h dx
                    const p1: Point = new Point(p0.x + args[0], p0.y);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "V": { // V y
                    const p1: Point = new Point(p0.x, args[0]);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "v": { // v dy
                    const p1: Point = new Point(p0.x, p0.y + args[0]);
                    node = new LineTo(p0, p1);
                    break;
                }
                case "Q": { // Q x1 y1 x2 y2
                    const p1: Point = new Point(args[0], args[1]);
                    const p2: Point = new Point(args[2], args[3]);
                    node = new QuadraticCurveTo(p0, p1, p2);
                    break;
                }
                case "q": { // q dx1 dy1 dx2 dy2
                    const p1: Point = new Point(p0.x + args[0], p0.y + args[1]);
                    const p2: Point = new Point(p0.x + args[2], p0.y + args[3]);
                    node = new QuadraticCurveTo(p0, p1, p2);
                    break;
                }
                case "C": { // C x1 y1 x2 y2 x3 y3
                    const p1: Point = new Point(args[0], args[1]);
                    const p2: Point = new Point(args[2], args[3]);
                    const p3: Point = new Point(args[4], args[5]);
                    node = new CubicCurveTo(p0, p1, p2, p3);
                    break;
                }
                case "c": { // c dx1 dy1 dx2 dy2 dx3 dy3
                    const p1: Point = new Point(p0.x + args[0], p0.y + args[1]);
                    const p2: Point = new Point(p0.x + args[2], p0.y + args[3]);
                    const p3: Point = new Point(p0.x + args[4], p0.y + args[5]);
                    node = new CubicCurveTo(p0, p1, p2, p3);
                    break;
                }
                case "Z": // Z
                case "z": { // z
                    node = new LineTo(p0, metadata.pathStart);
                    break;
                }
            }

            return node;
        }

        public static parse(pathStart: Point, pathString: string): Path {
            let path = new Path();
            let p0 = pathStart;

            // This implementation of SVG parsing does not support the T/t/S/s/A/a commands, nor does it support exponents in arguments
            const digits = "0123456789";
            const separators = ", \t\n\r\f\v";
            const commands: {
                [ command: string ]: number
            } = {
                "M": 2, "m": 2, // moveTo
                "L": 2, "l": 2, // lineTo
                "H": 1, "h": 1, // horizontalLineTo
                "V": 1, "v": 1, // verticalLineTo
                "Q": 4, "q": 4, // quadraticCurveTo
                // "T": 2, "t": 2, // smoothQuadraticCurveTo
                "C": 6, "c": 6, // cubicCurveTo
                // "S": 4, "s": 4, // smoothCubicCurveTo
                // "A": 7, "a": 7, // arcTo
                "Z": 0, "z": 0 // closePath
            };
            const signs = "+-";

            let currentArg: string = "";
            let command: string = null;
            let args: number[] = [];

            for (let i = 0; i < pathString.length; i++) {
                const char: string = pathString.charAt(i);
                const lastNode: PathNode = path.nodes[path.nodes.length - 1];
                
                // This is an SVG path parser. It's kinda complicated. For each character, evaluate the following conditions:
                // - if it's a digit, add it to the current argument
                // - else if it's whitespace or newline, finish the current argument and prepare for the next one
                // - else if it's a command, complete the previous argument, and prepare for the next one
                //   - if there's sufficient data to make a node during this step, create it and continue
                // - else if it's a plus/minus sign, and if it's the start of a new argument, add it to allow for positive/negative numbers
                // - if it's the end of the string, complete the current argument before proceeding to the next step
                // - if there's sufficient data to make a node after all of these steps, create it
                if(digits.indexOf(char) > -1) { // Parses number arguments
                    currentArg += char;
                } else if(separators.indexOf(char) > -1 && currentArg) { // Terminates number arguments
                    args.push(parseInt(currentArg));
                    currentArg = "";
                } else if(Object.keys(commands).indexOf(char) > -1) { // Parses command arguments
                    if(command && currentArg) {
                        args.push(parseInt(currentArg));
                        
                        // Try to finish up this node, otherwise just toss it out
                        if (command && args.length >= commands[command]) {
                            let node = this.generateNode(p0, command, args, {
                                pathStart: pathStart,
                                lastNode: lastNode
                            });
                            path.add(node);
                            p0 = node.getEndPoint(); // Set the start for the next node to the end of this node
                            if(node.setStart) pathStart = p0; // If this is a move command, then this sets the new start of the path (for the Z/z command)
                        }
                        
                        // Clean up before continuing
                        command = "";
                        args = [];
                        currentArg = "";
                    }
                    command = char;
                } else if(signs.indexOf(char) > -1) { // Allows for positive/negative values
                    if(currentArg) {
                        args.push(parseInt(currentArg));
                        currentArg = "";
                    }
                    currentArg = char;
                }

                // If the end of the path has been reached, cleans up the last argument before continuing parsing
                if(i === pathString.length - 1) {
                    if(currentArg) {
                        args.push(parseInt(currentArg));
                    }
                }
                
                // If the command has a sufficient amount of arguments, then create a node for it
                if (command && args.length >= commands[command]) {
                    // Generate the node
                    let node = this.generateNode(p0, command, args, {
                        pathStart: pathStart,
                        lastNode: lastNode
                    });
                    path.add(node);
                    p0 = node.getEndPoint();
                    if(node.setStart) pathStart = p0;
                    
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

        public run(interval: number, target: Sprite): boolean {
            this.startedAt == null && (this.startedAt = control.millis());
            
            const runningTime: number = control.millis() - this.startedAt; // The time since the start of the path
            const nodeIndex: number = Math.floor(runningTime / interval); // The current node
            const nodeTime: number = runningTime % interval; // The time the current node has been animating
            
            if(this.lastNode > -1 && this.lastNode < nodeIndex && this.nodes.length) { // If the last node hasn't been completed yet
                this.nodes[nodeIndex - 1].apply(target, interval, interval); // Applies the last state of the previous node in case it was missed (this makes sure all moveTos fire)

                if(nodeIndex >= this.nodes.length) return true; // Once the nodeIndex is past the last item of the array, only then end the animation
            }
            this.lastNode = nodeIndex;

            this.nodes[nodeIndex].apply(target, nodeTime, interval);
            return false;
        }
    }

    export interface PathNode {
        setStart: boolean;
        apply(target: Sprite, nodeTime: number, interval: number): void;
        getEndPoint(): Point;
    }

    export class MoveTo implements PathNode {
        public setStart: boolean;
        constructor(private p1: Point) {
            this.setStart = true;
        }

        apply(target: Sprite, nodeTime: number, interval: number): void {
            nodeTime >= interval && target.setPosition(this.p1.x, this.p1.y);
        }

        getEndPoint(): Point {
            return this.p1;
        }
    }

    export class LineTo implements PathNode {
        public setStart: boolean;
        constructor(private p0: Point, private p1: Point) {
            this.setStart = false;
        }

        apply(target: Sprite, nodeTime: number, interval: number): void {
            const x: number = Math.round(((this.p1.x - this.p0.x) / interval) * nodeTime) + this.p0.x;
            const y: number = Math.round(((this.p1.y - this.p0.y) / interval) * nodeTime) + this.p0.y;
            target.setPosition(x, y);
        }

        getEndPoint(): Point {
            return this.p1;
        }
    }

    export class QuadraticCurveTo implements PathNode {
        public setStart: boolean;
        constructor(private p0: Point, private p1: Point, private p2: Point) {
            this.setStart = false;
        }

        apply(target: Sprite, nodeTime: number, interval: number): void {
            const progress: number = nodeTime / interval;
            const diff: number = 1 - progress;
            const a: number = Math.pow(diff, 2);
            const b: number = 2 * diff * progress;
            const c: number = Math.pow(progress, 2);

            const x: number = Math.round(a * this.p0.x + b * this.p1.x + c * this.p2.x);
            const y: number = Math.round(a * this.p0.y + b * this.p1.y + c * this.p2.y);

            target.setPosition(x, y);
        }

        getEndPoint(): Point {
            return this.p2;
        }
    }

    export class CubicCurveTo implements PathNode {
        public setStart: boolean;
        constructor(private p0: Point, private p1: Point, private p2: Point, private p3: Point) {
            this.setStart = false;
        }

        apply(target: Sprite, nodeTime: number, interval: number): void {
            const progress: number = nodeTime / interval;
            const diff: number = 1 - progress;
            const a: number = Math.pow(diff, 3);
            const b: number = 3 * Math.pow(diff, 2) * progress;
            const c: number = 3 * diff * Math.pow(progress, 2);
            const d: number = Math.pow(progress, 3);

            const x: number = Math.round(a * this.p0.x + b * this.p1.x + c * this.p2.x + d * this.p3.x);
            const y: number = Math.round(a * this.p0.y + b * this.p1.y + c * this.p2.y + d * this.p3.y);

            target.setPosition(x, y);
        }

        getEndPoint(): Point {
            return this.p3;
        }
    }

    export class Animation {
        constructor(protected sprite: Sprite) {
        }

        protected init(): void {
            initializeAnimationHandler();

            const state: AnimationState = game.currentScene().data[stateNamespace];
            state.animations.push(this);
        }

        protected done(): void {
            const state: AnimationState = game.currentScene().data[stateNamespace];
            state.animations.removeElement(this);
        }

        public update(): void {
            // This should be implemented by subclasses
            this.done();
        }
    }

    export class MovementAnimation extends Animation {
        constructor(sprite: Sprite, private path: Path, private nodeInterval: number) {
            super(sprite);

            this.init();
        }
        
        protected init(): void {
            super.init();
        }

        protected done(): void {
            super.done();
        }

        public update(): void {
            if(this.sprite.flags & sprites.Flag.Destroyed) return this.done();
            
            this.path.run(this.nodeInterval, this.sprite) && this.done();
        }
    }

    export class ImageAnimation extends Animation {
        private frames: Image[];
        private frameInterval: number;
        private lastFrame: number;
        private startedAt: number;

        constructor(sprite: Sprite, frames: Image[], frameInterval: number) {
            super(sprite);

            this.frames = frames;
            this.frameInterval = frameInterval;
            this.lastFrame = -1;

            this.init();
        }
        
        protected init(): void {
            super.init();
        }

        protected done(): void {
            super.done();
        }

        public update(): void {
            if(this.sprite.flags & sprites.Flag.Destroyed) return this.done();

            if(this.startedAt == null) this.startedAt = control.millis();
            const runningTime: number = control.millis() - this.startedAt;
            const frameIndex: number = Math.floor(runningTime / this.frameInterval);

            if(this.lastFrame > -1 && this.lastFrame < frameIndex && this.frames.length) { // Applies the first frame after the first interval has passed
                const newImage: Image = this.frames[frameIndex - 1];
                if(this.sprite.image !== newImage) {
                    this.sprite.setImage(newImage);
                }

                if(frameIndex >= this.frames.length) this.done();
            }
            this.lastFrame = frameIndex;
        }
    }

    /**
     * Create and run an image animation on a sprite
     * @param frames the frames to animate through
     * @param sprite the sprite to animate on
     * @param frameInterval the time between changes, eg: 500
     * @param wait whether or not the animation should be blocking
     */
    //% blockId=run_image_animation
    //% block="%sprite=variables_get(mySprite) animate frames %frames=lists_create_with with interval %frameInterval=timePicker ms"
    //% wait.defl=1
    export function runImageAnimation(sprite: Sprite, frames: Image[], frameInterval?: number): void {
        let test = new ImageAnimation(sprite, frames, frameInterval || 500);
    }

    /**
     * Create and run a movement animation on a sprite
     * @param sprite the sprite to move
     * @param pathString the SVG path to animate
     * @param nodeInterval the time between nodes during which to animate, eg: 500
     * @param wait whether or not the animation should be blocking
     */
    //% blockId=run_movement_animation
    //% block="%sprite=variables_get(mySprite) follow path %pathString=animation_path for %duration=timePicker ms"
    //% wait.defl=1
    export function runMovementAnimation(sprite: Sprite, pathString: string, duration?: number): void {
        let path = Path.parse(new Point(sprite.x, sprite.y), pathString);
        let test = new MovementAnimation(sprite, path, duration / path.length);
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
    //% blockHidden=1
    export function animationPresets(animationPath: PathPreset) {
        return animationPath.pathString;
    }
}
