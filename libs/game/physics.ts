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

    /** Apply physics and collisions */
    move(dt: number) { }

    overlaps(sprite: Sprite): Sprite[] { return []; }
}

const MAX_TIME_STEP = Fx8(100); // milliseconds
const MIN_SINGLE_STEP = Fx.twoFx8; // pixels

interface MovingSprite {
    sprite: Sprite;

    // remaining x
    dx: Fx8;
    dy: Fx8;

    // how much to move per step
    xStep: Fx8;
    yStep: Fx8;
}

/**
 * A physics engine that does simple AABB bounding box check
 */
class ArcadePhysicsEngine extends PhysicsEngine {
    protected sprites: Sprite[];
    protected map: sprites.SpriteMap;
    private maxVelocity: Fx8;
    private maxNegativeVelocity: Fx8;
    private maxSingleStep: Fx8

    constructor(maxVelocity = 500, maxSingleStep = 4) {
        super();
        this.sprites = [];
        this.maxVelocity = Fx8(maxVelocity);
        this.maxNegativeVelocity = Fx.neg(this.maxVelocity);
        this.map = new sprites.SpriteMap();
        this.maxSingleStep = Fx8(maxSingleStep);
    }

    addSprite(sprite: Sprite) {
        this.sprites.push(sprite);
    }

    removeSprite(sprite: Sprite) {
        this.sprites.removeElement(sprite);
    }

    draw() {
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

        const movingSprites = this.sprites
            .map(sprite => this.createMovingSprite(sprite, dtSec, dt2));
        const tileMap = game.currentScene().tileMap;

        this.map.clear();
        this.map.resizeBuckets(this.sprites);

        let selected = 0;
        let buffers = [movingSprites, []];
        while (buffers[selected].length) {
            const currMovers = buffers[selected];
            const remainingMovers = buffers[selected ^ 1];

            for (let s of currMovers) {
                const stepX = Fx.abs(s.xStep) > Fx.abs(s.dx) ? s.dx : s.xStep;
                const stepY = Fx.abs(s.yStep) > Fx.abs(s.dy) ? s.dy : s.yStep;
                s.dx = Fx.sub(s.dx, stepX);
                s.dy = Fx.sub(s.dy, stepY);
                this.moveSprite(
                    s.sprite,
                    stepX,
                    stepY
                );

                if (!(s.sprite.flags & sprites.Flag.Ghost)) {
                    this.map.insertAABB(s.sprite);
                    if (tileMap && tileMap.enabled) {
                        this.tilemapCollisions(s, tileMap);
                    }
                }

                if (s.dx !== Fx.zeroFx8 || s.dy !== Fx.zeroFx8) {
                    remainingMovers.push(s);
                }
            }

            this.spriteCollisions(buffers[selected]);

            while(currMovers.length) currMovers.pop();
            selected ^= 1;
        }
    }

    private createMovingSprite(sprite: Sprite, dtSec: Fx8, dt2: Fx8): MovingSprite {
        // clear obstacles if moving on that axis
        if (sprite.vx) {
            sprite.clearHorizontalObstacles();
        }
        if (sprite.vy) {
            sprite.clearVerticalObstacles();
        }

        const ovx = this.constrain(sprite._vx);
        const ovy = this.constrain(sprite._vy);

        sprite._vx = this.constrain(
            Fx.add(
                sprite._vx,
                Fx.mul(
                    sprite._ax,
                    dtSec
                )
            )
        );
        sprite._vy = this.constrain(
            Fx.add(
                sprite._vy,
                Fx.mul(
                    sprite._ay,
                    dtSec
                )
            )
        );

        const dx = Fx.idiv(
            Fx.mul(
                Fx.add(
                    sprite._vx,
                    ovx
                ),
                dt2
            ),
            1000
        );

        const dy = Fx.idiv(
            Fx.mul(
                Fx.add(
                    sprite._vy,
                    ovy
                ),
                dt2
            ),
            1000
        );

        let xStep = dx;
        let yStep = dy;

        while (Fx.abs(xStep) > this.maxSingleStep || Fx.abs(yStep) > this.maxSingleStep) {
            if (Fx.abs(xStep) > MIN_SINGLE_STEP) {
                xStep = Fx.idiv(xStep, 2);
            }
            if (Fx.abs(yStep) > MIN_SINGLE_STEP) {
                yStep = Fx.idiv(yStep, 2);
            }
        }

        return {
            sprite: sprite,
            dx: dx,
            dy: dy,
            xStep: xStep,
            yStep: yStep
        };
    }

    private spriteCollisions(movedSprites: MovingSprite[]) {
        control.enablePerfCounter("phys_collisions");
        const handlers = game.currentScene().overlapHandlers;
        if (!handlers.length) return;

        for (const ms of movedSprites) {
            const sprite = ms.sprite;
            if (sprite.flags & sprites.Flag.Ghost) continue;
            const overSprites = this.map.overlaps(ms.sprite);

            for (const overlapper of overSprites) {
                const thisKind = sprite.kind();
                const otherKind = overlapper.kind();

                // skip if no overlap event between these two kinds of sprites
                if (sprite._kindsOverlappedWith.indexOf(otherKind) === -1) continue;

                // Maintaining invariant that the sprite with the higher ID has the other sprite as an overlapper
                const higher = sprite.id > overlapper.id ? sprite : overlapper;
                const lower = higher === sprite ? overlapper : sprite;

                if (higher._overlappers.indexOf(lower.id) === -1) {
                    handlers
                        .filter(h => (h.kind === thisKind && h.otherKind === otherKind)
                                    || (h.kind === otherKind && h.otherKind === thisKind)
                        ).forEach(h => {
                            higher._overlappers.push(lower.id);
                            control.runInParallel(() => {
                                h.handler(
                                    thisKind === h.kind ? sprite : overlapper,
                                    thisKind === h.kind ? overlapper : sprite
                                );
                                higher._overlappers.removeElement(lower.id);
                            });
                        });
                }
            }
        }
    }

    private tilemapCollisions(movingSprite: MovingSprite, tm: tiles.TileMap) {
        const sprite = movingSprite.sprite;
        const tileScale = tm ? tm.scale : 0;
        const tileSize = tm ? 1 << tileScale : 0;

        const xDiff = Fx.sub(
            sprite._x,
            sprite._lastX
        );

        const yDiff = Fx.sub(
            sprite._y,
            sprite._lastY
        );

        if (xDiff !== Fx.zeroFx8) {
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
                    if (sprite.flags & sprites.Flag.DestroyOnWall) {
                        sprite.destroy();
                    } else if (sprite.flags & sprites.Flag.BounceOnWall) {
                        sprite._vx = Fx.neg(sprite._vx);
                        movingSprite.xStep = Fx.neg(movingSprite.xStep);
                        movingSprite.dx = Fx.neg(movingSprite.dx);
                    } else {
                        movingSprite.dx = Fx.zeroFx8;
                        sprite._vx = Fx.zeroFx8;
                    }
                    sprite.registerObstacle(right ? CollisionDirection.Right : CollisionDirection.Left, tm.getObstacle(x0, y0));

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
                    break;
                }
            }
        }

        if (yDiff !== Fx.zeroFx8) {
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
                    if (sprite.flags & sprites.Flag.DestroyOnWall) {
                        sprite.destroy();
                    } else if (sprite.flags & sprites.Flag.BounceOnWall) {
                        sprite._vy = Fx.neg(sprite._vy);
                        movingSprite.yStep = Fx.neg(movingSprite.yStep);
                        movingSprite.dy = Fx.neg(movingSprite.dy);
                    } else {
                        movingSprite.dy = Fx.zeroFx8;
                        sprite._vy = Fx.zeroFx8;
                    }

                    sprite.registerObstacle(down ? CollisionDirection.Bottom : CollisionDirection.Top, tm.getObstacle(x0, y0));

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
                    break;
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
        return this.map.overlaps(sprite);
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
