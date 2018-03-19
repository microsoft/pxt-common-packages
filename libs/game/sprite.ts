enum SpriteFlag {
    //% block="ghost"
    Ghost = sprites.Flag.Ghost,
    //% block="auto destroy"
    AutoDestroy = sprites.Flag.AutoDestroy
}

/**
 * A sprite on screem
 **/
//% blockNamespace=Sprites color="#23c47e" blockGap=8
class Sprite {
    //% blockCombine block="x"
    x: number
    //% blockCombine block="y"
    y: number
    _z: number
    //% blockCombine block="vx"
    vx: number
    //% blockCombine block="vy"
    vy: number
    //% blockCombine block="ax"
    ax: number
    //% blockCombine block="ay"
    ay: number
    //% blockCombine block="type"
    type: number
    //% blockCombine block="life"
    life: number;
    private _say: string;
    private _sayExpires: number;

    image: Image
    flags: number
    id: number
    animation: SpriteAnimation

    overlapHandler: (other: Sprite) => void;
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
        this.image = img
        this.type = 0
        this.life = -1
    }

    //% blockCombine block="z (depth)"
    get z(): number {
        return this._z;
    }

    //% blockCombine block="z (depth)"
    set z(value: number) {
        if (value != this._z) {
            this._z = value;
            game.flags |= game.Flag.NeedsSorting;
        }
    }

    //% blockCombine block="width"
    get width() {
        return this.image.width
    }
    //% blockCombine block="height"
    get height() {
        return this.image.height
    }
    //% blockCombine block="left"
    get left() {
        return this.x - (this.width >> 1)
    }
    //% blockCombine block="left"
    set left(value: number) {
        this.x = value + (this.width >> 1);
    }
    //% blockCombine block="right"
    get right() {
        return this.left + this.width
    }
    //% blockCombine block="right"
    set right(value: number) {
        this.x = value - (this.width >> 1);
    }
    //% blockCombine
    get top() {
        return this.y - (this.height >> 1)
    }
    //% blockCombine
    set top(value: number) {
        this.y = value + (this.height >> 1);
    }
    //% blockCombine block="bottom"
    get bottom() {
        return this.top + this.height
    }
    //% blockCombine block="bottom"
    set bottom(value: number) {
        this.y = value - (this.height >> 1);
    }

    /**
     * Display a speech bubble with the text, for the given time
     * @param text 
     * @param time time to keep text on, eg: 2000
     */
    //% blockNamespace=Sprites color="#23c47e"
    //% blockId=spritesay block="%sprite say %text||for %millis|ms"
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
    isOutOfScreen(): boolean {
        return this.right < 0 || this.bottom < 0 || this.left > screen.width || this.top > screen.height;
    }

    __draw() {
        if (this.isOutOfScreen()) return;

        screen.drawTransparentImage(this.image, this.left, this.top)
        // say text
        if (this._say && (this._sayExpires < 0 || this._sayExpires > control.millis())) {
            screen.fillRect(
                this.right,
                this.top - image.font5.charHeight - 2,
                this._say.length * image.font5.charWidth,
                image.font5.charHeight + 4,
                1);
            screen.print(this._say,
                this.right + 2,
                this.top - image.font5.charHeight,
                15,
                image.font5);
        }
        // debug info
        if (game.debug)
            screen.drawRect(this.left, this.top, this.width, this.height, 3);
    }

    __update(dt: number) {
        if (this.animation)
            this.animation.update(this)
        if (this.life > 0) {
            this.life--;
            if (this.life <= 0)
                this.destroy();
        }
        if (this.flags & sprites.Flag.AutoDestroy) {
            if (this.right < 0 || this.bottom < 0 ||
                this.left > screen.width ||
                this.top > screen.height) {
                this.destroy()
            }
        }
    }

    __computeOverlaps() {
        const oh = this.overlapHandler;
        if (oh) {
            for (let o of physics.engine.overlaps(this, 0)) {
                let tmp = o
                control.runInParallel(() => oh(tmp))
            }
        }
    }

    /**
     * Sets the sprite as a ghost (which does not interact with physics)
     */
    //% blockId=spritesetsetflag block="set %sprite %flag %on"
    //% on.fieldEditor=toggleonoff
    setFlag(flag: SpriteFlag, on: boolean) {
        if (on) this.flags |= flag
        else this.flags = ~(~this.flags | flag);
    }

    /**
     * Tests if a sprite overlaps with another
     * @param other
     */
    //% blockId=spriteoverlapswith block="%sprite overlaps with %other"
    overlapsWith(other: Sprite) {
        if (other == this) return false;
        if (this.flags & sprites.Flag.Ghost)
            return false
        if (other.flags & sprites.Flag.Ghost)
            return false
        return other.image.overlapsWith(this.image, this.left - other.left, this.top - other.top)
    }

    /**
     * Registers code when the sprite overlaps with another sprite
     * @param spriteType sprite type to match
     * @param handler
     */
    //% blockId=spriteonoverlap block="on %sprite overlap with"
    onOverlap(handler: (other: Sprite) => void) {
        this.overlapHandler = handler;
    }

    /**
     * Register code to run when sprite is destroyed
     * @param handler
     */
    //% weight=9
    //% blockId=spriteondestroy block="on %sprite destroyed"
    onDestroyed(handler: () => void) {
        this.destroyHandler = handler
    }

    /**
     * Destroys the sprite
     */
    //% weight=10
    //% blockId=spritedestroy block="destroy %sprite"
    destroy() {
        if (this.flags & sprites.Flag.Destroyed)
            return
        this.flags |= sprites.Flag.Destroyed
        sprites.allSprites.removeElement(this);
        physics.engine.removeSprite(this);
        if (this.destroyHandler) {
            control.runInParallel(this.destroyHandler)
        }
    }

    toString() {
        return `${this.id}(${this.x},${this.y})->(${this.vx},${this.vy})`;
    }
}