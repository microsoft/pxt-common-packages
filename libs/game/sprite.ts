enum SpriteFlag {
    //% block="ghost"
    Ghost = sprites.Flag.Ghost,
    //% block="auto destroy"
    AutoDestroy = sprites.Flag.AutoDestroy,
    //% block="stay in screen"
    StayInScreen = sprites.Flag.StayInScreen,
    //% block="destroy on wall"
    DestroyOnWall = sprites.Flag.DestroyOnWall,
    //% block="bounce on wall"
    BounceOnWall = sprites.Flag.BounceOnWall,
    //% block="show physics"
    ShowPhysics = sprites.Flag.ShowPhysics
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
    __serialize(offset: number): Buffer;
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
 * A sprite on the screen
 **/
//% blockNamespace=sprites color="#4B7BEC" blockGap=8
class Sprite implements SpriteLike {
    _x: Fx8
    _y: Fx8
    private _z: number
    _vx: Fx8
    _vy: Fx8
    _ax: Fx8
    _ay: Fx8

    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="x"
    get x(): number {
        return Fx.toInt(this._x) + (this._image.width >> 1)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="x"
    set x(v: number) {
        this._lastX = this._x;
        this._x = Fx8(v - (this._image.width >> 1))
    }

    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="y"
    get y(): number {
        return Fx.toInt(this._y) + (this._image.height >> 1)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="y"
    set y(v: number) {
        this._lastY = this._y;
        this._y = Fx8(v - (this._image.height >> 1))
    }

    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="vx (velocity x)"
    get vx(): number {
        return Fx.toFloat(this._vx)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="vx (velocity x)"
    set vx(v: number) {
        this._vx = Fx8(v)
    }

    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="vy (velocity y)"
    get vy(): number {
        return Fx.toFloat(this._vy)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="vy (velocity y)"
    set vy(v: number) {
        this._vy = Fx8(v)
    }

    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="ax (acceleration x)"
    get ax(): number {
        return Fx.toFloat(this._ax)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="ax (acceleration x)"
    set ax(v: number) {
        this._ax = Fx8(v)
    }

    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="ay (acceleration y)"
    get ay(): number {
        return Fx.toFloat(this._ay)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="ay (acceleration y)"
    set ay(v: number) {
        this._ay = Fx8(v)
    }

    /** 
     * Custom data
     */
    //%
    data: any;
    _kind: number;

    /**
     * A bitset of layer. Each bit is a layer, default is 1.
     */
    //% group="Properties"
    layer: number;

    _lastX: Fx8;
    _lastY: Fx8;

    _action: number; //Used with animation library

    /**
     * Time to live in milliseconds. The lifespan decreases by 1 on each millisecond
     * and the sprite gets destroyed when it reaches 0.
     */
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="lifespan"
    lifespan: number;
    private _image: Image;
    private _obstacles: sprites.Obstacle[];

    private updateSay: (dt: number, camera: scene.Camera) => void;
    private sayBubbleSprite: Sprite;

    _hitbox: game.Hitbox;
    _overlappers: number[];

    flags: number
    id: number

    overlapHandler: (other: Sprite) => void;
    collisionHandlers: (() => void)[][];
    private destroyHandler: () => void;

    constructor(img: Image) {
        this._x = Fx8(screen.width - img.width >> 1);
        this._y = Fx8(screen.height - img.height >> 1);
        this._z = 0
        this._lastX = this._x;
        this._lastY = this._y;
        this.vx = 0
        this.vy = 0
        this.ax = 0
        this.ay = 0
        this.flags = 0
        this.setImage(img);
        this.setKind(-1); // not a member of any type by default
        this.layer = 1; // by default, in layer 1
        this.lifespan = undefined;
        this._overlappers = [];
    }
    
    __serialize(offset: number): Buffer {
        const buf = control.createBuffer(offset + 12);
        let k = offset;
        buf.setNumber(NumberFormat.Int16LE, k, Fx.toInt(this._x)); k += 2;
        buf.setNumber(NumberFormat.Int16LE, k, Fx.toInt(this._y)); k += 2;
        buf.setNumber(NumberFormat.Int16LE, k, Fx.toInt(this._vx)); k += 2;
        buf.setNumber(NumberFormat.Int16LE, k, Fx.toInt(this._vy)); k += 2;
        buf.setNumber(NumberFormat.Int16LE, k, Fx.toInt(this._ax)); k += 2;
        buf.setNumber(NumberFormat.Int16LE, k, Fx.toInt(this._ay)); k += 2;
        return buf;
    }

    /**
     * Gets the current image
     */
    //% group="Lifecycle"
    //% blockId=spriteimage block="%sprite(mySprite) image"
    //% weight=8
    get image(): Image {
        return this._image;
    }

    /**
     * Sets the image on the sprite
     */
    //% group="Lifecycle"
    //% blockId=spritesetimage block="set %sprite(mySprite) image to %img=screen_image_picker"
    //% weight=7 help=sprites/sprite/set-image
    setImage(img: Image) {
        if (!img) return; // don't break the sprite

        let oMinX = 0;
        let oMinY = 0;
        let oMaxX = 0;
        let oMaxY = 0;

        // Identify old upper left corner
        if (this._hitbox) {
            oMinX = this._hitbox.ox;
            oMinY = this._hitbox.oy;
            oMaxX = this._hitbox.ox + this._hitbox.width;
            oMaxY = this._hitbox.oy + this._hitbox.height;
        }

        this._image = img;
        this._hitbox = game.calculateHitBox(this);

        // Identify new upper left corner
        let nMinX = this._hitbox.ox;
        let nMinY = this._hitbox.oy;
        let nMaxX = this._hitbox.ox + this._hitbox.width;
        let nMaxY = this._hitbox.oy + this._hitbox.height;

        const minXDiff = oMinX - nMinX;
        const minYDiff = oMinY - nMinY;
        const maxXDiff = oMaxX - nMaxX;
        const maxYDiff = oMaxY - nMaxY;

        // If just a small change to the hitbox, don't change the hitbox
        // Used for things like walking animations
        if (oMaxX != oMinX && Math.abs(minXDiff) + Math.abs(maxXDiff) <= 2) {
            this._hitbox.ox = oMinX;
            this._hitbox.width = oMaxX - oMinX;
        }
        if (oMaxY != oMinY && Math.abs(minYDiff) + Math.abs(maxYDiff) <= 2) {
            this._hitbox.oy = oMinY;
            this._hitbox.height = oMaxY - oMinY;
        }
    }

    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="z (depth)"
    get z(): number {
        return this._z;
    }

    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="z (depth)"
    set z(value: number) {
        if (value != this._z) {
            this._z = value;
            game.currentScene().flags |= scene.Flag.NeedsSorting;
        }
    }

    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="width"
    get width() {
        return this._image.width
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="height"
    get height() {
        return this._image.height
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="left"
    get left() {
        return Fx.toInt(this._x)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="left"
    set left(value: number) {
        this._x = Fx8(value)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="right"
    get right() {
        return this.left + this.width
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="right"
    set right(value: number) {
        this.left = value - this.width
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine
    get top() {
        return Fx.toInt(this._y);
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine
    set top(value: number) {
        this._y = Fx8(value);
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="bottom"
    get bottom() {
        return this.top + this.height;
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="bottom"
    set bottom(value: number) {
        this.top = value - this.height;
    }
    /**
     * The type of sprite
     */
    //% group="Overlaps"
    //% blockId="spritegetkind" block="%sprite(mySprite) kind"
    //% weight=79 help=sprites/sprite/kind
    kind() {
        return this._kind;
    }

    /**
     * The type of sprite
     */
    //% group="Overlaps"
    //% blockId="spritesetkind" block="set %sprite(mySprite) kind to %kind"
    //% kind.shadow=spritetype
    //% weight=80 help=sprites/sprite/set-kind
    setKind(value: number) {
        if (value == undefined || this._kind === value) return;

        const spritesByKind = game.currentScene().spritesByKind;
        if (this._kind >= 0 && spritesByKind[this._kind])
            spritesByKind[this._kind].remove(this);

        if (value >= 0) {
            if (!spritesByKind[value]) spritesByKind[value] = new SpriteSet();
            spritesByKind[value].add(this);
        }

        this._kind = value;
    }

    /**
     * Set the sprite position in pixels starting from the top-left corner of the screen.
     * @param x horizontal position in pixels
     * @param y vertical position in pixels
     */
    //% group="Properties"
    //% weight=100
    //% blockId=spritesetpos block="set %sprite(mySprite) position to x %x y %y"
    //% help=sprites/sprite/set-position
    //% x.shadow="positionPicker" y.shadow="positionPicker"
    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    /**
     * Sets the sprite velocity in pixel / sec²
     * @param vx 
     * @param vy 
     */
    //% group="Properties"
    //% weight=100
    //% blockId=spritesetvel block="set %sprite(mySprite) velocity to vx %vx vy %vy"
    //% help=sprites/sprite/set-velociy
    //% vx.shadow=spriteSpeedPicker
    //% vy.shadow=spriteSpeedPicker
    setVelocity(vx: number, vy: number): void {
        this.vx = vx;
        this.vy = vy;
    }

    /**
     * Display a speech bubble with the text, for the given time
     * @param text the text to say, eg: ":)"
     * @param time time to keep text on
     */
    //% group="Properties"
    //% blockId=spritesay block="%sprite(mySprite) say %text||for %millis ms"
    //% inlineInputMode=inline
    //% help=sprites/sprite/say
    say(text: string, timeOnScreen?: number, textColor = 15, textBoxColor = 1) {

        if (!text) {
            this.updateSay = undefined;
            if (this.sayBubbleSprite) {
                this.sayBubbleSprite.destroy();
            }
            return;
        }



        let pixelsOffset = 0;
        let holdTextSeconds = 1.5;
        let bubblePadding = 4;
        let maxTextWidth = 100;
        let font = image.font8;
        let startX = 2;
        let startY = 2;
        let bubbleWidth = text.length * font.charWidth + bubblePadding;
        let maxOffset = text.length * font.charWidth - maxTextWidth;
        let bubbleOffset: number = this._hitbox.oy;
        // sets the defaut scroll speed in pixels per second
        let speed = 45;

        // Calculates the speed of the scroll if scrolling is needed and a time is specified
        if (timeOnScreen && maxOffset > 0) {
            speed = (maxOffset + (2 * maxTextWidth)) / (timeOnScreen / 1000);
            speed = Math.max(speed, 45);
            holdTextSeconds = maxTextWidth / speed;
            holdTextSeconds = Math.min(holdTextSeconds, 1.5);
        }

        if (timeOnScreen) {
            timeOnScreen = timeOnScreen + control.millis();
        }

        if (bubbleWidth > maxTextWidth + bubblePadding) {
            bubbleWidth = maxTextWidth + bubblePadding;
        } else {
            maxOffset = -1;
        }

        // Destroy previous sayBubbleSprite to prevent leaking
        if (this.sayBubbleSprite) {
            this.sayBubbleSprite.destroy();
        }

        this.sayBubbleSprite = sprites.create(image.create(bubbleWidth, font.charHeight + bubblePadding), -1);

        this.sayBubbleSprite.setFlag(SpriteFlag.Ghost, true);
        this.updateSay = (dt, camera) => {
            // Update box stuff as long as timeOnScreen doesn't exist or it can still be on the screen
            if (!timeOnScreen || timeOnScreen > control.millis()) {
                this.sayBubbleSprite.image.fill(textBoxColor);
                // The minus 2 is how much transparent padding there is under the sayBubbleSprite
                this.sayBubbleSprite.y = this.top + bubbleOffset - ((font.charHeight + bubblePadding) >> 1) - 2;
                this.sayBubbleSprite.x = this.x;

                if (!this.isOutOfScreen(camera)) {
                    const ox = camera.offsetX;
                    const oy = camera.offsetY;

                    if (this.sayBubbleSprite.left - ox < 0) {
                        this.sayBubbleSprite.left = 0;
                    }

                    if (this.sayBubbleSprite.right - ox > screen.width) {
                        this.sayBubbleSprite.right = screen.width;
                    }

                    // If sprite bubble above the sprite gets cut off on top, place the bubble below the sprite
                    if (this.sayBubbleSprite.top - oy < 0) {
                        this.sayBubbleSprite.y = (this.sayBubbleSprite.y - 2 * this.y) * -1;
                    }
                }

                // Pauses at beginning of text for holdTextSeconds length
                if (holdTextSeconds > 0) {
                    holdTextSeconds -= game.eventContext().deltaTime;
                    // If scrolling has reached the end, start back at the beginning
                    if (holdTextSeconds <= 0 && pixelsOffset > 0) {
                        pixelsOffset = 0;
                        holdTextSeconds = maxTextWidth / speed;
                    }
                } else {
                    pixelsOffset += dt * speed;

                    // Pause at end of text for holdTextSeconds length
                    if (pixelsOffset >= maxOffset) {
                        pixelsOffset = maxOffset;
                        holdTextSeconds = maxTextWidth / speed;
                    }
                }
                // If maxOffset is negative it won't scroll
                if (maxOffset < 0) {
                    this.sayBubbleSprite.image.print(text, startX, startY, textColor, font);
                } else {
                    this.sayBubbleSprite.image.print(text, startX - pixelsOffset, startY, textColor, font);
                }

                // Left side padding
                this.sayBubbleSprite.image.fillRect(0, 0, bubblePadding >> 1, font.charHeight + bubblePadding, textBoxColor);
                // Right side padding
                this.sayBubbleSprite.image.fillRect(bubbleWidth - (bubblePadding >> 1), 0, bubblePadding >> 1, font.charHeight + bubblePadding, textBoxColor);
                // Corners removed
                this.sayBubbleSprite.image.setPixel(0, 0, 0);
                this.sayBubbleSprite.image.setPixel(bubbleWidth - 1, 0, 0);
                this.sayBubbleSprite.image.setPixel(0, font.charHeight + bubblePadding - 1, 0);
                this.sayBubbleSprite.image.setPixel(bubbleWidth - 1, font.charHeight + bubblePadding - 1, 0);
            } else {
                // If can't update because of timeOnScreen then destroy the sayBubbleSprite and reset updateSay
                this.sayBubbleSprite.destroy();
                this.updateSay = undefined;
            }
        }
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

        if (this.flags & SpriteFlag.ShowPhysics) {
            const font = image.font5;
            const margin = 2;
            let tx = this.left;
            let ty = this.bottom + margin;
            screen.print(`${this.x >> 0},${this.y >> 0}`, tx, ty, 1, font);
            tx -= font.charWidth;
            if (this.vx || this.vy) {
                ty += font.charHeight + margin;
                screen.print(`v${this.vx >> 0},${this.vy >> 0}`, tx, ty, 1, font);
            }
            if (this.ax || this.ay) {
                ty += font.charHeight + margin;
                screen.print(`a${this.ax >> 0},${this.ay >> 0}`, tx, ty, 1, font);
            }
        }

        // debug info
        if (game.debug) {
            screen.drawRect(Fx.toInt(this._hitbox.left), Fx.toInt(this._hitbox.top), this._hitbox.width, this._hitbox.height, 1);
        }
    }

    __update(camera: scene.Camera, dt: number) {
        if (this.lifespan !== undefined) {
            this.lifespan -= dt * 1000;
            if (this.lifespan <= 0) {
                this.lifespan = undefined;
                this.destroy();
            }
        }
        if ((this.flags & sprites.Flag.AutoDestroy)
            && this.isOutOfScreen(camera)) {
            this.destroy()
        }

        const bounce = this.flags & sprites.Flag.BounceOnWall;
        const tm = game.currentScene().tileMap;
        if (this.flags & sprites.Flag.StayInScreen || (bounce && !tm)) {
            if (this.left < camera.offsetX) {
                this.left = camera.offsetX;
                if (bounce) this.vx = -this.vx;
            }
            else if (this.right > camera.offsetX + screen.width) {
                this.right = camera.offsetX + screen.width;
                if (bounce) this.vx = -this.vx;
            }

            if (this.top < camera.offsetY) {
                this.top = camera.offsetY;
                if (bounce) this.vy = -this.vy;
            }
            else if (this.bottom > camera.offsetY + screen.height) {
                this.bottom = camera.offsetY + screen.height;
                if (bounce) this.vy = -this.vy;
            }
        }

        // Say text
        if (this.updateSay) {
            this.updateSay(dt, camera);
        }
    }

    /**
     * Set a sprite flag
     */
    //% group="Properties"
    //% blockId=spritesetsetflag block="set %sprite(mySprite) %flag %on=toggleOnOff"
    //% flag.defl=SpriteFlag.StayInScreen
    //% help=sprites/sprite/set-flag
    setFlag(flag: SpriteFlag, on: boolean) {
        if (on) this.flags |= flag
        else this.flags = ~(~this.flags | flag);
    }

    /**
     * Check if this sprite overlaps another sprite
     * @param other
     */
    //% group="Overlaps"
    //% blockId=spriteoverlapswith block="%sprite(mySprite) overlaps with %other=variables_get(otherSprite)"
    //% help=sprites/sprite/overlaps-with
    //% weight=90
    overlapsWith(other: Sprite) {
        control.enablePerfCounter("overlapsCPP")
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
     * Check if there is an obstacle in the given direction
     * @param direction
     */
    //% blockId=spritehasobstacle block="is %sprite(mySprite) hitting wall %direction"
    //% blockNamespace="scene" group="Collisions"
    //% help=sprites/sprite/is-hitting-tile
    isHittingTile(direction: CollisionDirection): boolean {
        return this._obstacles && !!this._obstacles[direction];
    }

    /**
     * Get the obstacle sprite in a given direction if any
     * @param direction
     */
    //% blockId=spriteobstacle block="%sprite(mySprite) wall hit on %direction"
    //% blockNamespace="scene" group="Collisions"
    //% help=sprites/sprite/tile-hit-from
    tileHitFrom(direction: CollisionDirection): number {
        return (this._obstacles && this._obstacles[direction]) ? this._obstacles[direction].tileIndex : -1;
    }

    clearObstacles() {
        this._obstacles = undefined;
    }

    registerObstacle(direction: CollisionDirection, other: sprites.Obstacle) {
        if (other == undefined) return;
        if (!this._obstacles)
            this._obstacles = [];
        this._obstacles[direction] = other;

        const handler = (this.collisionHandlers && this.collisionHandlers[direction]) ? this.collisionHandlers[direction][other.tileIndex] : undefined;
        if (handler) handler();
        const scene = game.currentScene();
        scene.collisionHandlers
            .filter(h => h.kind == this.kind() && h.tile == other.tileIndex)
            .forEach(h => h.handler(this));
    }

    /**
     * Run code when the sprite is destroyed
     * @param handler
     */
    //% group="Lifecycle"
    //% weight=9
    onDestroyed(handler: () => void) {
        this.destroyHandler = handler
    }

    /**
     * Destroy the sprite
     */
    //% group="Lifecycle"
    //% weight=10
    //% blockId=spritedestroy block="destroy %sprite(mySprite)"
    //% help=sprites/sprite/destroy
    destroy() {
        if (this.flags & sprites.Flag.Destroyed)
            return
        this.flags |= sprites.Flag.Destroyed
        const scene = game.currentScene();
        // When current sprite is destroyed, destroys sayBubbleSprite if defined
        if (this.sayBubbleSprite) {
            this.sayBubbleSprite.destroy();
        }
        scene.allSprites.removeElement(this);
        if (this.kind() >= 0 && scene.spritesByKind[this.kind()])
            scene.spritesByKind[this.kind()].remove(this);
        scene.physicsEngine.removeSprite(this);
        if (this.destroyHandler)
            this.destroyHandler();
        scene.destroyedHandlers
            .filter(h => h.kind == this.kind())
            .forEach(h => h.handler(this));
    }

    toString() {
        return `${this.id}(${this.x},${this.y})->(${this.vx},${this.vy})`;
    }
}