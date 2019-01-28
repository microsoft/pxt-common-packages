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

        // 1: refresh non-ghost collision map
        const colliders = this.sprites.filter(sprite => !(sprite.flags & sprites.Flag.Ghost));

        if (colliders.length < 10) {
            // not enough sprite, just brute force it
            this.map = undefined;
        } else {
            if (!this.map) this.map = new sprites.SpriteMap();
            this.map.update(colliders);
        }

        // 2: go through sprite and handle collisions
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
                        .filter(h => h.kind == sprite.kind() && h.otherKind == overlapper.kind())
                        .forEach(h => {
                            higher._overlappers.push(lower.id);
                            control.runInParallel(() => {
                                h.handler(sprite, overlapper);
                                higher._overlappers.removeElement(lower.id);
                            });
                        });
                }
            }

            sprite.clearObstacles();

            if (tm && tm.enabled) {
                const xDiff = Fx.sub(sprite._x, sprite._lastX);
                const yDiff = Fx.sub(sprite._y, sprite._lastY);

                let hitWall = false;
                const bounce = sprite.flags & sprites.Flag.BounceOnWall;

                if (xDiff !== Fx.zeroFx8) {
                    const right = xDiff > Fx.zeroFx8;
                    const x0 = Fx.toIntShifted(Fx.add(right ? Fx.iadd(1, sprite._hitbox.right) : sprite._hitbox.left, Fx8(0.5)), 4);
                    for (let y = Fx.sub(sprite._hitbox.top, yDiff); y < Fx.iadd(16, Fx.sub(sprite._hitbox.bottom, yDiff)); y = Fx.iadd(16, y)) {
                        const y0 = Fx.toIntShifted(Fx.add(Fx.min(y, Fx.sub(sprite._hitbox.bottom, yDiff)), Fx8(0.5)), 4);
                        if (tm.isObstacle(x0, y0)) {
                            hitWall = true;
                            if (bounce) {
                                sprite._vx = Fx.neg(sprite._vx);
                            }
                            sprite._x = Fx.iadd(-sprite._hitbox.ox, right ? Fx.sub(Fx8(x0 << 4), Fx8(sprite._hitbox.width)) : Fx8((x0 + 1) << 4));
                            sprite.registerObstacle(right ? CollisionDirection.Right : CollisionDirection.Left, tm.getObstacle(x0, y0));
                            break;
                        }
                    }
                }
                if (yDiff !== Fx.zeroFx8) {
                    const down = yDiff > Fx.zeroFx8;
                    const y0 = Fx.toIntShifted(Fx.add(down ? Fx.iadd(1, sprite._hitbox.bottom) : sprite._hitbox.top, Fx8(0.5)), 4);
                    for (let x = sprite._hitbox.left; x < Fx.iadd(16, sprite._hitbox.right); x = Fx.iadd(16, x)) {
                        const x0 = Fx.toIntShifted(Fx.add(Fx.min(x, sprite._hitbox.right), Fx8(0.5)), 4);
                        if (tm.isObstacle(x0, y0)) {
                            hitWall = true;
                            if (bounce) {
                                sprite._vy = Fx.neg(sprite._vy);
                            }
                            sprite._y = Fx.iadd(-sprite._hitbox.oy, down ? Fx.sub(Fx8(y0 << 4), Fx8(sprite._hitbox.height)) : Fx8((y0 + 1) << 4));
                            sprite.registerObstacle(down ? CollisionDirection.Bottom : CollisionDirection.Top, tm.getObstacle(x0, y0));
                            break;
                        }
                    }
                }
                if (hitWall && (sprite.flags & sprites.Flag.DestroyOnWall)) {
                    sprite.destroy();
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
        s._lastX = s._x;
        s._lastY = s._y;
        s._x = Fx.add(s._x, dx);
        s._y = Fx.add(s._y, dy);
    }
}

function constrain(v: Fx8) {
    return Fx.max(Fx.min(MAX_VELOCITY, v), NEG_MAX_VELOCITY)
}