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
 * A sprite on the screen
 **/
//% blockNamespace=sprites color="#4B7BEC" blockGap=8
class Sprite implements SpriteLike {
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="x (horizontal position)"
    x: number
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="y (vertical position)"
    y: number
    private _z: number
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="vx (velocity x)"
    vx: number
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="vy (velocity y)"
    vy: number
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="ax (acceleration x)"
    ax: number
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="ay (acceleration y)"
    ay: number

    _type: number;

    /**
     * A bitset of layer. Each bit is a layer, default is 1.
     */
    //% group="Properties"
    layer: number;

    _lastX: number;
    _lastY: number;

    _action: number; //Used with animation library

    /**
     * Time to live in game ticks. The lifespan decreases by 1 on each game update
     * and the sprite gets destroyed when it reaches 0.
     */
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="lifespan"
    lifespan: number;
    private _image: Image;
    private _obstacles: sprites.Obstacle[];

    private updateSay: (dt: number) => void;
    private sayBubbleSprite: Sprite;

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
        this.type = -1; // not a member of any type by default
        this.layer = 1; // by default, in layer 1
        this.lifespan = undefined;
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
    //% weight=7
    setImage(img: Image) {
        if (!img) return; // don't break the sprite

        // Identify old upper left corner
        let oMinX = img.width;
        let oMinY = img.height;
        let oMaxX = 0;
        let oMaxY = 0;

        for (let i = 0; this._hitboxes && i < this._hitboxes.length; ++i) {
            let box = this._hitboxes[i];
            oMinX = Math.min(oMinX, box.ox);
            oMinY = Math.min(oMinY, box.oy);
            oMaxX = Math.max(oMaxX, box.ox + box.width - 1);
            oMaxY = Math.max(oMaxY, box.oy + box.height - 1);
        }

        this._image = img;
        this._hitboxes = game.calculateHitBoxes(this);

        // Identify new upper left corner
        let nMinX = img.width;
        let nMinY = img.height;
        let nMaxX = 0;
        let nMaxY = 0;

        for (let i = 0; i < this._hitboxes.length; ++i) {
            let box = this._hitboxes[i];
            nMinX = Math.min(nMinX, box.ox);
            nMinY = Math.min(nMinY, box.oy);
            nMaxX = Math.max(nMaxX, box.ox + box.width - 1);
            nMaxY = Math.max(nMaxY, box.oy + box.height - 1);
        }

        const minXDiff = oMinX - nMinX;
        const minYDiff = oMinY - nMinY;
        const maxXDiff = oMaxX - nMaxX;
        const maxYDiff = oMaxY - nMaxY;

        const scene = game.currentScene();
        const tmap = scene.tileMap;

        if (scene.tileMap) {
            if (minXDiff > 0 || minYDiff > 0)
                scene.physicsEngine.moveSprite(this, scene.tileMap, minXDiff, minYDiff);
            if (maxXDiff < 0 || minYDiff > 0)
                scene.physicsEngine.moveSprite(this, scene.tileMap, maxXDiff, minYDiff);
            if (minXDiff > 0 || maxYDiff < 0) 
                scene.physicsEngine.moveSprite(this, scene.tileMap, minXDiff, maxYDiff);
            if (maxXDiff < 0 || maxYDiff < 0)
                scene.physicsEngine.moveSprite(this, scene.tileMap, maxXDiff, maxYDiff);
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
        return this.x - (this.width >> 1)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="left"
    set left(value: number) {
        this.x = value + (this.width >> 1);
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="right"
    get right() {
        return this.left + this.width
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="right"
    set right(value: number) {
        this.x = value - (this.width >> 1);
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine
    get top() {
        return this.y - (this.height >> 1)
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine
    set top(value: number) {
        this.y = value + (this.height >> 1);
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="bottom"
    get bottom() {
        return this.top + this.height
    }
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="bottom"
    set bottom(value: number) {
        this.y = value - (this.height >> 1);
    }
    /**
     * The type of sprite
     */
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="kind"
    get type() {
        return this._type;
    }
    /**
     * The type of sprite
     */
    //% group="Properties" blockSetVariable="mySprite"
    //% blockCombine block="kind"
    set type(value: number) {
        if (value == undefined || this._type === value) return;

        const spritesByKind = game.currentScene().spritesByKind;
        if (this._type >= 0 && spritesByKind[this._type])
            spritesByKind[this._type].removeElement(this);

        if (value >= 0) {
            if (!spritesByKind[value]) spritesByKind[value] = [];
            spritesByKind[value].push(this);
        }

        this._type = value;
    }

    /**
     * Sets the sprite position
     * @param x horizontal position
     * @param y vertical position
     */
    //% group="Properties"
    //% weight=100
    //% blockId=spritesetpos block="set %sprite(mySprite) position to x %x y %y"
    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
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

        if (timeOnScreen) {
            timeOnScreen = timeOnScreen + control.millis();
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
        let bubbleOffset: number;
        if (!this._hitboxes || this._hitboxes.length == 0) {
            bubbleOffset = 0;
        } else {
            bubbleOffset = this._hitboxes[0].top;
            for (let i = 0; i < this._hitboxes.length; i++) {
                bubbleOffset = Math.min(bubbleOffset, this._hitboxes[i].top);
            }

            // Gets the length from sprites location to its highest hitbox
            bubbleOffset = this.y - bubbleOffset;
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
        this.updateSay = dt => {
            // Update box stuff as long as timeOnScreen doesn't exist or it can still be on the screen
            if (!timeOnScreen || timeOnScreen > control.millis()) {
                this.sayBubbleSprite.image.fill(textBoxColor);
                // The minus 2 is how much transparent padding there is under the sayBubbleSprite
                this.sayBubbleSprite.y = this.y - bubbleOffset - ((font.charHeight + bubblePadding) >> 1) - 2;
                this.sayBubbleSprite.x = this.x;
                // Pauses at beginning of text for holdTextSeconds length
                if (holdTextSeconds > 0) {
                    holdTextSeconds -= game.eventContext().deltaTime;
                    if (holdTextSeconds <= 0 && pixelsOffset > 0) {
                        pixelsOffset = 0;
                        holdTextSeconds = 1.5;
                    }
                } else {
                    pixelsOffset += dt * 45;

                    // Pause at end of text for holdTextSeconds length
                    if (pixelsOffset >= maxOffset) {
                        pixelsOffset = maxOffset;
                        holdTextSeconds = 1.5;
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
        const font = image.font8;
        screen.drawTransparentImage(this._image, l, t)

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
        // Say text
        if (this.updateSay) {
            this.updateSay(dt);
        }
    }

    /**
     * Sets the sprite as a ghost (which does not interact with physics)
     */
    //% group="Properties"
    //% blockId=spritesetsetflag block="set %sprite(mySprite) %flag %on=toggleOnOff"
    //% flag.defl=SpriteFlag.StayInScreen
    setFlag(flag: SpriteFlag, on: boolean) {
        if (on) this.flags |= flag
        else this.flags = ~(~this.flags | flag);
    }

    /**
     * Tests if a sprite overlaps with another
     * @param other
     */
    //% group="Overlaps"
    //% blockId=spriteoverlapswith block="%sprite(mySprite) overlaps with %other=variables_get(otherSprite)"
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
    //% blockId=spritehasobstacle block="is %sprite(mySprite) hitting wall %direction"
    //% blockNamespace="scene" group="Collisions"
    isHittingTile(direction: CollisionDirection): boolean {
        return this._obstacles && !!this._obstacles[direction];
    }

    /**
     * Gets the obstacle sprite in a given direction if any
     * @param direction
     */
    //% blockId=spriteobstacle block="%sprite(mySprite) wall hit on %direction"
    //% blockNamespace="scene" group="Collisions"
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
    //% blockId=spritedestroy block="destroy %sprite(mySprite)"
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
        if (this.type >= 0 && scene.spritesByKind[this.type])
            scene.spritesByKind[this.type].removeElement(this);
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