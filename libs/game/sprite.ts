enum SpriteFlag {
    //% block="ghost"
    Ghost = sprites.Flag.Ghost,
    //% block="auto destroy"
    AutoDestroy = sprites.Flag.AutoDestroy,
    //% block="obstacle"
    Obstacle = sprites.Flag.Obstacle
}

enum CollisionDirection {
    //% block="left"
    Left = 0,
    //% block="top"
    Top = 1,
    //% block="right"
    Right = 2,
    //% block="bottom"
    Bottom = 3
}

interface SpriteLike {
    z: number;
    id: number;
    __update(camera: scene.Camera, dt: number): void;
    __draw(camera: scene.Camera): void;
}

interface AnimationAction {
    animation: sprites.TimedAnimation;
    durationMs: number;
    flipX: boolean;
    flipY: boolean;
}


enum FlipOption {
    //% block=none
    None,
    //% block="flip x"
    FlipX,
    //% block="flip y"
    FlipY,
    //% block="flip x+y"
    FlipXY
}

/**
 * A sprite on screem
 **/
//% blockNamespace=Sprites color="#23c47e" blockGap=8
class Sprite implements SpriteLike {
    //% group="Properties"
    //% blockCombine block="x (horizontal position)"
    x: number
    //% group="Properties"
    //% blockCombine block="y (vertical position)"
    y: number
    private _z: number
    //% group="Properties"
    //% blockCombine block="vx (velocity x)"
    vx: number
    //% group="Properties"
    //% blockCombine block="vy (velocity y)"
    vy: number
    //% group="Properties"
    //% blockCombine block="ax (acceleration x)"
    ax: number
    //% group="Properties"
    //% blockCombine block="ay (acceleration y)"
    ay: number
    //% group="Properties"
    //% blockCombine block="layer"
    layer: number
    //% group="Properties"
    //% blockCombine block="health"
    health: number;
    private _say: string;
    private _sayExpires: number;
    private _image: Image;
    private _obstacles: Sprite[];
    private _movementAnim: sprites.MovementAnimation;
    private _currentAnimation: sprites.TimedAnimation;
    private _animationQueue: AnimationAction[];

    flags: number
    id: number

    overlapHandler: (other: Sprite) => void;
    collisionHandlers: ((other:Sprite) => void)[];
    private destroyHandler: () => void;

    constructor(img: Image) {
        this.x = screen.width >> 1
        this.y = screen.height >> 1
        this._z = 0
        this.vx = 0
        this.vy = 0
        this.ax = 0
        this.ay = 0
        this.flags = 0
        this._image = img
        this.layer = 1; // member of layer 1 by default
        this.health = undefined
    }

    /**
     * Gets the current image
     */
    //% group="Properties"
    //% blockCombine block="image"
    get image(): Image {
        return this._image;
    }

    /**
     * Sets the image on the sprite
     */
    //% group="Properties"
    //% blockId=spritesetimage block="set %sprite image to %img=screen_image_picker"
    setImage(img: Image) {
        if (!img) return; // don't break the sprite
        this._image = img;
    }

    //% group="Properties"
    //% blockCombine block="z (depth)"
    get z(): number {
        return this._z;
    }

    //% group="Properties"
    //% blockCombine block="z (depth)"
    set z(value: number) {
        if (value != this._z) {
            this._z = value;
            game.currentScene().flags |= scene.Flag.NeedsSorting;
        }
    }

    //% group="Properties"
    //% blockCombine block="width"
    get width() {
        return this._image.width
    }
    //% group="Properties"
    //% blockCombine block="height"
    get height() {
        return this._image.height
    }
    //% group="Properties"
    //% blockCombine block="left"
    get left() {
        return this.x - (this.width >> 1)
    }
    //% group="Properties"
    //% blockCombine block="left"
    set left(value: number) {
        this.x = value + (this.width >> 1);
    }
    //% group="Properties"
    //% blockCombine block="right"
    get right() {
        return this.left + this.width
    }
    //% group="Properties"
    //% blockCombine block="right"
    set right(value: number) {
        this.x = value - (this.width >> 1);
    }
    //% group="Properties"
    //% blockCombine
    get top() {
        return this.y - (this.height >> 1)
    }
    //% group="Properties"
    //% blockCombine
    set top(value: number) {
        this.y = value + (this.height >> 1);
    }
    //% group="Properties"
    //% blockCombine block="bottom"
    get bottom() {
        return this.top + this.height
    }
    //% group="Properties"
    //% blockCombine block="bottom"
    set bottom(value: number) {
        this.y = value - (this.height >> 1);
    }

    /**
     * Display a speech bubble with the text, for the given time
     * @param text the text to say, eg: ":)"
     * @param time time to keep text on, eg: 2000
     */
    //% group="Properties"
    //% blockId=spritesay block="%sprite say %text||for %millis ms"
    //% time.defl=2000
    say(text: string, millis?: number) {
        this._say = text;
        if (!millis || millis < 0)
            this._sayExpires = -1;
        else
            this._sayExpires = control.millis() + millis;
    }

    /**
     * Indicates if the sprite is outside the screen
     */
    //%
    isOutOfScreen(camera: scene.Camera): boolean {
        const ox = camera.offsetX;
        const oy = camera.offsetY;
        return this.right - ox < 0 || this.bottom - oy < 0 || this.left - ox > screen.width || this.top - oy > screen.height;
    }

    __draw(camera: scene.Camera) {
        if (this.isOutOfScreen(camera)) return;

        const l = this.left - camera.offsetX;
        const t = this.top - camera.offsetY;
        screen.drawTransparentImage(this._image, l, t)
        // say text
        if (this._say && (this._sayExpires < 0 || this._sayExpires > control.millis())) {
            screen.fillRect(
                l,
                t - image.font5.charHeight - 2,
                this._say.length * image.font5.charWidth + 2,
                image.font5.charHeight + 4,
                1);
            screen.print(this._say,
                l + 2,
                t - image.font5.charHeight,
                15,
                image.font5);
        }
        // debug info
        if (game.debug)
            screen.drawRect(l, t, this.width, this.height, 3);
    }

    __update(camera: scene.Camera, dt: number) {
        if (this._currentAnimation) {
            if (this._currentAnimation.running) {
                this._currentAnimation.update(dt * 1000);
            }
            else {
                this._currentAnimation = undefined;

                if (this._animationQueue && this._animationQueue.length) {
                    this.nextAnimation();
                }
                else if (this._movementAnim) {
                    this._movementAnim.showFrame();
                }
            }
        }
        else if (this._animationQueue && this._animationQueue.length) {
            this.nextAnimation();
        }
        else if (this._movementAnim) {
            this._movementAnim.update(dt * 1000);
        }

        if (this.health !== undefined) {
            this.health--;
            if (this.health <= 0)
                this.destroy();
        }
        if ((this.flags & sprites.Flag.AutoDestroy)
            && this.isOutOfScreen(camera)) {
            this.destroy()
        }
    }

    /**
     * Sets the sprite as a ghost (which does not interact with physics)
     */
    //% group="Properties"
    //% blockId=spritesetsetflag block="set %sprite %flag %on=toggleOnOff"
    setFlag(flag: SpriteFlag, on: boolean) {
        if (on) this.flags |= flag
        else this.flags = ~(~this.flags | flag);
    }

    /**
     * Tests if a sprite overlaps with another
     * @param other
     */
    //% group="Overlaps"
    //% blockId=spriteoverlapswith block="%sprite overlaps with %other=variables_get"
    overlapsWith(other: Sprite) {
        if (other == this) return false;
        if (this.flags & sprites.Flag.Ghost)
            return false
        if (other.flags & sprites.Flag.Ghost)
            return false
        return other._image.overlapsWith(this._image, this.left - other.left, this.top - other.top)
    }

    /**
     * Registers code when the sprite overlaps with another sprite
     * @param spriteType sprite type to match
     * @param handler
     */
    //% group="Overlaps"
    //% blockId=spriteonoverlap block="on %sprite overlaped with"
    //% afterOnStart=true handlerStatement=1
    onOverlap(handler: (other: Sprite) => void) {
        this.overlapHandler = handler;
    }

    /**
     * Registers code when the sprite collides with another sprite
     * @param direction
     * @param handler
     */
    //% group="Collisions"
    //% blockId=spriteoncollision block="on %sprite collided %direction with"
    //% afterOnStart=true handlerStatement=1
    onCollision(direction: CollisionDirection, handler: (other: Sprite) => void) {
        if (!this.collisionHandlers)
            this.collisionHandlers = [];
        direction = Math.max(0, Math.min(3, direction | 0));
        this.collisionHandlers[direction] = handler;
    }

    /**
     * Determines if there is an obstacle in the given direction
     * @param direction
     */
    //% blockId=spritehasobstacle block="has %sprite obstacle %direction"
    //% group="Collisions"
    hasObstacle(direction: CollisionDirection): boolean {
        return this._obstacles && !!this._obstacles[direction];
    }

    /**
     * Gets the obstacle sprite in a given direction if any
     * @param direction
     */
    //% blockId=spriteobstacle block="%sprite obstacle %direction"
    //% group="Collisions"
    obstacle(direction: CollisionDirection): Sprite {
        return this._obstacles ? this._obstacles[direction] : undefined;
    }

    /**
     * Set a frame on this sprite's movement animation
     * @param frame The image for this frame
     * @param direction The movement direction for which this frame will be shown
     * @param addReverseDirection Also add a flipped version of the sprite in the opposite direction
     */
    //% blockId=spritemovementframe block="add %sprite movement frame %image=screen_image_picker %direction ||reversed %addReverseDirection=toggleOnOff"
    //% group="Animations" weight=100
    addMovementFrame(frame: Image, direction: sprites.MovementDirection, addReverseDirection = false) {
        if (!this._movementAnim) {
            this._movementAnim = new sprites.MovementAnimation(this);
        }
        this._movementAnim.addFrame(frame, direction, addReverseDirection);
    }

    /**
     * Determines if the movement animation is facing a given direction. Note that
     * this API will always return false if no movement frames have been added.
     */
    //% blockId=spriteisfacing block="is %sprite facing %direction"
    //% group="Animations" weight=99 blockGap=8
    isFacing(direction: sprites.MovementDirection) {
        if (this._movementAnim) return direction === this._movementAnim.facing;
        else return false;
    }

    /**
     * Queues a timed animation on the sprite without blocking the current fiber
     * @param animation The animation to show
     * @param duration The duration of the animation
     * @param flip Show the animation flipped over an axis
     */
    //% blockId=spritefireanimation block="%sprite start animation %animation %duration=timePicker|ms||%flip"
    //% group="Animations" weight=79
    startAnimation(animation: sprites.TimedAnimation, duration: number, flip = FlipOption.None) {
        if (!animation) return;
        if (!this._animationQueue) this._animationQueue = [];
        this._animationQueue.push({
            animation: animation,
            durationMs: duration,
            flipX: (flip === FlipOption.FlipX || flip === FlipOption.FlipXY),
            flipY: (flip === FlipOption.FlipY || flip === FlipOption.FlipXY)
        });
    }

    /**
     * Determines if the sprite is currently showing a timed animation
     */
    //% blockId=spriteisshowing block="is %sprite showing animation"
    //% group="Animations" weight=78
    isShowingAnimation() {
        return !!this._currentAnimation;
    }

    clearObstacles() {
        this._obstacles = undefined;
    }

    registerObstacle(direction: CollisionDirection, other: Sprite) {
        if (!this._obstacles)
            this._obstacles = [];
        this._obstacles[direction] = other;

        const handler = this.collisionHandlers ? this.collisionHandlers[direction] : undefined;
        if (handler)
            handler(other);
    }

    /**
     * Register code to run when sprite is destroyed
     * @param handler
     */
    //% group="Lifecycle"
    //% weight=9
    //% blockId=spriteondestroy block="on %sprite destroyed"
    //% afterOnStart=true handlerStatement=1
    onDestroyed(handler: () => void) {
        this.destroyHandler = handler
    }

    /**
     * Destroys the sprite
     */
    //% group="Lifecycle"
    //% weight=10
    //% blockId=spritedestroy block="destroy %sprite"
    destroy() {
        if (this.flags & sprites.Flag.Destroyed)
            return
        this.flags |= sprites.Flag.Destroyed
        const scene = game.currentScene();
        scene.allSprites.removeElement(this);
        scene.physicsEngine.removeSprite(this);
        if (this.destroyHandler) {
            control.runInParallel(this.destroyHandler)
        }
    }

    toString() {
        return `${this.id}(${this.x},${this.y})->(${this.vx},${this.vy})`;
    }

    private nextAnimation() {
        const action = this._animationQueue.shift();
        if (action.animation.sprite && action.animation.sprite != this) {
            // clone it if necessary
            this._currentAnimation = new sprites.TimedAnimation(action.animation.frames);
        }
        else {
            this._currentAnimation = action.animation;
        }
        this._currentAnimation.setSprite(this);
        this._currentAnimation.start(action.durationMs, action.flipX, action.flipY);
    }
}