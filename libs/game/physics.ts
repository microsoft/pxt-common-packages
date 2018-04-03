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

    /** Apply physics */
    move(dt: number) { }

    /**
     * Apply collisions
     */
    collisions() { }

    overlaps(sprite: Sprite): Sprite[] { return []; }
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

    move(dt: number) {
        const dt2 = dt / 2;
        // 1: move sprites
        for (let s of this.sprites) {
            const ovx = s.vx;
            const ovy = s.vy;
            s.vx += s.ax * dt
            s.vy += s.ay * dt
            s.x += (ovx + s.vx) * dt2;
            s.y += (ovy + s.vy) * dt2;
        }
    }

    collisions() {
        // 2: refresh non-ghost collision map
        const colliders = this.sprites.filter(sprite => !(sprite.flags & sprites.Flag.Ghost));
        // collect any non-obstacle sprite with a collection handlee
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
            const overSprites = game.scene.physicsEngine.overlaps(sprite);
            for (const o of overSprites) {
                // move to avoid collisions                                
                if (o.flags & sprites.Flag.Obstacle) {
                    // find the shortest distance into the obstacle
                    let toperr = sprite.bottom - o.top; if (toperr < 0) toperr = 1 << 30;
                    let bottomerr = o.bottom - sprite.top; if (bottomerr < 0) bottomerr = 1 << 30;
                    let lefterr = sprite.right - o.left; if (lefterr < 0) lefterr = 1 << 30;
                    let righterr = o.right - sprite.left; if (righterr < 0) righterr = 1 << 30;
                    const min = Math.min(toperr, Math.min(bottomerr, Math.min(lefterr, righterr)));
                    if (toperr == min)
                        sprite.bottom = o.top;
                    else if (bottomerr == min)
                        sprite.top = o.bottom;
                    else if (lefterr == min)
                        sprite.right = o.left;
                    else 
                        sprite.left = o.right;
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
    overlaps(sprite: Sprite): Sprite[] {
        if (this.map)
            return this.map.overlaps(sprite);
        else {
            const layer = sprite.layer;
            const r: Sprite[] = [];
            const n = this.sprites.length;
            for (let i = 0; i < n; ++i) {
                if ((layer & this.sprites[i].layer)
                    && sprite.overlapsWith(this.sprites[i]))
                    r.push(this.sprites[i]);
            }
            return r;
        }
    }
}