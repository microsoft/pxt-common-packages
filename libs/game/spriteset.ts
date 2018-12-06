/* 
* A set of sprites 
*/
class SpriteSet {
    private _sprites: Sprite[];

    /**
     * Create a new set from an array of sprites
     * @param sprites 
     */
    static createFromArray(sprites: Sprite[]): SpriteSet {
        const sp = new SpriteSet();
        const n = sprites.length;
        for(let i = 0; i < n; ++i)
            sp.add(sprites[i]);
        return sp;
    }

    constructor() {
        this._sprites = [];
    }

    /**
     * Gets the number of sprites in the set
     */
    get length() {
        return this._sprites.length;
    }

    /**
     * Gets the snapshot of the current list of sprites
     */
    sprites() {
        return this._sprites.slice(0, this._sprites.length);
    }

    /**
     * Adds the sprite, returns true if added; false if the sprite was already in the set
     * @param sprite 
     */
    add(sprite: Sprite): boolean {
        if (!sprite) return false; // don't add nulls

        // scan if in set
        if (this.contains(sprite))
            return false;
        this._sprites.push(sprite);
        return true;
    }

    /**
     * Adds sprite and removes from old set. Returns true if sprite was in old set and not in new set.
     * @param oldSet 
     * @param sprite 
     */
    addFrom(oldSet: SpriteSet, sprite: Sprite): boolean {
        const removed = oldSet.remove(sprite);
        const added = this.add(sprite);
        return removed && added;
    }

    /**
     * Removes sprite from set. Returns true if the sprite was in the set
     * @param sprite 
     */
    remove(sprite: Sprite): boolean {
        const i = this.indexOf(sprite);
        if (i > -1) {
            this._sprites.splice(i, 1);
            return true;
        }
        return false;
    }

    /**
     * Checks if the sprite is part of the set
     * @param sprite 
     */
    contains(sprite: Sprite): boolean {
        return this.indexOf(sprite) > -1;
    }

    private indexOf(sprite: Sprite): number {
        const n = this._sprites.length;
        for (let i = 0; i < n; ++i)
            if (this._sprites[i] == sprite)
                return i;
        return -1;
    }

    /** 
     * Removes all the sprites from the set
    */
    clear() {
        this._sprites.splice(0, this._sprites.length);
    }

    /**
     * Removes the last sprite in the set
     */
    pop(): Sprite {
        return this._sprites.pop();
    }

    toString() {
        return `${this.length} sprites`
    }
}