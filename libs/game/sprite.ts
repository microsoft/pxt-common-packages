enum SpriteFlag {
    //% block="ghost"
    Ghost = sprites.Flag.Ghost,
    //% block="auto destroy"
    AutoDestroy = sprites.Flag.AutoDestroy,
    //% block="obstacle"
    Obstacle = sprites.Flag.Obstacle
}

/**
 * A sprite on screem
 **/
//% blockNamespace=Sprites color="#23c47e" blockGap=8
class Sprite {
    //% group="Properties"
    //% blockCombine block="x"
    x: number
    //% group="Properties"
    //% blockCombine block="y"
    y: number
    private _z: number
    //% group="Properties"
    //% blockCombine block="vx"
    vx: number
    //% group="Properties"
    //% blockCombine block="vy"
    vy: number
    //% group="Properties"
    //% blockCombine block="ax"
    ax: number
    //% group="Properties"
    //% blockCombine block="ay"
    ay: number
    //% group="Properties"
    //% blockCombine block="layer"
    layer: number
    //% group="Properties"
    //% blockCombine block="life"
    life: number;
    private _say: string;
    private _sayExpires: number;
    private _image: Image

    flags: number
    id: number

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
        this._image = img
        this.layer = 1; // member of layer 1 by default
        this.life = -1
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
    //% blockId=spritesetimage block="set %sprite image to %img"
    //% img.fieldEditor="sprite"
    //% img.fieldOptions.taggedTemplate="img"
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
            game.scene.flags |= game.Flag.NeedsSorting;
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
     * @param text the text to say, eg: "Hi"
     * @param time time to keep text on, eg: 2000
     */
    //% group="Properties"
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

        screen.drawTransparentImage(this._image, this.left, this.top)
        // say text
        if (this._say && (this._sayExpires < 0 || this._sayExpires > control.millis())) {
            screen.fillRect(
                this.right,
                this.top - image.font5.charHeight - 2,
                this._say.length * image.font5.charWidth + 2,
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
        if (this.life > 0) {
            this.life--;
            if (this.life <= 0)
                this.destroy();
        }
        if ((this.flags & sprites.Flag.AutoDestroy)
            && this.isOutOfScreen()) {
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
    //% group="Collisions"
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
    //% group="Collisions"
    //% blockId=spriteonoverlap block="on %sprite overlap with"
    onOverlap(handler: (other: Sprite) => void) {
        this.overlapHandler = handler;
    }

    /**
     * Register code to run when sprite is destroyed
     * @param handler
     */
    //% group="Lifecycle"
    //% weight=9
    //% blockId=spriteondestroy block="on %sprite destroyed"
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
        game.scene.allSprites.removeElement(this);
        game.scene.physicsEngine.removeSprite(this);
        if (this.destroyHandler) {
            control.runInParallel(this.destroyHandler)
        }
    }

    toString() {
        return `${this.id}(${this.x},${this.y})->(${this.vx},${this.vy})`;
    }
}