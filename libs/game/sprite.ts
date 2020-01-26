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
    ShowPhysics = sprites.Flag.ShowPhysics,
    //% block="invisible"
    Invisible = sprites.Flag.Invisible,
    //% block="relative to camera"
    RelativeToCamera = sprites.Flag.RelativeToCamera
}

enum TileDirection {
    //% block="left"
    Left = 0,
    //% block="top"
    Top = 1,
    //% block="right"
    Right = 2,
    //% block="bottom"
    Bottom = 3,
    //% block="center"
    Center = 4
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
//% blockNamespace=sprites color="#3B6FEA" blockGap=8
class Sprite extends sprites.BaseSprite {
    _x: Fx8
    _y: Fx8
    _vx: Fx8
    _vy: Fx8
    _ax: Fx8
    _ay: Fx8

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="x" callInDebugger
    get x(): number {
        return Fx.toInt(this._x) + (this._image.width >> 1)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="x"
    set x(v: number) {
        this.left = v - (this._image.width >> 1)
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="y" callInDebugger
    get y(): number {
        return Fx.toInt(this._y) + (this._image.height >> 1)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="y"
    set y(v: number) {
        this.top = v - (this._image.height >> 1)
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="vx (velocity x)" callInDebugger
    get vx(): number {
        return Fx.toFloat(this._vx)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="vx (velocity x)"
    set vx(v: number) {
        this._vx = Fx8(v)
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="vy (velocity y)" callInDebugger
    get vy(): number {
        return Fx.toFloat(this._vy)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="vy (velocity y)"
    set vy(v: number) {
        this._vy = Fx8(v)
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="ax (acceleration x)" callInDebugger
    get ax(): number {
        return Fx.toFloat(this._ax)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="ax (acceleration x)"
    set ax(v: number) {
        this._ax = Fx8(v)
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="ay (acceleration y)" callInDebugger
    get ay(): number {
        return Fx.toFloat(this._ay)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="ay (acceleration y)"
    set ay(v: number) {
        this._ay = Fx8(v)
    }

    private _data: any;
    /**
     * Custom data
     */
    //%
    get data(): any {
        if (!this._data) this._data = {};
        return this._data;
    }

    set data(value: any) {
        this._data = value;
    }
    _kind: number;

    /**
     * A bitset of layer. Each bit is a layer, default is 1.
     */
    //% group="Physics"
    layer: number;

    _lastX: Fx8;
    _lastY: Fx8;

    _action: number; //Used with animation library

    /**
     * Time to live in milliseconds. The lifespan decreases by 1 on each millisecond
     * and the sprite gets destroyed when it reaches 0.
     */
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="lifespan"
    lifespan: number;
    private _image: Image;
    private _obstacles: sprites.Obstacle[];

    private updateSay: (dt: number, camera: scene.Camera) => void;
    private sayBubbleSprite: Sprite;

    _hitbox: game.Hitbox;
    _overlappers: number[];
    _kindsOverlappedWith: number[];

    flags: number

    private destroyHandler: () => void;

    constructor(img: Image) {
        super(scene.SPRITE_Z);

        this._x = Fx8(screen.width - img.width >> 1);
        this._y = Fx8(screen.height - img.height >> 1);
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
        this._obstacles = [];
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
    //% group="Image"
    //% blockId=spriteimage block="%sprite(mySprite) image"
    //% weight=8
    get image(): Image {
        return this._image;
    }

    /**
     * Sets the image on the sprite
     */
    //% group="Image"
    //% blockId=spritesetimage block="set %sprite(mySprite) image to %img=screen_image_picker"
    //% weight=7 help=sprites/sprite/set-image
    setImage(img: Image) {
        if (!img) return; // don't break the sprite
        this._image = img;
        const newHitBox = game.calculateHitBox(this);

        if (!this._hitbox) {
            this._hitbox = newHitBox;
            return;
        }

        const oMinX = this._hitbox.ox;
        const oMinY = this._hitbox.oy;
        const oMaxX = Fx.add(oMinX, this._hitbox.width);
        const oMaxY = Fx.add(oMinY, this._hitbox.height);

        const nMinX = newHitBox.ox;
        const nMinY = newHitBox.oy;
        const nMaxX = Fx.add(nMinX, newHitBox.width);
        const nMaxY = Fx.add(nMinY, newHitBox.height);

        // total diff in x / y corners between the two hitboxes
        const xDiff = Fx.add(
            Fx.abs(Fx.sub(oMinX, nMinX)),
            Fx.abs(Fx.sub(oMaxX, nMaxX))
        );
        const yDiff = Fx.add(
            Fx.abs(Fx.sub(oMinY, nMinY)),
            Fx.abs(Fx.sub(oMaxY, nMaxY))
        );

        // If it's just a small change to the hitbox on one axis,
        // don't change the dimensions to avoid random clipping
        this._hitbox = newHitBox;
        if (xDiff <= Fx.twoFx8) {
            this._hitbox.ox = oMinX;
            this._hitbox.width = Fx.sub(oMaxX, oMinX);
        }
        if (yDiff <= Fx.twoFx8) {
            this._hitbox.oy = oMinY;
            this._hitbox.height = Fx.sub(oMaxY, oMinY);
        }
    }

    __visible() {
        return !(this.flags & SpriteFlag.Invisible);
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="width"
    get width() {
        return this._image.width
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="height"
    get height() {
        return this._image.height
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="left"
    get left() {
        return Fx.toInt(this._x)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="left"
    set left(value: number) {
        const physics = game.currentScene().physicsEngine;
        physics.moveSprite(
            this,
            Fx.sub(
                Fx8(value),
                this._x
            ),
            Fx.zeroFx8
        );
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="right"
    get right() {
        return this.left + this.width
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="right"
    set right(value: number) {
        this.left = value - this.width
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="top"
    get top() {
        return Fx.toInt(this._y);
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="top"
    set top(value: number) {
        const physics = game.currentScene().physicsEngine;
        physics.moveSprite(
            this,
            Fx.zeroFx8,
            Fx.sub(
                Fx8(value),
                this._y
            )
        );
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="bottom"
    get bottom() {
        return this.top + this.height;
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="bottom"
    set bottom(value: number) {
        this.top = value - this.height;
    }

    // The z field (``get z()`` / ``set z()``) is declared in sprite.d.ts
    // as it is defnied in the superclass

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
    //% kind.shadow=spritekind
    //% weight=80 help=sprites/sprite/set-kind
    setKind(value: number) {
        if (value == undefined || this._kind === value) return;

        const spritesByKind = game.currentScene().spritesByKind;
        if (this._kind >= 0 && spritesByKind[this._kind])
            spritesByKind[this._kind].remove(this);

        if (value >= 0) {
            if (!spritesByKind[value]) spritesByKind[value] = new sprites.SpriteSet();
            spritesByKind[value].add(this);
        }

        const overlapMap = game.currentScene().overlapMap;
        if (!overlapMap[value]) {
            overlapMap[value] = [];
        }

        this._kindsOverlappedWith = overlapMap[value];

        this._kind = value;
    }

    /**
     * Set the sprite position in pixels starting from the top-left corner of the screen.
     * @param x horizontal position in pixels
     * @param y vertical position in pixels
     */
    //% group="Physics"
    //% weight=100
    //% blockId=spritesetpos block="set %sprite(mySprite) position to x %x y %y"
    //% help=sprites/sprite/set-position
    //% x.shadow="positionPicker" y.shadow="positionPicker"
    setPosition(x: number, y: number): void {
        const physics = game.currentScene().physicsEngine;
        physics.moveSprite(
            this,
            Fx8(x - this.x),
            Fx8(y - this.y)
        );
    }

    /**
     * Sets the sprite velocity in pixel / sec
     * @param vx
     * @param vy
     */
    //% group="Physics"
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
    //% group="Effects"
    //% weight=60
    //% blockId=spritesay block="%sprite(mySprite) say %text||for %millis ms"
    //% millis.shadow=timePicker
    //% text.shadow=text
    //% inlineInputMode=inline
    //% help=sprites/sprite/say
    say(text: any, timeOnScreen?: number, textColor = 15, textBoxColor = 1) {
        // clear say
        if (!text) {
            this.updateSay = undefined;
            if (this.sayBubbleSprite) {
                this.sayBubbleSprite.destroy();
                this.sayBubbleSprite = undefined;
            }
            return;
        }
        const textToDisplay = console.inspect(text).split("\n").join(" ");

        // same text, color, time, etc...
        const SAYKEY = "__saykey";
        const key = JSON.stringify({
            text: textToDisplay,
            textColor: textColor,
            textBoxColor: textBoxColor
        })
        if (timeOnScreen === undefined
            && this.sayBubbleSprite
            && this.sayBubbleSprite.data[SAYKEY] == key) {
            // do nothing!
            return;
        }

        let pixelsOffset = 0;
        let holdTextSeconds = 1.5;
        let bubblePadding = 4;
        let maxTextWidth = 100;
        let font = image.getFontForText(textToDisplay);
        let startX = 2;
        let startY = 2;
        let bubbleWidth = textToDisplay.length * font.charWidth + bubblePadding;
        let maxOffset = textToDisplay.length * font.charWidth - maxTextWidth;
        let bubbleOffset: number = Fx.toInt(this._hitbox.oy);
        let needsRedraw = true;

        // sets the defaut scroll speed in pixels per second
        let speed = 45;
        const currentScene = game.currentScene();

        // Calculates the speed of the scroll if scrolling is needed and a time is specified
        if (timeOnScreen && maxOffset > 0) {
            speed = (maxOffset + (2 * maxTextWidth)) / (timeOnScreen / 1000);
            speed = Math.max(speed, 45);
            holdTextSeconds = maxTextWidth / speed;
            holdTextSeconds = Math.min(holdTextSeconds, 1.5);
        }

        if (timeOnScreen) {
            timeOnScreen = timeOnScreen + currentScene.millis();
        }

        if (bubbleWidth > maxTextWidth + bubblePadding) {
            bubbleWidth = maxTextWidth + bubblePadding;
        } else {
            maxOffset = -1;
        }

        // reuse previous sprite if possible
        const imgh = font.charHeight + bubblePadding;
        if (!this.sayBubbleSprite
            || this.sayBubbleSprite.image.width != bubbleWidth
            || this.sayBubbleSprite.image.height != imgh) {
            const sayImg = image.create(bubbleWidth, imgh);
            if (this.sayBubbleSprite) // sprite with same image size, we can reuse it
                this.sayBubbleSprite.setImage(sayImg);
            else { // needs a new sprite
                this.sayBubbleSprite = sprites.create(sayImg, -1);
                this.sayBubbleSprite.setFlag(SpriteFlag.Ghost, true);
                this.sayBubbleSprite.setFlag(SpriteFlag.RelativeToCamera, !!(this.flags & sprites.Flag.RelativeToCamera))
            }
        }
        this.sayBubbleSprite.data[SAYKEY] = key;
        this.updateSay = (dt, camera) => {
            // Update box stuff as long as timeOnScreen doesn't exist or it can still be on the screen
            if (!timeOnScreen || timeOnScreen > currentScene.millis()) {
                // move bubble
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
                        needsRedraw = true;
                    }
                } else {
                    pixelsOffset += dt * speed;
                    needsRedraw = true;

                    // Pause at end of text for holdTextSeconds length
                    if (pixelsOffset >= maxOffset) {
                        pixelsOffset = maxOffset;
                        holdTextSeconds = maxTextWidth / speed;
                    }
                }

                // The minus 2 is how much transparent padding there is under the sayBubbleSprite
                this.sayBubbleSprite.y = this.top + bubbleOffset - ((font.charHeight + bubblePadding) >> 1) - 2;
                this.sayBubbleSprite.x = this.x;

                if (needsRedraw) {
                    needsRedraw = false;
                    this.sayBubbleSprite.image.fill(textBoxColor);
                    // If maxOffset is negative it won't scroll
                    if (maxOffset < 0) {
                        this.sayBubbleSprite.image.print(textToDisplay, startX, startY, textColor, font);

                    } else {
                        this.sayBubbleSprite.image.print(textToDisplay, startX - pixelsOffset, startY, textColor, font);
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
                }
            } else {
                // If can't update because of timeOnScreen then destroy the sayBubbleSprite and reset updateSay
                this.updateSay = undefined;
                this.sayBubbleSprite.destroy();
                this.sayBubbleSprite = undefined;
            }
        }
        this.updateSay(0, currentScene.camera);
    }

    /**
     * Start an effect on this sprite
     * @param effect the type of effect to create
     */
    //% group="Effects"
    //% weight=90
    //% blockId=startEffectOnSprite block="%sprite(mySprite) start %effect effect || for %duration=timePicker|ms"
    //% help=sprites/sprite/start-effect
    startEffect(effect: effects.ParticleEffect, duration?: number) {
        effect.start(this, duration, null, !!(this.flags & sprites.Flag.RelativeToCamera));
    }

    /**
     * Indicates if the sprite is outside the screen
     */
    //%
    isOutOfScreen(camera: scene.Camera): boolean {
        const ox = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetX;
        const oy = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetY;
        return this.right - ox < 0 || this.bottom - oy < 0 || this.left - ox > screen.width || this.top - oy > screen.height;
    }

    __drawCore(camera: scene.Camera) {
        if (this.isOutOfScreen(camera)) return;

        const ox = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetX;
        const oy = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetY;

        const l = this.left - ox;
        const t = this.top - oy;

        screen.drawTransparentImage(this._image, l, t)

        if (this.flags & SpriteFlag.ShowPhysics) {
            const font = image.font5;
            const margin = 2;
            let tx = l;
            let ty = t + this.height + margin;
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
            screen.drawRect(
                Fx.toInt(this._hitbox.left) - ox,
                Fx.toInt(this._hitbox.top) - oy,
                Fx.toInt(this._hitbox.width),
                Fx.toInt(this._hitbox.height),
                1
            );
        }
    }

    __update(camera: scene.Camera, dt: number) {
        if (this.lifespan !== undefined) {
            this.lifespan -= dt * 1000;
            if (this.lifespan <= 0) {
                this.lifespan = undefined;
                this._destroyCore();
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
    //% group="Effects"
    //% weight=30
    //% blockId=spritesetsetflag block="set %sprite(mySprite) %flag %on=toggleOnOff"
    //% flag.defl=SpriteFlag.StayInScreen
    //% help=sprites/sprite/set-flag
    setFlag(flag: SpriteFlag, on: boolean) {
        if (on) this.flags |= flag
        else this.flags = ~(~this.flags | flag);

        if (flag === SpriteFlag.RelativeToCamera && this.sayBubbleSprite) {
            this.sayBubbleSprite.setFlag(SpriteFlag.RelativeToCamera, on);
        }
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
        if (this.flags & (sprites.Flag.Ghost | sprites.Flag.RelativeToCamera))
            return false
        if (other.flags & (sprites.Flag.Ghost | sprites.Flag.RelativeToCamera))
            return false
        return other._image.overlapsWith(this._image, this.left - other.left, this.top - other.top)
    }

    /**
     * Check if there is an obstacle in the given direction
     * @param direction
     */
    //% blockId=spritehasobstacle block="is %sprite(mySprite) hitting wall %direction"
    //% blockNamespace="scene" group="Collisions" blockGap=8
    //% help=sprites/sprite/is-hitting-tile
    isHittingTile(direction: CollisionDirection): boolean {
        return this._obstacles && !!this._obstacles[direction];
    }

    /**
     * Get the tile kind in a given direction if any
     * @param direction
     */
    //% blockId=spritetileat block="tile to $direction of $this(mySprite) is $tile"
    //% tile.shadow=tileset_tile_picker
    //% blockNamespace="scene" group="Collisions" blockGap=8
    //% help=sprites/sprite/tile-kind-at
    tileKindAt(direction: TileDirection, tile: Image): boolean {
        const tilemap = game.currentScene().tileMap;
        let x = this.x >> tilemap.scale;
        let y = this.y >> tilemap.scale;
        switch (direction) {
            case TileDirection.Top:
                y = y - 1;
                break;
            case TileDirection.Bottom:
                y = y + 1;
                break;
            case TileDirection.Left:
                x = x - 1;
                break;
            case TileDirection.Right:
                x = x + 1;
                break;
            case TileDirection.Center:
            default:
                break;
        }
        return tiles.getTileImage(tilemap.getTile(x, y)).equals(tile);
    }

    /**
     * Get the obstacle sprite in a given direction if any
     * @param direction
     */
    //% blockId=spriteobstacle block="%sprite(mySprite) wall hit on %direction"
    //% blockNamespace="scene" group="Collisions"
    //% help=sprites/sprite/tile-hit-from
    //% deprecated=1
    tileHitFrom(direction: CollisionDirection): number {
        return (this._obstacles && this._obstacles[direction]) ? this._obstacles[direction].tileIndex : -1;
    }

    clearObstacles() {
        this._obstacles = [];
    }

    registerObstacle(direction: CollisionDirection, other: sprites.Obstacle) {
        this._obstacles[direction] = other;
        const collisionHandlers = game.currentScene().collisionHandlers[other.tileIndex];
        const wallCollisionHandlers = game.currentScene().wallCollisionHandlers;

        if (collisionHandlers) {
            collisionHandlers
                .filter(h => h.kind == this.kind())
                .forEach(h => h.handler(this));
        }
        if (wallCollisionHandlers) {
            wallCollisionHandlers
                .filter(h => h.kind == this.kind())
                .forEach(h => h.handler(this));
        }
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
    //% group="Effects"
    //% weight=80
    //% blockId=spritedestroy block="destroy %sprite(mySprite) || with %effect effect for %duration ms"
    //% duration.shadow=timePicker
    //% expandableArgumentMode="toggle"
    //% help=sprites/sprite/destroy
    destroy(effect?: effects.ParticleEffect, duration?: number) {
        if (this.flags & sprites.Flag.Destroyed)
            return;
        this.flags |= sprites.Flag.Destroyed;

        if (effect)
            effect.destroy(this, duration);
        else
            this._destroyCore();
    }

    _destroyCore() {
        this.flags |= sprites.Flag.Destroyed;
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

    /**
     * Make this sprite follow the target sprite.
     *
     * @param target the sprite this one should follow
     * @param speed the rate at which this sprite should move, eg: 100
     * @param turnRate how quickly the sprite should turn while following.
     *      The default (400) will cause the sprite to reach max speed after approximately 125 ms when standing still,
     *      and turn around 180 degrees when at max speed after approximately 250 ms.
     */
    //% group="Physics" weight=10
    //% blockId=spriteFollowOtherSprite
    //% block="set %sprite(myEnemy) follow %target=variables_get(mySprite) || with speed %speed"
    follow(target: Sprite, speed = 100, turnRate = 400) {
        if (target === this) return;

        const sc = game.currentScene();
        if (!sc.followingSprites) {
            sc.followingSprites = [];
            let lastTime = game.runtime();

            sc.eventContext.registerFrameHandler(scene.FOLLOW_SPRITE_PRIORITY, () => {
                const currTime = game.runtime();
                const timeDiff = (currTime - lastTime) / 1000;
                let destroyedSprites = false;

                sc.followingSprites.forEach(fs => {
                    const { target, self, turnRate, rate } = fs;
                    // one of the involved sprites has been destroyed,
                    // so exit and remove that in the cleanup step
                    if ((self.flags | target.flags) & sprites.Flag.Destroyed) {
                        destroyedSprites = true;
                        return;
                    }

                    const dx = target.x - self.x;
                    const dy = target.y - self.y;

                    // already right on top of target; stop moving
                    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
                        self.vx = 0;
                        self.vy = 0;
                        return;
                    }

                    const maxMomentumDiff = timeDiff * turnRate * (speed / 50);
                    const angleToTarget = Math.atan2(dy, dx);

                    // to move directly towards target, use this...
                    const targetTrajectoryVx = Math.cos(angleToTarget) * rate;
                    const targetTrajectoryVy = Math.sin(angleToTarget) * rate;

                    // ... but to keep momentum, calculate the diff in velocities and maintain some of the velocity
                    const diffVx = targetTrajectoryVx - self.vx;
                    const diffVy = targetTrajectoryVy - self.vy;

                    self.vx += Math.clamp(-maxMomentumDiff, maxMomentumDiff, diffVx);
                    self.vy += Math.clamp(-maxMomentumDiff, maxMomentumDiff, diffVy);
                });

                lastTime = currTime;

                // cleanup: remove followers where one has been destroyed
                if (destroyedSprites) {
                    sc.followingSprites = sc.followingSprites
                        .filter(fs => !((fs.self.flags | fs.target.flags) & sprites.Flag.Destroyed));
                }
            });
        }

        const fs = sc.followingSprites.find(fs => fs.self.id == this.id);

        if (!target || !speed) {
            if (fs) {
                sc.followingSprites.removeElement(fs);
            }
        } else if (!fs) {
            sc.followingSprites.push(new sprites.FollowingSprite(
                this,
                target,
                speed,
                turnRate
            ));
        } else {
            fs.target = target;
            fs.rate = speed;
            fs.turnRate = turnRate;
        }
    }

    toString() {
        return `${this.id}(${this.x},${this.y})->(${this.vx},${this.vy})`;
    }
}
