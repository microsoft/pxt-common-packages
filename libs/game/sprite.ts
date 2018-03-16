enum SpriteFlag {
    //% block="ghost"
    Ghost = sprites.Flag.Ghost,
    //% block="auto destroy"
    AutoDestroy = sprites.Flag.AutoDestroy
}

/**
 * A sprite on screem
 **/
//% blockNamespace=Sprites color="#23c47e"
class Sprite {
    //% blockCombine
    x: number
    //% blockCombine
    y: number
    _z: number
    //% blockCombine
    vx: number
    //% blockCombine
    vy: number
    //% blockCombine
    ax: number
    //% blockCombine
    ay: number
    //% blockCombine
    type: number
    //% blockCombine
    life: number;

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

    //% blockCombine="z (depth)"
    get z(): number {
        return this._z;
    }

    //% blockCombine="z (depth)"
    set z(value: number) {
        if (value != this._z) {
            this._z = value;
            game.flags |= game.Flag.NeedsSorting;
        }
    }

    //% blockCombine
    get width() {
        return this.image.width
    }
    //% blockCombine
    get height() {
        return this.image.height
    }
    //% blockCombine
    get left() {
        return this.x - (this.width >> 1)
    }
    //% blockCombine
    set left(value: number) {
        this.x = value + (this.width >> 1);
    }
    //% blockCombine
    get right() {
        return this.left + this.width
    }
    //% blockCombine
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
    //% blockCombine
    get bottom() {
        return this.top + this.height
    }
    //% blockCombine
    set bottom(value: number) {
        this.y = value - (this.height >> 1);
    }
    __draw() {
        screen.drawTransparentImage(this.image, this.left, this.top)
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
    //% blockGap=8
    //% blockNamespace=Sprites color="#23c47e"
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
    //% blockGap=8
    //% blockNamespace=Sprites color="#23c47e"
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
    //% blockGap=8
    //% blockNamespace=Sprites color="#23c47e"
    //% blockId=spriteonoverlap block="on %sprite overlap with"
    onOverlap(handler: (other: Sprite) => void) {
        this.overlapHandler = handler;
    }

    /**
     * Register code to run when sprite is destroyed
     * @param handler
     */
    //% weight=9 blockGap=8
    //% blockNamespace=Sprites color="#23c47e"
    //% blockId=spriteondestroy block="on %sprite destroyed"
    onDestroyed(handler: () => void) {
        this.destroyHandler = handler
    }

    /**
     * Destroys the sprite
     */
    //% weight=10 blockGap=8
    //% blockNamespace=Sprites color="#23c47e"
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