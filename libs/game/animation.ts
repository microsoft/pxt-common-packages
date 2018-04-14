namespace sprites {
    export class Animation {
        frames: Image[];
        currentFrame: number;
        sprite: Sprite;
        flipX: boolean;
        flipY: boolean;

        constructor(frames: Image[], sprite?: Sprite) {
            this.currentFrame = 0;
            this.frames = frames;
            this.sprite = sprite;
            this.flipX = false;
            this.flipY = false;
        }

        protected appendFrame(frame: Image) {
            this.frames.push(frame);
            return this.frames.length - 1;
        }

        protected setFrame(index: number) {
            if (index >= 0 && index < this.frames.length) {
                this.currentFrame = index;
                this.showFrame();
            }
        }

        setSprite(sprite: Sprite) {
            this.sprite = sprite;
        }

        showFrame() {
            if (this.sprite) {
                let frame = this.frames[this.currentFrame];
                if (this.flipX || this.flipY) {
                    frame = frame.clone();
                    if (this.flipX) {
                        frame.flipX();
                    }
                    if (this.flipY) {
                        frame.flipY();
                    }
                }

                this.sprite.setImage(frame);
            }
        }

        update(timeMillis: number) { }
    }

    export class TimedAnimation extends Animation {
        running: boolean;
        frameInterval: number;
        elapsed: number;
        duration: number;

        constructor(frames: Image[]) {
            super(frames);
            this.reset();
        }

        start(durationMs: number, flipX = false, flipY = false) {
            if (durationMs < this.frames.length) return;
            this.flipX = flipX;
            this.flipY = flipY;
            this.elapsed = -1;
            this.running = true;
            this.duration = durationMs;
            this.frameInterval = Math.floor(durationMs / this.frames.length);
        }

        /**
         * Adds a frame to the end of the animation
         * @param frame The frame to add to the end of this animation
         */
        //% blockId=timedanimframe block="%anim add frame %frame=screen_image_picker"
        //% blockNamespace="Sprites" group="Animations" weight=80 color="#23c47e"
        addFrame(frame: Image) {
            this.appendFrame(frame);
        }

        update(deltaTime: number) {
            if (this.running) {
                if (this.elapsed === -1) {
                    this.elapsed = 0;
                    this.setFrame(0)
                }
                else if (this.currentFrame < this.frames.length) {
                    this.elapsed += deltaTime;
                    if (this.elapsed > this.frameInterval) {
                        this.elapsed = this.elapsed - this.frameInterval;
                        this.currentFrame = this.currentFrame + 1;

                        if (this.currentFrame > this.frames.length - 1) {
                            this.running = false;
                        }
                        else {
                            this.setFrame(this.currentFrame);
                            this.update(0); // just in case delaTime > frameInterval
                        }
                    }
                }
            }
        }

        reset() {
            this.running = false;
            this.elapsed = -1;
        }
    }

    export enum MovementDirection {
        //% block="up"
        Up,
        //% block="down"
        Down,
        //% block="left"
        Left,
        //% block="right"
        Right
    }

    export class MovementAnimation extends Animation {
        // Last sprite position where the frame changed
        lastX: number;
        lastY: number;
        facing: MovementDirection;

        // Threshold for advancing left/right animation
        xThreshold: number;

        // Threshold for advancing up/down animation
        yThreshold: number;

        // These arrays contain indices for frames in the frames array
        up: number[];
        down: number[];
        left: number[];
        right: number[];

        // Index of the current animation (in the current direction)
        frameIndex: number;

        constructor(sprite: Sprite) {
            super([], sprite);
            this.lastX = sprite.x;
            this.lastY = sprite.y;
            this.xThreshold = 4;
            this.yThreshold = 4;
        }

        addFrame(frame: Image, direction: MovementDirection, fliplicate = false) {
            let frameArray: number[];
            let isUpDown = true;
            switch (direction) {
                case MovementDirection.Up:
                    frameArray = this.up || (this.up = []);
                    break;
                case MovementDirection.Down:
                    frameArray = this.down || (this.down = []);
                    break;
                case MovementDirection.Left:
                    frameArray = this.left || (this.left = []);
                    isUpDown = false;
                    break;
                case MovementDirection.Right:
                    frameArray = this.right || (this.right = []);
                    isUpDown = false;
                    break;
            }

            if (frameArray) {
                frameArray.push(this.appendFrame(frame));

                if (this.facing === undefined) {
                    this.facing = direction;
                }

                if (fliplicate) {
                    const mirror = frame.clone();

                    if (isUpDown) frame.flipY()
                    else frame.flipX()

                    this.addFrame(mirror, reverse(direction));
                }
            }
        }

        update(deltaTime: number) {
            const dx = this.sprite.x - this.lastX;
            const mx = Math.abs(dx);

            const dy = this.sprite.y - this.lastY;
            const my = Math.abs(dy)

            let movementDirection = -1;
            let didMove = false;

            if (this.left || this.right) {
                if (mx > my) {
                    if (dx > 0) {
                        movementDirection = MovementDirection.Right;
                    }
                    else if (dx < 0) {
                        movementDirection = MovementDirection.Left;
                    }
                }

                if (mx > this.xThreshold) {
                    didMove = true;
                }
            }


            if (this.up || this.down) {
                if (my > mx) {
                    if (dy > 0) {
                        movementDirection = MovementDirection.Down;
                    }
                    else if (dy < 0) {
                        movementDirection = MovementDirection.Up;
                    }
                }

                if (my > this.yThreshold) {
                    didMove = true;
                }
            }


            const changedDirection = this.facing !== movementDirection;

            if (movementDirection !== -1 && (didMove || changedDirection)) {
                this.lastX = this.sprite.x;
                this.lastY = this.sprite.y;

                if (changedDirection) {
                    this.frameIndex = 0;
                    this.facing = movementDirection;
                }

                this.frameIndex = this.setFrameCore(movementDirection, this.frameIndex);
            }
        }

        private setFrameCore(direction: MovementDirection, directionIndex: number) {
            let frameArray: number[];

            switch (direction) {
                case MovementDirection.Up:
                    frameArray = this.up || this.down;
                    break;
                case MovementDirection.Down:
                    frameArray = this.down || this.up;
                    break;
                case MovementDirection.Left:
                    frameArray = this.left || this.right;
                    break;
                case MovementDirection.Right:
                    frameArray = this.right || this.left;
                    break;
            }

            if (frameArray) {
                this.currentFrame = frameArray[directionIndex];
                this.showFrame();

                // Return the next valid frame index for this direction
                return (directionIndex + 1) % frameArray.length;
            }
            return -1;
        }
    }

    function reverse(direction: MovementDirection) {
        switch (direction) {
            case MovementDirection.Up: return MovementDirection.Down;
            case MovementDirection.Down: return MovementDirection.Up;
            case MovementDirection.Left: return MovementDirection.Right;
            case MovementDirection.Right: return MovementDirection.Left;
        }
    }

    /**
     * Creates a timed animation
     */
    //% blockId=createtimedanimation block="create timed animation"
    //% blockNamespace="Sprites" group="Animations" blockSetVariable="anim" weight=81
    export function createAnimation(frames?: Image[]) {
        return new TimedAnimation(frames || [])
    }
}