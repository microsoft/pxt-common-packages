class PhysicsEngine {
    constructor() {
    }

    /**
     * Adds sprite to the physics
     * @param sprite
     */
    addSprite(sprite: Sprite) { }

    removeSprite(sprite: Sprite) { }

    moveSprite(s: Sprite, tm: tiles.TileMap, dx: number, dy: number) { }

    draw() { }

    /** Apply physics */
    move(dt: number) { }

    /**
     * Apply collisions
     */
    collisions() { }

    overlaps(sprite: Sprite): Sprite[] { return []; }
}

const MAX_DISTANCE = 15; // pixels
const MAX_TIME_STEP = 0.1; // seconds
const MAX_VELOCITY = MAX_DISTANCE / MAX_TIME_STEP;
const GAP = 0.1;

/**
 * A physics engine that does simple AABB bounding box check
 */
class ArcadePhysicsEngine extends PhysicsEngine {
    protected sprites: Sprite[];
    protected map: sprites.SpriteMap;

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
        dt = Math.min(MAX_TIME_STEP, dt);
        const dt2 = dt / 2;

        const tm = game.currentScene().tileMap;

        for (let s of this.sprites) {
            const ovx = constrain(s.vx);
            const ovy = constrain(s.vy);

            s.vx = constrain(s.vx + s.ax * dt)
            s.vy = constrain(s.vy + s.ay * dt)

            this.moveSprite(s, tm, (s.vx + ovx) * dt2, (s.vy + ovy) * dt2);
        }
    }

    collisions() {
        // 1: clear obstacles
        for (let i = 0; i < this.sprites.length; ++i)
            this.sprites[i].clearObstacles();

        // 2: refresh non-ghost collision map
        const colliders = this.sprites.filter(sprite => !(sprite.flags & sprites.Flag.Ghost));

        if (colliders.length < 10) {
            // not enough sprite, just brute force it
            this.map = undefined;
        } else {
            if (!this.map) this.map = new sprites.SpriteMap();
            this.map.update(colliders);
        }

        // 3: go through sprite and handle collisions
        const scene = game.currentScene();
        const tm = scene.tileMap;

        for (const sprite of colliders) {
            const overSprites = scene.physicsEngine.overlaps(sprite);
            for (const overlapper of overSprites) {
                // overlap handler
                const tmpsprite = sprite;
                const tmp = overlapper;
                const oh = sprite.overlapHandler;
                if (oh)
                    control.runInParallel(() => oh(tmp))
                scene.overlapHandlers
                    .filter(h => h.type == sprite.type && h.otherType == overlapper.type)
                    .forEach(h => control.runInParallel(() => h.handler(tmpsprite, tmp)));
            }

            const xDiff = sprite.x - sprite._lastX;
            const yDiff = sprite.y - sprite._lastY;
            if ((xDiff !== 0 || yDiff !== 0) && Math.abs(xDiff) < MAX_DISTANCE && Math.abs(yDiff) < MAX_DISTANCE) {
                // Undo the move
                sprite.x = sprite._lastX;
                sprite.y = sprite._lastY;

                // Now move it with the tilemap in mind
                this.moveSprite(sprite, tm, xDiff, yDiff);
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
            // brute force
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

    public moveSprite(s: Sprite, tm: tiles.TileMap, dx: number, dy: number) {
        if (dx === 0 && dy === 0) {
            s._lastX = s.x;
            s._lastY = s.y;
            return;
        }

        if (tm && !(s.flags & sprites.Flag.Ghost)) {
            let hitWall = false;
            const bounce = s.flags & sprites.Flag.BounceOnWall;
            s._hitboxes.forEach(box => {
                const t0 = box.top >> 4;
                const r0 = box.right >> 4;
                const b0 = box.bottom >> 4;
                const l0 = box.left >> 4;

                if (dx > 0) {
                    let topCollide = tm.isObstacle(r0 + 1, t0);
                    if (topCollide || tm.isObstacle(r0 + 1, b0)) {
                        const nextRight = box.right + dx;
                        const maxRight = ((r0 + 1) << 4) - GAP
                        if (nextRight > maxRight) {
                            if (bounce) s.vx = -s.vx;
                            hitWall = true;
                            dx -= (nextRight - maxRight);
                            s.registerObstacle(CollisionDirection.Right, tm.getObstacle(r0 + 1, topCollide ? t0 : b0))
                        }
                    }
                }
                else if (dx < 0) {
                    const topCollide = tm.isObstacle(l0 - 1, t0);
                    if (topCollide || tm.isObstacle(l0 - 1, b0)) {
                        const nextLeft = box.left + dx;
                        const minLeft = (l0 << 4) + GAP;
                        if (nextLeft < minLeft) {
                            if (bounce) s.vx = -s.vx;
                            hitWall = true;
                            dx -= (nextLeft - minLeft);
                            s.registerObstacle(CollisionDirection.Left, tm.getObstacle(l0 - 1, topCollide ? t0 : b0))
                        }
                    }
                }

                if (dy > 0) {
                    const rightCollide = tm.isObstacle(r0, b0 + 1);
                    if (rightCollide || tm.isObstacle(l0, b0 + 1)) {
                        const nextBottom = box.bottom + dy;
                        const maxBottom = ((b0 + 1) << 4) - GAP;
                        if (nextBottom > maxBottom) {
                            if (bounce) s.vy = -s.vy;
                            hitWall = true;
                            dy -= (nextBottom - maxBottom);
                            s.registerObstacle(CollisionDirection.Bottom, tm.getObstacle(rightCollide ? r0 : l0, b0 + 1))
                        }
                    }
                }
                else if (dy < 0) {
                    const rightCollide = tm.isObstacle(r0, t0 - 1);
                    if (tm.isObstacle(r0, t0 - 1) || tm.isObstacle(l0, t0 - 1)) {
                        const nextTop = box.top + dy;
                        const minTop = (t0 << 4) + GAP;
                        if (nextTop < minTop) {
                            if (bounce) s.vy = -s.vy;
                            hitWall = true;
                            dy -= (nextTop - minTop);
                            s.registerObstacle(CollisionDirection.Top, tm.getObstacle(rightCollide ? r0 : l0, t0 - 1))
                        }
                    }
                }

                // Now check each corner and bump out if necessary. This step is needed for
                // the case where a hitbox goes diagonally into the corner of a tile.
                const t1 = (box.top + dy) >> 4;
                const r1 = (box.right + dx) >> 4;
                const b1 = (box.bottom + dy) >> 4;
                const l1 = (box.left + dx) >> 4;

                if (tm.isObstacle(r1, t1)) {
                    hitWall = true;
                    // bump left
                    if (bounce) s.vx = -s.vx;
                    dx -= (box.right + dx - ((r1 << 4) - GAP))
                    s.registerObstacle(CollisionDirection.Right, tm.getObstacle(r1, t1));
                }
                else if (tm.isObstacle(l1, t1)) {
                    hitWall = true;
                    // bump right
                    if (bounce) s.vx = -s.vx;
                    dx -= (box.left + dx - (((l1 + 1) << 4) + GAP));
                    s.registerObstacle(CollisionDirection.Left, tm.getObstacle(l1, t1));
                }
                else {
                    const rightCollide = tm.isObstacle(r1, b1);
                    if (rightCollide || tm.isObstacle(l1, b1)) {
                        if (bounce) s.vy = -s.vy;
                        hitWall = true;
                        // bump up because that is usually better for platformers
                        dy -= (box.bottom + dy - ((b1 << 4) - GAP));
                        s.registerObstacle(CollisionDirection.Bottom, tm.getObstacle(rightCollide ? r1 : l1, b1));
                    }
                }

                if (hitWall && (s.flags & sprites.Flag.DestroyOnWall)) {
                    s.destroy();
                }
            });
        }

        s.x += dx;
        s.y += dy;
        s._lastX = s.x;
        s._lastY = s.y;
    }
}

function constrain(v: number) {
    return Math.abs(v) > MAX_VELOCITY ? Math.sign(v) * MAX_VELOCITY : v;
}