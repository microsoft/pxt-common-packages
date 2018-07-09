enum SpriteFlag {
    //% block="ghost"
    Ghost = sprites.Flag.Ghost,
    //% block="auto destroy"
    AutoDestroy = sprites.Flag.AutoDestroy,
    //% block="stay in screen"
    StayInScreen = sprites.Flag.StayInScreen
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
//% blockNamespace=sprites color="#4B7BEC" blockGap=8
class Sprite implements SpriteLike {
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="x (horizontal position)"
    x: number
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="y (vertical position)"
    y: number
    private _z: number
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="vx (velocity x)"
    vx: number
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="vy (velocity y)"
    vy: number
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="ax (acceleration x)"
    ax: number
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="ay (acceleration y)"
    ay: number
    /**
     * The type of sprite
     */
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="kind"
    type: number

    /**
     * A bitset of layer. Each bit is a layer, default is 1.
     */
    //% group="Properties"
    layer: number;

    _lastX: number;
    _lastY: number;

    /**
     * Time to live in game ticks. The lifespan decreases by 1 on each game update
     * and the sprite gets destroyed when it reaches 0.
     */
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="lifespan"
    lifespan: number;
    private _say: string;
    private _sayExpires: number;
    private _image: Image;
    private _obstacles: sprites.Obstacle[];
    
    _hitboxes: game.Hitbox[];

    flags: number
    id: number

    overlapHandler: (other: Sprite) => void;
    collisionHandlers: (() => void)[][];
    private destroyHandler: () => void;

    constructor(img: Image) {
        this.x = screen.width >> 1;
        this.y = screen.height >> 1;
        this._z = 0
        this._lastX = this.x;
        this._lastY = this.y;
        this.vx = 0
        this.vy = 0
        this.ax = 0
        this.ay = 0
        this.flags = 0
        this.setImage(img);
        this.type = 0; // not a member of any type by default
        this.layer = 1; // by default, in layer 1
        this.lifespan = undefined
    }

    /**
     * Gets the current image
     */
    get image(): Image {
        return this._image;
    }

    /**
     * Sets the image on the sprite
     */
    setImage(img: Image) {
        if (!img) return; // don't break the sprite
        this._image = img;
        this._hitboxes = game.calculateHitBoxes(this);
    }

    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="z (depth)"
    get z(): number {
        return this._z;
    }

    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="z (depth)"
    set z(value: number) {
        if (value != this._z) {
            this._z = value;
            game.currentScene().flags |= scene.Flag.NeedsSorting;
        }
    }

    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="width"
    get width() {
        return this._image.width
    }
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="height"
    get height() {
        return this._image.height
    }
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="left"
    get left() {
        return this.x - (this.width >> 1)
    }
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="left"
    set left(value: number) {
        this.x = value + (this.width >> 1);
    }
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="right"
    get right() {
        return this.left + this.width
    }
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="right"
    set right(value: number) {
        this.x = value - (this.width >> 1);
    }
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine
    get top() {
        return this.y - (this.height >> 1)
    }
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine
    set top(value: number) {
        this.y = value + (this.height >> 1);
    }
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="bottom"
    get bottom() {
        return this.top + this.height
    }
    //% group="Properties" blockSetVariable="agent"
    //% blockCombine block="bottom"
    set bottom(value: number) {
        this.y = value - (this.height >> 1);
    }

    /**
     * Sets the sprite position
     * @param x horizontal position
     * @param y vertical position
     */
    //% group="Properties"
    //% weight=100
    //% blockId=spritesetpos block="set %sprite(agent) position to x %x y %y"
    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    /**
     * Display a speech bubble with the text, for the given time
     * @param text the text to say, eg: ":)"
     * @param time time to keep text on, eg: 2000
     */
    //% group="Properties"
    //% blockId=spritesay block="%sprite(agent) say %text||for %millis ms"
    //% time.defl=2000
    //% help=sprites/sprite/say
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
        const font = image.font8;
        screen.drawTransparentImage(this._image, l, t)
        // say text
        if (this._say && (this._sayExpires < 0 || this._sayExpires > control.millis())) {
            screen.fillRect(
                l,
                t - font.charHeight - 2,
                this._say.length * font.charWidth + 2,
                font.charHeight + 4,
                1);
            screen.print(this._say,
                l + 2,
                t - font.charHeight,
                15,
                font);
        }
        // debug info
        if (game.debug) {
            let color = 1;
            this._hitboxes.forEach(box => {
                this._image.drawRect(box.ox, box.oy, box.width, box.height, color);
                color++;
                if (color >= 15) color = 1;
            });
        }
    }

    __update(camera: scene.Camera, dt: number) {
        if (this.lifespan !== undefined) {
            this.lifespan--;
            if (this.lifespan <= 0)
                this.destroy();
        }
        if ((this.flags & sprites.Flag.AutoDestroy)
            && this.isOutOfScreen(camera)) {
            this.destroy()
        }

        if (this.flags & sprites.Flag.StayInScreen) {
            if (this.left < camera.offsetX) {
                this.left = camera.offsetX;
            }
            else if (this.right > camera.offsetX + screen.width) {
                this.right = camera.offsetX + screen.width;
            }

            if (this.top < camera.offsetY) {
                this.top = camera.offsetY;
            }
            else if (this.bottom > camera.offsetY + screen.height) {
                this.bottom = camera.offsetY + screen.height;
            }
        }
    }

    /**
     * Sets the sprite as a ghost (which does not interact with physics)
     */
    //% group="Properties"
    //% blockId=spritesetsetflag block="set %sprite(agent) %flag %on=toggleOnOff"
    setFlag(flag: SpriteFlag, on: boolean) {
        if (on) this.flags |= flag
        else this.flags = ~(~this.flags | flag);
    }

    /**
     * Tests if a sprite overlaps with another
     * @param other
     */
    //% group="Overlaps"
    //% blockId=spriteoverlapswith block="%sprite(agent) overlaps with %other=variables_get(otherSprite)"
    //% help=sprites/sprite/overlaps-with
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
    //% afterOnStart=true
    //% help=sprites/sprite/on-overlap
    onOverlap(handler: (other: Sprite) => void) {
        this.overlapHandler = handler;
    }

    /**
     * Registers code when the sprite collides with an obstacle
     * @param direction
     * @param handler
     */
    //% blockNamespace="scene" group="Collisions"
    onCollision(direction: CollisionDirection, tileIndex: number, handler: () => void) {
        if (!this.collisionHandlers)
            this.collisionHandlers = [];

        direction = Math.max(0, Math.min(3, direction | 0));

        if (!this.collisionHandlers[direction])
            this.collisionHandlers[direction] = [];

        this.collisionHandlers[direction][tileIndex] = handler;
    }

    /**
     * Determines if there is an obstacle in the given direction
     * @param direction
     */
    //% blockId=spritehasobstacle block="is %sprite(agent) hitting wall %direction"
    //% blockNamespace="scene" group="Collisions"
    isHittingTile(direction: CollisionDirection): boolean {
        return this._obstacles && !!this._obstacles[direction];
    }

    /**
     * Gets the obstacle sprite in a given direction if any
     * @param direction
     */
    //% blockId=spriteobstacle block="%sprite(agent) wall hit on %direction"
    //% blockNamespace="scene" group="Collisions"
    tileHitFrom(direction: CollisionDirection): number {
        return (this._obstacles && this._obstacles[direction]) ? this._obstacles[direction].tileIndex : -1;
    }

    clearObstacles() {
        this._obstacles = undefined;
    }

    registerObstacle(direction: CollisionDirection, other: sprites.Obstacle) {
        if (!this._obstacles)
            this._obstacles = [];
        this._obstacles[direction] = other;

        const handler = (this.collisionHandlers && this.collisionHandlers[direction]) ? this.collisionHandlers[direction][other.tileIndex] : undefined;
        if (handler)
            control.runInParallel(handler);
        const scene = game.currentScene();
        scene.collisionHandlers
            .filter(h => h.type == this.type && h.tile == other.tileIndex)
            .forEach(h => control.runInParallel(() => h.handler(this)));
    }

    /**
     * Register code to run when sprite is destroyed
     * @param handler
     */
    //% group="Lifecycle"
    //% weight=9
    onDestroyed(handler: () => void) {
        this.destroyHandler = handler
    }

    /**
     * Destroys the sprite
     */
    //% group="Lifecycle"
    //% weight=10
    //% blockId=spritedestroy block="destroy %sprite(agent)"
    destroy() {
        if (this.flags & sprites.Flag.Destroyed)
            return
        this.flags |= sprites.Flag.Destroyed
        const scene = game.currentScene();
        scene.allSprites.removeElement(this);
        scene.physicsEngine.removeSprite(this);
        if (this.destroyHandler)
            this.destroyHandler();
        scene.destroyedHandlers
            .filter(h => h.type == this.type)
            .forEach(h => h.handler(this));
    }

    toString() {
        return `${this.id}(${this.x},${this.y})->(${this.vx},${this.vy})`;
    }
}