class PhysicsEngine {
    constructor() {
    }

    /**
     * Adds sprite to the physics
     * @param sprite
     */
    addSprite(sprite: Sprite) { }

    removeSprite(sprite: Sprite) { }

    draw() { }

    /**
     * Compute physic information before rendering
     */
    update(dt: number) { }

    overlaps(sprite: Sprite, spriteType: number): Sprite[] { return []; }
}

/**
 * A physics engine that does simple AABB bounding box check
 */
class ArcadePhysicsEngine extends PhysicsEngine {
    private sprites: Sprite[];
    private map: sprites.SpriteMap;

    constructor() {
        super();
        this.sprites = [];
    }

    addSprite(sprite: Sprite) {
        this.sprites.push(sprite);
    }

    removeSprite(sprite: Sprite) {
        this.sprites.removeElement(sprite);
    }

    draw() {
        if (this.map)
            this.map.draw();
    }

    update(dt: number) {
        const dt2 = dt / 2;

        // 1: move sprites
        for (let s of this.sprites) {
            s.ox = s.x;
            s.oy = s.y;
            const ovx = s.vx;
            const ovy = s.vy;
            s.vx += s.ax * dt
            s.vy += s.ay * dt
            s.x += (ovx + s.vx) * dt2;
            s.y += (ovy + s.vy) * dt2;
        }

        // 2: refresh non-ghost collision map
        const colliders = this.sprites.filter(sprite => !(sprite.flags & sprites.Flag.Ghost));
        // collect any sprite with a collection handler
        const collisioners = colliders.filter(sprite => !(sprite.flags & sprites.Flag.Obstacle));
        // for low number of sprites, just iterate through them
        if (collisioners.length < Math.sqrt(colliders.length)) {
            // not enough sprite, just brute force it
            this.map = undefined;
        } else {
            if (!this.map) this.map = new sprites.SpriteMap();
            this.map.update(colliders);
        }

        // 3: go through sprite and handle collisions
        for (const sprite of collisioners) {
            const overSprites = game.scene.physicsEngine.overlaps(sprite, 0);
            for (const o of overSprites) {
                // move to avoid collisions                                
                if (o.flags & sprites.Flag.Obstacle) {
                    const xdiff = Math.abs(sprite.x - o.x);
                    const ydiff = Math.abs(sprite.y - o.y);
                    if (ydiff > xdiff) {
                        if (sprite.bottom > o.top && sprite.bottom < o.bottom) {
                            sprite.bottom = o.top;
                        } else {
                            sprite.top = o.bottom;
                        }
                    } else {
                        if (sprite.right > o.left && sprite.right < o.right) {
                            sprite.right = o.left;
                        } else {
                            sprite.left = o.right;
                        }
                    }
                }
                // overlap handler
                const oh = sprite.overlapHandler;
                if (oh) {
                    const tmp = o;
                    control.runInParallel(() => oh(tmp))
                }
            }
        }
    }

    /**
     * Returns sprites that overlap with the given sprite. If type is non-zero, also filter by type.
     * @param sprite
     * @param layer
     */
    overlaps(sprite: Sprite, layer: number): Sprite[] {
        if (this.map)
            return this.map.overlaps(sprite, layer);
        else {
            const r: Sprite[] = [];
            const n = this.sprites.length;
            for (let i = 0; i < n; ++i) {
                if ((!layer || !!(layer & this.sprites[i].layer))
                    && sprite.overlapsWith(this.sprites[i]))
                    r.push(this.sprites[i]);
            }
            return r;
        }
    }
}