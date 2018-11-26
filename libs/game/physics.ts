class PhysicsEngine {
    constructor() {
    }

    /**
     * Adds sprite to the physics
     * @param sprite
     */
    addSprite(sprite: Sprite) { }

    removeSprite(sprite: Sprite) { }

    moveSprite(s: Sprite, tm: tiles.TileMap, dx: Fx8, dy: Fx8) { }

    draw() { }

    /** Apply physics */
    move(dt: number) { }

    /**
     * Apply collisions
     */
    collisions() { }

    overlaps(sprite: Sprite): Sprite[] { return []; }
}

const MAX_DISTANCE = Fx8(15); // pixels
const MAX_TIME_STEP = Fx8(0.1); // seconds
const MAX_VELOCITY = Fx.div(MAX_DISTANCE, MAX_TIME_STEP);
const NEG_MAX_VELOCITY = Fx.neg(MAX_VELOCITY)
const GAP = Fx8(0.1);

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
        const dtf = Fx.min(MAX_TIME_STEP, Fx8(dt))
        const dt2 = Fx.idiv(dtf, 2)

        const tm = game.currentScene().tileMap;

        for (let s of this.sprites) {
            const ovx = constrain(s._vx);
            const ovy = constrain(s._vy);

            s._vx = constrain(Fx.add(s._vx, Fx.mul(s._ax, dtf)))
            s._vy = constrain(Fx.add(s._vy, Fx.mul(s._ay, dtf)))

            this.moveSprite(s, tm,
                Fx.mul(Fx.add(s._vx, ovx), dt2),
                Fx.mul(Fx.add(s._vy, ovy), dt2))
        }
    }

    collisions() {
        control.enablePerfCounter("phys_collisions")

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
                // Maintaining invariant that the sprite with the higher ID has the other sprite as an overlapper
                const higher = sprite.id > overlapper.id ? sprite : overlapper;
                const lower = higher === sprite ? overlapper : sprite;

                if (higher._overlappers.indexOf(lower.id) === -1) {
                    if (sprite.overlapHandler) {
                        higher._overlappers.push(lower.id);
                        control.runInParallel(() => {
                            sprite.overlapHandler(overlapper);
                            higher._overlappers.removeElement(lower.id);
                        });
                    }

                    scene.overlapHandlers
                        .filter(h => h.type == sprite.type && h.otherType == overlapper.type)
                        .forEach(h => {
                            higher._overlappers.push(lower.id);
                            control.runInParallel(() => {
                                h.handler(sprite, overlapper);
                                higher._overlappers.removeElement(lower.id);
                            });
                        });
                }
            }

            const xDiff = Fx.sub(sprite._x, sprite._lastX);
            const yDiff = Fx.sub(sprite._y, sprite._lastY);
            if (xDiff !== Fx.zeroFx8 || yDiff !== Fx.zeroFx8) {
                if (Fx.abs(xDiff) < MAX_DISTANCE &&
                    Fx.abs(yDiff) < MAX_DISTANCE) {
                    // Undo the move
                    sprite._x = sprite._lastX;
                    sprite._y = sprite._lastY;

                    // Now move it with the tilemap in mind
                    this.moveSprite(sprite, tm, xDiff, yDiff);
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

    public moveSprite(s: Sprite, tm: tiles.TileMap, dx: Fx8, dy: Fx8) {
        if (dx === Fx.zeroFx8 && dy === Fx.zeroFx8) {
            s._lastX = s._x;
            s._lastY = s._y;
            return;
        }

        if (tm && tm.enabled && !(s.flags & sprites.Flag.Ghost)) {
            let hitWall = false;
            const bounce = s.flags & sprites.Flag.BounceOnWall;

            s._hitboxes.forEach(box => {
                const t0 = box.top >> 4;
                const r0 = box.right >> 4;
                const b0 = box.bottom >> 4;
                const l0 = box.left >> 4;

                if (dx > Fx.zeroFx8) {
                    let topCollide = tm.isObstacle(r0 + 1, t0);
                    if (topCollide || tm.isObstacle(r0 + 1, b0)) {
                        const nextRight = Fx.iadd(box.right, dx);
                        const maxRight = Fx.sub(Fx8(((r0 + 1) << 4)), GAP);
                        if (bounce && nextRight >= maxRight) s._vx = Fx.neg(s._vx);
                        if (nextRight > maxRight) {
                            hitWall = true;
                            dx = Fx.sub(dx, Fx.sub(nextRight, maxRight))
                            s.registerObstacle(CollisionDirection.Right, tm.getObstacle(r0 + 1, topCollide ? t0 : b0))
                        }
                    }
                }
                else if (dx < Fx.zeroFx8) {
                    const topCollide = tm.isObstacle(l0 - 1, t0);
                    if (topCollide || tm.isObstacle(l0 - 1, b0)) {
                        const nextLeft = Fx.iadd(box.left, dx);
                        const minLeft = Fx.iadd(l0 << 4, GAP);
                        if (bounce && nextLeft <= minLeft) s._vx = Fx.neg(s._vx);
                        if (nextLeft < minLeft) {
                            hitWall = true;
                            dx = Fx.sub(dx, Fx.sub(nextLeft, minLeft))
                            s.registerObstacle(CollisionDirection.Left, tm.getObstacle(l0 - 1, topCollide ? t0 : b0))
                        }
                    }
                }

                if (dy > Fx.zeroFx8) {
                    const rightCollide = tm.isObstacle(r0, b0 + 1);
                    if (rightCollide || tm.isObstacle(l0, b0 + 1)) {
                        const nextBottom = Fx.iadd(box.bottom, dy);
                        const maxBottom = Fx.sub(Fx8((b0 + 1) << 4), GAP);
                        if (bounce && nextBottom >= maxBottom) s._vy = Fx.neg(s._vy);
                        if (nextBottom > maxBottom) {
                            hitWall = true;
                            dy = Fx.sub(dy, Fx.sub(nextBottom, maxBottom));
                            s.registerObstacle(CollisionDirection.Bottom, tm.getObstacle(rightCollide ? r0 : l0, b0 + 1))
                        }
                    }
                }
                else if (dy < Fx.zeroFx8) {
                    const rightCollide = tm.isObstacle(r0, t0 - 1);
                    if (tm.isObstacle(r0, t0 - 1) || tm.isObstacle(l0, t0 - 1)) {
                        const nextTop = Fx.iadd(box.top, dy);
                        const minTop = Fx.iadd(t0 << 4, GAP);
                        if (bounce && nextTop <= minTop) s._vy = Fx.neg(s._vy);
                        if (nextTop < minTop) {
                            hitWall = true;
                            dy = Fx.sub(dy, Fx.sub(nextTop, minTop));
                            s.registerObstacle(CollisionDirection.Top, tm.getObstacle(rightCollide ? r0 : l0, t0 - 1))
                        }
                    }
                }

                // Now check each corner and bump out if necessary. This step is needed for
                // the case where a hitbox goes diagonally into the corner of a tile.
                const t1 = (box.top + Fx.toInt(dy)) >> 4;
                const r1 = (box.right + Fx.toInt(dx)) >> 4;
                const b1 = (box.bottom + Fx.toInt(dy)) >> 4;
                const l1 = (box.left + Fx.toInt(dx)) >> 4;

                if (tm.isObstacle(r1, t1)) {
                    hitWall = true;
                    // bump left
                    if (bounce) s._vx = Fx.neg(s._vx);

                    dx = Fx.sub(Fx8(box.right + (r1 << 4)), GAP)
                    s.registerObstacle(CollisionDirection.Right, tm.getObstacle(r1, t1));
                }
                else if (tm.isObstacle(l1, t1)) {
                    hitWall = true;
                    // bump right
                    if (bounce) s._vx = Fx.neg(s._vx);
                    dx = Fx.sub(Fx.iadd((l1 + 1) << 4, GAP), Fx8(box.left))
                    s.registerObstacle(CollisionDirection.Left, tm.getObstacle(l1, t1));
                }
                else {
                    const rightCollide = tm.isObstacle(r1, b1);
                    if (rightCollide || tm.isObstacle(l1, b1)) {
                        if (bounce) s._vy = Fx.neg(s._vy);
                        hitWall = true;
                        // bump up because that is usually better for platformers
                        dy = Fx.iadd(box.bottom, Fx.sub(Fx8(b1 << 4), GAP))
                        s.registerObstacle(CollisionDirection.Bottom, tm.getObstacle(rightCollide ? r1 : l1, b1));
                    }
                }

                if (hitWall && (s.flags & sprites.Flag.DestroyOnWall)) {
                    s.destroy();
                }
            });
        }

        //if (Fx.add(Fx.abs(dx), Fx.abs(dy)) > Fx8(5))
        //    control.dmesg(`fast move  ${dx}/${dy}`)

        s._x = Fx.add(s._x, dx);
        s._y = Fx.add(s._y, dy);
        s._lastX = s._x;
        s._lastY = s._y;
    }
}

function constrain(v: Fx8) {
    return Fx.max(Fx.min(MAX_VELOCITY, v), NEG_MAX_VELOCITY)
}