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

const MAX_TIME_STEP = Fx8(100); // milliseconds

/**
 * A physics engine that does simple AABB bounding box check
 */
class ArcadePhysicsEngine extends PhysicsEngine {
    protected sprites: Sprite[];
    protected map: sprites.SpriteMap;
    private maxVelocity: Fx8;
    private maxNegativeVelocity: Fx8;

    constructor(maxVelocity = 1000) {
        super();
        this.sprites = [];
        this.maxVelocity = Fx8(maxVelocity);
        this.maxNegativeVelocity = Fx.neg(this.maxVelocity);
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
        // Sprite movement logic is done in milliseconds to avoid rounding errors with Fx8 numbers
        const dtf = Fx.min(MAX_TIME_STEP, Fx8(dt * 1000))
        const dtSec = Fx.idiv(dtf, 1000); 
        const dt2 = Fx.idiv(dtf, 2);

        const tm = game.currentScene().tileMap;

        for (let s of this.sprites) {
            const ovx = this.constrain(s._vx);
            const ovy = this.constrain(s._vy);

            s._vx = this.constrain(Fx.add(s._vx, Fx.mul(s._ax, dtSec)))
            s._vy = this.constrain(Fx.add(s._vy, Fx.mul(s._ay, dtSec)))

            this.moveSprite(s, tm,
                Fx.idiv(Fx.mul(Fx.add(s._vx, ovx), dt2), 1000),
                Fx.idiv(Fx.mul(Fx.add(s._vy, ovy), dt2), 1000))
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
                const scale = tm.scale;
                const size = 1 << scale;
                const xDiff = Fx.sub(sprite._x, sprite._lastX);
                const yDiff = Fx.sub(sprite._y, sprite._lastY);

                let hitWall = false;
                const bounce = sprite.flags & sprites.Flag.BounceOnWall;

                if (xDiff !== Fx.zeroFx8) {
                    const right = xDiff > Fx.zeroFx8;
                    const x0 = Fx.toIntShifted(Fx.add(right ? Fx.iadd(1, sprite._hitbox.right) : sprite._hitbox.left, Fx8(0.5)), scale);
                    for (let y = Fx.sub(sprite._hitbox.top, yDiff); y < Fx.iadd(size, Fx.sub(sprite._hitbox.bottom, yDiff)); y = Fx.iadd(size, y)) {
                        const y0 = Fx.toIntShifted(Fx.add(Fx.min(y, Fx.sub(sprite._hitbox.bottom, yDiff)), Fx8(0.5)), scale);
                        if (tm.isObstacle(x0, y0)) {
                            hitWall = true;
                            if (bounce) {
                                sprite._vx = Fx.neg(sprite._vx);
                            }
                            sprite._x = Fx.iadd(-sprite._hitbox.ox, right ? Fx.sub(Fx8(x0 << scale), Fx8(sprite._hitbox.width)) : Fx8((x0 + 1) << scale));
                            sprite.registerObstacle(right ? CollisionDirection.Right : CollisionDirection.Left, tm.getObstacle(x0, y0));
                            break;
                        }
                    }
                }
                if (yDiff !== Fx.zeroFx8) {
                    const down = yDiff > Fx.zeroFx8;
                    const y0 = Fx.toIntShifted(Fx.add(down ? Fx.iadd(1, sprite._hitbox.bottom) : sprite._hitbox.top, Fx8(0.5)), scale);
                    for (let x = sprite._hitbox.left; x < Fx.iadd(size, sprite._hitbox.right); x = Fx.iadd(size, x)) {
                        const x0 = Fx.toIntShifted(Fx.add(Fx.min(x, sprite._hitbox.right), Fx8(0.5)), scale);
                        if (tm.isObstacle(x0, y0)) {
                            hitWall = true;
                            if (bounce) {
                                sprite._vy = Fx.neg(sprite._vy);
                            }
                            sprite._y = Fx.iadd(-sprite._hitbox.oy, down ? Fx.sub(Fx8(y0 << scale), Fx8(sprite._hitbox.height)) : Fx8((y0 + 1) << scale));
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

    private constrain(v: Fx8) {
        return Fx.max(
            Fx.min(
                this.maxVelocity,
                v
            ),
            this.maxNegativeVelocity
        );
    }
}
