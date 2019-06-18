class PhysicsEngine {
    constructor() {
    }

    /**
     * Adds sprite to the physics
     * @param sprite
     */
    addSprite(sprite: Sprite) { }

    removeSprite(sprite: Sprite) { }

    moveSprite(s: Sprite, dx: Fx8, dy: Fx8) { }

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

    constructor(maxVelocity = 150) {
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
        const dtf = Fx.min(
            MAX_TIME_STEP,
            Fx8(dt * 1000)
        );
        const dtSec = Fx.idiv(dtf, 1000); 
        const dt2 = Fx.idiv(dtf, 2);

        for (let s of this.sprites) {
            const ovx = this.constrain(s._vx);
            const ovy = this.constrain(s._vy);

            s._vx = this.constrain(
                Fx.add(
                    s._vx,
                    Fx.mul(
                        s._ax,
                        dtSec
                    )
                )
            );
            s._vy = this.constrain(
                Fx.add(
                    s._vy,
                    Fx.mul(
                        s._ay,
                        dtSec
                    )
                )
            );

            this.moveSprite(
                s,
                Fx.idiv(
                    Fx.mul(
                        Fx.add(
                            s._vx,
                            ovx
                        ),
                        dt2
                    ),
                    1000
                ),
                Fx.idiv(
                    Fx.mul(
                        Fx.add(
                            s._vy,
                            ovy
                        ),
                        dt2
                    ),
                    1000
                )
            );
        }
    }

    collisions() {
        control.enablePerfCounter("phys_collisions")

        // 1: refresh non-ghost collision map
        const colliders = this.collidableSprites();

        // 2: go through sprite and handle collisions
        const scene = game.currentScene();

        const tm = scene.tileMap;
        const tileScale = tm ? tm.scale : 0;
        const tileSize = tm ? 1 << tileScale : 0;

        function applySpriteOverlapHandlers(sprite: Sprite, overSprites: Sprite[]): void {
            const events: (() => void)[] = [];

            function pushOverlapEvent(higher: Sprite, lower: Sprite, e: (() => void)) {
                higher._overlappers.push(lower.id);
                events.push(() => {
                    e();
                    higher._overlappers.removeElement(lower.id);
                });
            }

            for (const overlapper of overSprites) {
                // Maintaining invariant that the sprite with the higher ID has the other sprite as an overlapper
                const higher = sprite.id > overlapper.id ? sprite : overlapper;
                const lower = higher === sprite ? overlapper : sprite;

                if (higher._overlappers.indexOf(lower.id) === -1) {
                    if (sprite.overlapHandler) {
                        pushOverlapEvent(
                            higher,
                            lower,
                            () => sprite.overlapHandler(overlapper)
                        );
                    }

                    scene.overlapHandlers
                        .filter(h => h.kind === sprite.kind() && h.otherKind === overlapper.kind())
                        .forEach(h => {
                            pushOverlapEvent(
                                higher,
                                lower,
                                () => h.handler(sprite, overlapper)
                            );
                        });
                }
            }

            events.forEach(e => control.runInParallel(e));
        }

        function applyHorizontalTileMapMovement(sprite: Sprite, xDiff: Fx8, yDiff: Fx8) {
            const right = xDiff > Fx.zeroFx8;
            const x0 = Fx.toIntShifted(
                Fx.add(
                    right ?
                        Fx.iadd(1, sprite._hitbox.right)
                        :
                        sprite._hitbox.left,
                    Fx.oneHalfFx8
                ),
                tileScale
            );

            for (
                let y = Fx.sub(sprite._hitbox.top, yDiff);
                y < Fx.iadd(tileSize, Fx.sub(sprite._hitbox.bottom, yDiff));
                y = Fx.iadd(tileSize, y)
            ) {
                const y0 = Fx.toIntShifted(
                    Fx.add(
                        Fx.min(
                            y,
                            Fx.sub(
                                sprite._hitbox.bottom,
                                yDiff
                            )
                        ),
                        Fx.oneHalfFx8
                    ),
                    tileScale
                );

                if (tm.isObstacle(x0, y0)) {
                    if (sprite.flags & sprites.Flag.BounceOnWall) {
                        sprite._vx = Fx.neg(sprite._vx);
                    }
                    sprite._x = Fx.iadd(
                        -sprite._hitbox.ox,
                        right ?
                            Fx.sub(
                                Fx8(x0 << tileScale),
                                Fx8(sprite._hitbox.width)
                            )
                            :
                            Fx8((x0 + 1) << tileScale)
                    );

                    spriteHitObstacle(sprite, right ? CollisionDirection.Right : CollisionDirection.Left, x0, y0);
                    return;
                }
            }
        }

        function applyVerticalTileMapMovement(sprite: Sprite, xDiff: Fx8, yDiff: Fx8) {
            const down = yDiff > Fx.zeroFx8;
            const y0 = Fx.toIntShifted(
                Fx.add(
                    down ?
                        Fx.iadd(
                            1,
                            sprite._hitbox.bottom
                        )
                        :
                        sprite._hitbox.top,
                    Fx.oneHalfFx8
                ),
                tileScale
            );

            for (
                let x = sprite._hitbox.left;
                x < Fx.iadd(tileSize, sprite._hitbox.right);
                x = Fx.iadd(tileSize, x)
            ) {
                const x0 = Fx.toIntShifted(
                    Fx.add(
                        Fx.min(
                            x,
                            sprite._hitbox.right
                        ),
                        Fx.oneHalfFx8
                    ),
                    tileScale
                );

                if (tm.isObstacle(x0, y0)) {
                    if (sprite.flags & sprites.Flag.BounceOnWall) {
                        sprite._vy = Fx.neg(sprite._vy);
                    }
                    sprite._y = Fx.iadd(
                        -sprite._hitbox.oy,
                        down ?
                            Fx.sub(
                                Fx8(y0 << tileScale),
                                Fx8(sprite._hitbox.height)
                            )
                            :
                            Fx8((y0 + 1) << tileScale)
                    );

                    spriteHitObstacle(sprite, down ? CollisionDirection.Bottom : CollisionDirection.Top, x0, y0);
                    return;
                }
            }
        }

        function spriteHitObstacle(sprite: Sprite, dir: CollisionDirection, x: number, y: number) {
            sprite.registerObstacle(dir, tm.getObstacle(x, y));
            if (sprite.flags & sprites.Flag.DestroyOnWall) {
                sprite.destroy();
            }
        }

        for (const sprite of colliders) {
            const overSprites = this.overlaps(sprite);

            applySpriteOverlapHandlers(sprite, overSprites);
            sprite.clearObstacles();

            if (tm && tm.enabled) {
                const xDiff = Fx.sub(
                    sprite._x,
                    sprite._lastX
                );

                const yDiff = Fx.sub(
                    sprite._y,
                    sprite._lastY
                );

                if (xDiff !== Fx.zeroFx8) {
                    applyHorizontalTileMapMovement(sprite, xDiff, yDiff);
                }

                if (yDiff !== Fx.zeroFx8) {
                    applyVerticalTileMapMovement(sprite, xDiff, yDiff);
                }
            }
        }

    }

    private collidableSprites(): Sprite[] {
        const colliders = this.sprites.filter(sprite => !(sprite.flags & sprites.Flag.Ghost));

        if (colliders.length < 10) {
            // not enough sprite, just brute force it
            this.map = undefined;
        } else {
            if (!this.map) this.map = new sprites.SpriteMap();
            this.map.update(colliders);
        }

        return colliders;
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

    public moveSprite(s: Sprite, dx: Fx8, dy: Fx8) {
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
