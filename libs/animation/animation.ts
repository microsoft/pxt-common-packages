enum MovementAnimations {
    //% block="test"
    Test = 0
}

/*
    Animation library for sprites
*/
//% color="#03AA74" weight=78 icon="\uf021"
namespace animation {
    // Stores the animations for the current scene
    let animations: Animation[];

    // Preserves animations when switching back and forth between scenes
    let animationStateStack: {
        state: Animation[],
        scene: scene.Scene
    }[];

    game.addScenePushHandler(oldScene => {
        if (animations) {
            if (!animationStateStack) animationStateStack = [];
            animationStateStack.push({
                state: animations,
                scene: oldScene
            });
            animations = undefined;
        }
    });

    game.addScenePopHandler(() => {
        const scene = game.currentScene();
        animations = undefined;
        if (animationStateStack && animationStateStack.length) {
            for (let nextState of animationStateStack) {
                if (nextState.scene == scene) {
                    animations = nextState.state;
                    animationStateStack.removeElement(nextState);
                    break;
                }
            }
        }
    });

    const initializeAnimationHandler = () => {
        // Register animation updates to fire when frames are rendered
        if(!animations) {
            animations = [];

            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                animations.forEach(anim => anim.update());
            });
        }
    }

    export interface Point {
        x: number,
        y: number
    }

    export interface PathNode {
        command: string;
        args: number[];
    }

    export interface Animation {
        sprite: Sprite;
        isPlaying: boolean;

        update(): void;
    }

    export class MovementAnimation implements Animation {
        public sprite: Sprite;
        public isPlaying: boolean;
        private nodes: PathNode[];
        private nodeIndex: number;
        private nodeInterval: number;
        private lastNode: number;
        private lastState: Point;
        
        constructor(sprite: Sprite, nodes: PathNode[], nodeInterval: number) {
            this.sprite = sprite;
            this.lastState = {
                x: this.sprite.x,
                y: this.sprite.y
            };
            this.nodes = nodes;
            this.nodeIndex = 0;
            this.nodeInterval = nodeInterval;
            this.lastNode = control.millis();

            this.init();
        }
        
        private init(): void {
            initializeAnimationHandler();
            
            this.isPlaying = true;
            animations.push(this);
        }

        private done(): void {
            this.isPlaying = false;
            animations.removeElement(this);
        }

        private applyNode(node: PathNode, dt: number): void {
            switch (node.command) {
                case "M": { // M x y
                    dt >= this.nodeInterval && this.sprite.setPosition(node.args[0], node.args[1]);
                    break;
                }
                case "m": { // M dx dy
                    dt >= this.nodeInterval && this.sprite.setPosition(this.lastState.x + node.args[0], this.lastState.y + node.args[1]);
                    break;
                }
                case "L": { // L x y
                    const dx = Math.round(((node.args[0] - this.lastState.x) / this.nodeInterval) * dt);
                    const dy = Math.round(((node.args[1] - this.lastState.y) / this.nodeInterval) * dt);
                    this.sprite.setPosition(this.lastState.x + dx, this.lastState.y + dy);
                    break;
                }
                case "l": { // l dx dy
                    const dx = Math.round((node.args[0] / this.nodeInterval) * dt);
                    const dy = Math.round((node.args[1] / this.nodeInterval) * dt);
                    this.sprite.setPosition(this.lastState.x + dx, this.lastState.y + dy);
                    break;
                }
                case "H": { // H x
                    const dx = Math.round(((node.args[0] - this.lastState.x) / this.nodeInterval) * dt);
                    this.sprite.setPosition(this.lastState.x + dx, this.lastState.y);
                    break;
                }
                case "h": { // h dx
                    const dx = Math.round((node.args[0] / this.nodeInterval) * dt);
                    this.sprite.setPosition(this.lastState.x + dx, this.lastState.y);
                    break;
                }
                case "V": { // V y
                    const dy = Math.round(((node.args[0] - this.lastState.y) / this.nodeInterval) * dt);
                    this.sprite.setPosition(this.lastState.x, this.lastState.y + dy);
                    break;
                }
                case "v": { // v dy
                    const dy = Math.round((node.args[0] / this.nodeInterval) * dt);
                    this.sprite.setPosition(this.lastState.x, this.lastState.y + dy);
                    break;
                }
                case "Q": { // Q x1 y1 x y
                    const progress = dt / this.nodeInterval;
                    const diff = 1 - progress;
                    const a = Math.pow(diff, 2);
                    const b = 2 * diff * progress;
                    const c = Math.pow(progress, 2);

                    const x = Math.round(a * this.lastState.x + b * node.args[0] + c * node.args[2]);
                    const y = Math.round(a * this.lastState.y + b * node.args[1] + c * node.args[3]);

                    this.sprite.setPosition(x, y);
                    break;
                }
                case "q": { // q dx1 dy1 dx dy
                    const progress = dt / this.nodeInterval;
                    const diff = 1 - progress;
                    const b = 2 * diff * progress;
                    const c = Math.pow(progress, 2);
        
                    const dx = Math.round(b * node.args[0] + c * node.args[2]);
                    const dy = Math.round(b * node.args[1] + c * node.args[3]);
        
                    this.sprite.setPosition(this.lastState.x + dx, this.lastState.y + dy);
                    break;
                }
                case "C": { // C x1 y1 x2 y2 x y
                    const progress = dt / this.nodeInterval;
                    const diff = 1 - progress;
                    const a = Math.pow(diff, 3);
                    const b = 3 * Math.pow(diff, 2) * progress;
                    const c = 3 * diff * Math.pow(progress, 2);
                    const d = Math.pow(progress, 3);
        
                    const x = Math.round(a * this.lastState.x + b * node.args[0] + c * node.args[2] + d * node.args[4]);
                    const y = Math.round(a * this.lastState.y + b * node.args[1] + c * node.args[3] + d * node.args[5]);
        
                    this.sprite.setPosition(x, y);
                    break;
                }
                case "c": { // c dx1 dy1 dx2 dy2 dx dy
                    const progress = dt / this.nodeInterval;
                    const diff = 1 - progress;
                    const b = 3 * Math.pow(diff, 2) * progress;
                    const c = 3 * diff * Math.pow(progress, 2);
                    const d = Math.pow(progress, 3);
        
                    const dx = Math.round(b * node.args[0] + c * node.args[2] + d * node.args[4]);
                    const dy = Math.round(b * node.args[1] + c * node.args[3] + d * node.args[5]);
        
                    this.sprite.setPosition(this.lastState.x + dx, this.lastState.y + dy);
                    break;
                }
            }
        }

        update(): void {
            const currentTime: number = control.millis();
            const dt: number = currentTime - this.lastNode;
            
            if(this.nodeIndex < this.nodes.length) {
                let node: PathNode = this.nodes[this.nodeIndex];

                // If the next node should have been reached
                if (dt >= this.nodeInterval) {
                    this.applyNode(node, this.nodeInterval);
                    this.lastState = { // Records the last state of the sprite for later reference
                        x: this.sprite.x,
                        y: this.sprite.y
                    };
                    this.nodeIndex++;
                    this.lastNode = currentTime;
                } else {
                    this.applyNode(node, dt);
                }
            } else {
                this.done();
            }
        }
    }

    export class ImageAnimation implements Animation {
        public sprite: Sprite;
        public isPlaying: boolean;
        private frames: Image[];
        private frameInterval: number;
        private frameIndex: number;
        private lastFrame: number;

        constructor(sprite: Sprite, frames: Image[], frameInterval: number) {
            this.sprite = sprite;
            this.frames = frames;
            this.frameInterval = frameInterval;
            this.frameIndex = 0;
            this.lastFrame = control.millis();

            this.init();
        }
        
        public init(): void {
            initializeAnimationHandler();

            this.isPlaying = true;
            animations.push(this);
        }

        private done(): void {
            this.isPlaying = false;
            animations.removeElement(this);
        }

        update(): void {
            const currentTime = control.millis();
            
            if (this.frameIndex < this.frames.length) {
                // If the next frame should be shown by now
                if(currentTime - this.lastFrame >= this.frameInterval) {
                    let newImage = this.frames[this.frameIndex];
                    
                    // Only update the image if it's different from the old one
                    if (this.sprite.image !== newImage) {
                        this.sprite.setImage(newImage);
                    }
                    
                    this.frameIndex ++;
                    this.lastFrame = currentTime;
                }
            } else {
                this.done();
            }
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
    //% block="animate %frames=lists_create_with on %sprite=variables_get(mySprite) with interval %frameInterval=timePicker ms and wait %wait=toggleOnOff"
    //% wait.defl=1
    export function runImageAnimation(frames: Image[], sprite: Sprite, frameInterval?: number, wait?: boolean): void {
        let anim = new ImageAnimation(sprite, frames, frameInterval || 500);
        (wait == null || wait) && pauseUntil(() => anim.isPlaying === false);
    }

    /**
     * Create and run a movement animation on a sprite
     * @param animation the movement preset to animate
     * @param sprite the sprite to move
     * @param nodeInterval the time between nodes during which to animate, eg: 500
     * @param wait whether or not the animation should be blocking
     */
    //% blockId=run_movement_animation
    //% block="%sprite=variables_get(mySprite) follow path %animation with interval %nodeInterval=timePicker ms and wait %wait=toggleOnOff"
    //% wait.defl=1
    export function runMovementAnimation(sprite: Sprite, animation: MovementAnimations, nodeInterval?: number, wait?: boolean): void {
        let nodes: PathNode[];
        switch (animation) {
            case MovementAnimations.Test:
                nodes = [
                    {
                        command: "M",
                        args: [
                            50,
                            50
                        ]
                    },
                    {
                        command: "c",
                        args: [
                            40,
                            0,
                            0,
                            40,
                            60,
                            60
                        ]
                    }
                ];
        }

        let anim = new MovementAnimation(sprite, nodes, nodeInterval || 500);
        (wait == null || wait) && pauseUntil(() => anim.isPlaying === false);
    }
}
