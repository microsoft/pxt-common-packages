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
    RelativeToCamera = sprites.Flag.RelativeToCamera,
    //% block="ghost through sprites"
    GhostThroughSprites = sprites.Flag.GhostThroughSprites,
    //% block="ghost through tiles"
    GhostThroughTiles = sprites.Flag.GhostThroughTiles,
    //% block="ghost through walls"
    GhostThroughWalls = sprites.Flag.GhostThroughWalls,
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

enum ScaleDirection {
    //% block="vertically"
    Vertically = 0x01,
    //% block="horizontally"
    Horizontally = 0x02,
    //% block="uniformly"
    Uniformly = Vertically | Horizontally,
}

enum ScaleAnchor {
    //% block="middle"
    Middle = 0,
    //% block="top"
    Top = 0x01,
    //% block="left"
    Left = 0x02,
    //% block="right"
    Right = 0x04,
    //% block="bottom"
    Bottom = 0x08,
    //% block="top left"
    TopLeft = Top | Left,
    //% block="top right"
    TopRight = Top | Right,
    //% block="bottom left"
    BottomLeft = Bottom | Left,
    //% block="bottom right"
    BottomRight = Bottom | Right,
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
    _fx: Fx8 // friction
    _fy: Fx8 // friction
    _sx: Fx8 // scale
    _sy: Fx8 // scale
    _width: Fx8 // scaled width
    _height: Fx8 // scaled height

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="x" callInDebugger
    get x(): number {
        return Fx.toFloat(this._x) + (this.width / 2)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="x"
    set x(v: number) {
        this.left = v - (this.width / 2)
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="y" callInDebugger
    get y(): number {
        return Fx.toFloat(this._y) + (this.height / 2)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="y"
    set y(v: number) {
        this.top = v - (this.height / 2)
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

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="fx (friction x)" callInDebugger
    get fx(): number {
        return Fx.toFloat(this._fx)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="fx (friction x)"
    set fx(v: number) {
        this._fx = Fx8(Math.max(0, v))
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="fy (friction y)" callInDebugger
    get fy(): number {
        return Fx.toFloat(this._fy)
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="fy (friction y)"
    set fy(v: number) {
        this._fy = Fx8(Math.max(0, v))
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="sx (scale x)" callInDebugger
    get sx(): number {
        return Fx.toFloat(this._sx);
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="sx (scale x)"
    set sx(v: number) {
        const x = this.x;
        this._sx = Fx8(Math.max(0, v));
        this.recalcSize();
        this.left = x - this.width / 2;
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="sy (scale y)" callInDebugger
    get sy(): number {
        return Fx.toFloat(this._sy);
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="sy (scale y)"
    set sy(v: number) {
        const y = this.y;
        this._sy = Fx8(Math.max(0, v));
        this.recalcSize();
        this.top = y - this.height / 2;
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

    private sayEndTime: number;
    private sayRenderer: sprites.BaseSpriteSayRenderer;

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
        this.fx = 0
        this.fy = 0
        this._sx = Fx.oneFx8;
        this._sy = Fx.oneFx8;
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
        buf.setNumber(NumberFormat.Int16LE, k, Fx.toInt(this._sx)); k += 2;
        buf.setNumber(NumberFormat.Int16LE, k, Fx.toInt(this._sy)); k += 2;
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
        this.recalcSize();
    }

    calcDimensionalHash() {
        return Fx.mul(Fx.mul(this._width, this._height), Fx8(this._image.revision()));
    }

    resetHitbox() {
        this._hitbox = null;
        this.setHitbox();
    }

    setHitbox() {
        const newHitBox = game.calculateHitBox(this);

        if (!this._hitbox || this._hitbox.isValid()) {
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

    isStatic() {
        return this._image.isStatic();
    }

    __visible() {
        return !(this.flags & SpriteFlag.Invisible);
    }

    private recalcSize(): void {
        this._width = Fx8(this._image.width * this.sx);
        this._height = Fx8(this._image.height * this.sy);
        this.resetHitbox();
    }

    private isScaled(): boolean {
        return this._sx !== Fx.oneFx8 || this._sy !== Fx.oneFx8;
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="width" callInDebugger
    get width() {
        return Fx.toInt(this._width);
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="height" callInDebugger
    get height() {
        return Fx.toInt(this._height);
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="left" callInDebugger
    get left() {
        return Fx.toFloat(this._x)
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
    //% blockCombine block="right" callInDebugger
    get right() {
        return this.left + this.width
    }
    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="right"
    set right(value: number) {
        this.left = value - this.width
    }

    //% group="Physics" blockSetVariable="mySprite"
    //% blockCombine block="top" callInDebugger
    get top() {
        return Fx.toFloat(this._y);
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
    //% blockCombine block="bottom" callInDebugger
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
    //% help=sprites/sprite/set-velocity
    //% vx.shadow=spriteSpeedPicker
    //% vy.shadow=spriteSpeedPicker
    setVelocity(vx: number, vy: number): void {
        this.vx = vx;
        this.vy = vy;
    }

    /**
     * Deprecated! Use sayText instead.
     *
     * Display a speech bubble with the text, for the given time.
     * @param text the text to say, eg: ":)"
     * @param time time to keep text on
     */
    //% group="Effects"
    //% weight=60
    //% blockId=spritesay block="%sprite(mySprite) say %text||for %millis ms"
    //% millis.shadow=timePicker
    //% text.shadow=text
    //% inlineInputMode=inline
    //% deprecated=true
    //% help=sprites/sprite/say
    say(text: any, timeOnScreen?: number, textColor = 15, textBoxColor = 1) {
        if (text === null || text === undefined || text === "") {
            if (this.sayRenderer) this.sayRenderer.destroy();
            this.sayRenderer = undefined;
            return;
        }

        if (this.sayRenderer && this.sayRenderer instanceof sprites.LegacySpriteSayRenderer &&
            this.sayRenderer.text === text && this.sayRenderer.bgColor === textBoxColor &&
            this.sayRenderer.fgColor === textColor && timeOnScreen === undefined && this.sayEndTime === undefined) {
                return;
        }

        if (timeOnScreen >= 0) this.sayEndTime = control.millis() + timeOnScreen;

        if (this.sayRenderer) this.sayRenderer.destroy();
        this.sayRenderer = undefined;
        text = console.inspect(text);

        this.sayRenderer = new sprites.LegacySpriteSayRenderer(text, timeOnScreen, this, textColor, textBoxColor);
    }

    /**
     * Display a speech bubble with the text, for the given time
     * @param text the text to say, eg: ":)"
     * @param time time to keep text on
     * @param animated whether to print the text character by character or not
     */
    //% group="Effects"
    //% weight=60
    //% blockId=spritesaytext block="$this say $text||for $timeOnScreen ms with animation $animated"
    //% timeOnScreen.shadow=timePicker
    //% text.shadow=text
    //% this.shadow=variables_get
    //% this.defl=mySprite
    //% inlineInputMode=inline
    //% help=sprites/sprite/say
    //% expandableArgumentMode=toggle
    sayText(text: any, timeOnScreen?: number, animated = false, textColor = 15, textBoxColor = 1) {
        if (text === null || text === undefined || text === "") {
            if (this.sayRenderer) this.sayRenderer.destroy();
            this.sayRenderer = undefined;
            return;
        }

        if (this.sayRenderer) this.sayRenderer.destroy();
        this.sayRenderer = undefined;

        if (timeOnScreen >= 0) this.sayEndTime = control.millis() + timeOnScreen;

        text = console.inspect(text);

        this.sayRenderer = new sprites.SpriteSayRenderer(text, textColor, textBoxColor, animated, timeOnScreen);
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
        if (this.sayRenderer) {
            if (this.sayEndTime !== undefined) {
                if (control.millis() < this.sayEndTime) {
                    this.sayRenderer.draw(screen, camera, this);
                }
                else {
                    this.sayRenderer.destroy();
                    this.sayRenderer = undefined;
                    this.sayEndTime = undefined;
                }
            }
            else {
                this.sayRenderer.draw(screen, camera, this)
            }
        }

        if (this.isOutOfScreen(camera)) return;

        const ox = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetX;
        const oy = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetY;

        const l = Math.floor(this.left - ox);
        const t = Math.floor(this.top - oy);

        if (!this.isScaled())
            screen.drawTransparentImage(this._image, l, t);
        else
            screen.blit(
                // dst rect in screen
                l, t,
                this.width,
                this.height,
                // src rect in sprite image
                this._image,
                0, 0,
                this._image.width, this._image.height,
                true, false);

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

        if (this.sayRenderer) this.sayRenderer.update(dt, camera, this);
    }

    /**
     * Set whether a sprite should be constrained within the screen (on) or not (off)
     */
    //% group="Effects"
    //% weight=30
    //% blockId=spritesetsetstayinscreen block="set %sprite(mySprite) stay in screen %on=toggleOnOff"
    //% on.defl=true
    //% help=sprites/sprite/set-stay-in-screen
    setStayInScreen(on: boolean) {
        this.setFlag(SpriteFlag.StayInScreen, on);
    }

    /**
     * Set whether a sprite should bounce when it hits a wall (on) or not (off)
     */
    //% group="Effects"
    //% weight=25
    //% blockId=spritesetsetbounceonwall block="set %sprite(mySprite) bounce on wall %on=toggleOnOff"
    //% on.defl=true
    //% help=sprites/sprite/set-bounce-on-wall
    setBounceOnWall(on: boolean) {
        this.setFlag(SpriteFlag.BounceOnWall, on);
    }

    /**
     * Set a sprite flag
     */
    //% group="Effects"
    //% weight=10
    //% blockId=spritesetsetflag block="set %sprite(mySprite) %flag %on=toggleOnOff"
    //% flag.defl=SpriteFlag.AutoDestroy
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
        if (this.flags & SPRITE_NO_SPRITE_OVERLAPS)
            return false
        if (other.flags & SPRITE_NO_SPRITE_OVERLAPS)
            return false
        if (!other._hitbox.overlapsWith(this._hitbox))
            return false;
        if (!this.isScaled() && !other.isScaled()) {
            return other._image.overlapsWith(
                this._image,
                this.left - other.left,
                this.top - other.top)
        } else {
            if (this.sx == 0 || this.sy == 0 || other.sx == 0 || other.sy == 0) return false;

            let A: Sprite;
            let B: Sprite;

            // Render larger-scaled sprite onto smaller-scaled one so that we don't
            // skip over source pixels in the check.

            // A is the smaller-scaled sprite
            if (this.sx * this.sy < other.sx * other.sy) {
                A = this;
                B = other;
            } else {
                A = other;
                B = this;
            }

            // Render B onto A
            return helpers.imageBlit(
                A.image,
                // Dst rect in A
                (B.left - A.left) / A.sx,
                (B.top - A.top) / A.sy,
                B.width / A.sx,
                B.height / A.sy,
                B.image,
                // Src rect in B
                0, 0,
                B.image.width,
                B.image.height,
                true, true);
        }
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

    registerObstacle(direction: CollisionDirection, other: sprites.Obstacle, tm?: tiles.TileMap) {
        this._obstacles[direction] = other;
        const collisionHandlers = game.currentScene().collisionHandlers[other.tileIndex];
        const wallCollisionHandlers = game.currentScene().wallCollisionHandlers;

        if (collisionHandlers) {
            collisionHandlers
                .filter(h => h.kind == this.kind())
                .forEach(h => h.handler(this));
        }
        if (wallCollisionHandlers) {
            tm = tm || game.currentScene().tileMap;
            const wallHandlersToRun = wallCollisionHandlers
                .filter(h => h.spriteKind == this.kind());
            if (wallHandlersToRun.length) {
                const asTileLocation = tm.getTile(other.left >> tm.scale, other.top >> tm.scale);
                wallHandlersToRun
                    .forEach(h => h.handler(this, asTileLocation));
            }
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
                        self.vx = 0;
                        self.vy = 0;
                        destroyedSprites = true;
                        return;
                    }

                    const dx = target.x - self.x;
                    const dy = target.y - self.y;

                    // already right on top of target; stop moving
                    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
                        // snap to target location so it sits 'right on top' of sprite.
                        self.x = target.x;
                        self.y = target.y;

                        self.vx = 0;
                        self.vy = 0;
                        return;
                    }

                    const maxMomentumDiff = timeDiff * turnRate * (rate / 50);
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
                this.vx = 0;
                this.vy = 0;
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

    private setScaleCore(sx?: number, sy?: number, anchor?: ScaleAnchor, proportional?: boolean): void {
        anchor = anchor || ScaleAnchor.Middle;

        const hasSx = typeof sx === 'number';
        const hasSy = typeof sy === 'number';

        const oldW = this.width;
        const oldH = this.height;
        const oldSx = this.sx;
        const oldSy = this.sy;

        if (hasSx) {
            this.sx = sx;
            if (!hasSy && proportional) {
                const ratio = sx / oldSx;
                this.sy *= ratio;
            }
        }
        if (hasSy) {
            this.sy = sy;
            if (!hasSx && proportional) {
                const ratio = sy / oldSy;
                this.sx *= ratio;
            }
        }

        if (anchor & (ScaleAnchor.Left | ScaleAnchor.Right)) {
            const newW = this.width;
            const diff = newW - oldW;
            const diffOver2 = (diff / 2) | 0;
            if (anchor & ScaleAnchor.Left) { this.x += diffOver2; }
            if (anchor & ScaleAnchor.Right) { this.x -= diffOver2; }
        }
        if (anchor & (ScaleAnchor.Top | ScaleAnchor.Bottom)) {
            const newH = this.height;
            const diff = newH - oldH;
            const diffOver2 = (diff / 2) | 0;
            if (anchor & ScaleAnchor.Top) { this.y += diffOver2; }
            if (anchor & ScaleAnchor.Bottom) { this.y -= diffOver2; }
        }
    }

    //% blockId=sprite_get_scale
    //% block="%sprite(mySprite) scale"
    //% help=sprites/sprite/get-scale
    //% group="Scale" weight=100
    getScale(): number {
        return Math.max(this.sx, this.sy);
    }

    //% blockId=sprite_set_scale
    //% block="set %sprite(mySprite) scale to $value || $direction anchor $anchor"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% value.defl=1
    //% direction.defl=ScaleDirection.Uniformly
    //% anchor.defl=ScaleAnchor.Middle
    //% help=sprites/sprite/set-scale
    //% group="Scale" weight=90
    setScale(value: number, direction?: ScaleDirection, anchor?: ScaleAnchor): void {
        direction = direction || ScaleDirection.Uniformly;
        anchor = anchor || ScaleAnchor.Middle;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) sx = value;
        if (direction & ScaleDirection.Vertically) sy = value;

        this.setScaleCore(sx, sy, anchor);
    }

    //% blockId=sprite_grow_by_percent
    //% block="grow %sprite(mySprite) by $amount percent || $direction anchor $anchor"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% amount.defl=10
    //% direction.defl=ScaleDirection.Uniformly
    //% anchor.defl=ScaleAnchor.Middle
    //% help=sprites/sprite/grow-by-amount
    //% group="Scale" weight=80
    growByPercent(amount: number, direction?: ScaleDirection, anchor?: ScaleAnchor): void {
        amount /= 100;
        direction = direction || ScaleDirection.Uniformly;
        anchor = anchor || ScaleAnchor.Middle;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) sx = this.sx + amount;
        if (direction & ScaleDirection.Vertically) sy = this.sy + amount;

        this.setScaleCore(sx, sy, anchor);
    }

    //% blockId=sprite_shrink_by_percent
    //% block="shrink %sprite(mySprite) by $amount percent || $direction anchor $anchor"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% amount.defl=10
    //% direction.defl=ScaleDirection.Uniformly
    //% anchor.defl=ScaleAnchor.Middle
    //% help=sprites/sprite/shrink-by-percent
    //% group="Scale" weight=70
    shrinkByPercent(amount: number, direction?: ScaleDirection, anchor?: ScaleAnchor): void {
        this.growByPercent(-amount, direction, anchor);
    }

    //% blockId=sprite_grow_by_pixels
    //% block="grow %sprite(mySprite) by $amount pixels $direction || anchor $anchor proportional $proportional"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% amount.defl=10
    //% direction.defl=ScaleDirection.Horizontally
    //% anchor.defl=ScaleAnchor.Middle
    //% proportional.defl=false
    //% help=sprites/sprite/grow-by-pixels
    //% group="Scale" weight=60
    growByPixels(amount: number, direction?: ScaleDirection, anchor?: ScaleAnchor, proportional?: boolean): void {
        direction = direction || ScaleDirection.Horizontally;
        anchor = anchor || ScaleAnchor.Middle;
        if (typeof proportional !== 'boolean') proportional = direction === ScaleDirection.Uniformly;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) {
            const imgW = this._image.width;
            const newW = this.width + amount;
            sx = newW / imgW;
        }

        if (direction & ScaleDirection.Vertically) {
            const imgH = this._image.height;
            const newH = this.height + amount;
            sy = newH / imgH;
        }

        this.setScaleCore(sx, sy, anchor, proportional);
    }

    //% blockId=sprite_shrink_by_pixels
    //% block="shrink %sprite(mySprite) by $amount pixels $direction || anchor $anchor proportional $proportional"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% amount.defl=10
    //% direction.defl=ScaleDirection.Horizontally
    //% anchor.defl=ScaleAnchor.Middle
    //% proportional.defl=false
    //% help=sprites/sprite/grow-by-pixels
    //% group="Scale" weight=50
    shrinkByPixels(amount: number, direction?: ScaleDirection, anchor?: ScaleAnchor, proportional?: boolean): void {
        this.growByPixels(-amount, direction, anchor, proportional);
    }

    toString() {
        return `${this.id}(${this.x},${this.y})->(${this.vx},${this.vy})`;
    }
}
