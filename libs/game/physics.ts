class PhysicsEngine {
    constructor() {
    }

    /**
     * Adds sprite to the physics
     * @param sprite
     */
    addSprite(sprite: Sprite) { }

    removeSprite(sprite: Sprite) { }

    /** move a single sprite **/
    moveSprite(s: Sprite, dx: Fx8, dy: Fx8) { }

    draw() { }

    /** Apply physics and collisions to all sprites **/
    move(dt: number) { }

    setMaxSpeed(speed: number) { }

    overlaps(sprite: Sprite): Sprite[] { return []; }
}

const MAX_TIME_STEP = Fx8(100); // milliseconds
const SPRITE_CANNOT_COLLIDE = sprites.Flag.Ghost | sprites.Flag.Destroyed;
const MIN_MOVE_GAP = Fx8(0.1);

class MovingSprite {
    constructor(
        public sprite: Sprite,
        // vx and vy when last updated
        public cachedVx: Fx8,
        public cachedVy: Fx8,
        // remaining x
        public dx: Fx8,
        public dy: Fx8,
        // how much to move per step
        public xStep: Fx8,
        public yStep: Fx8
    ) { }
}

/**
 * A physics engine that does simple AABB bounding box check
 */
class ArcadePhysicsEngine extends PhysicsEngine {
    protected sprites: Sprite[];
    protected map: sprites.SpriteMap;
    protected maxVelocity: Fx8;
    protected maxNegativeVelocity: Fx8;
    protected minSingleStep: Fx8;
    protected maxSingleStep: Fx8;

    constructor(maxVelocity = 500, minSingleStep = 2, maxSingleStep = 4) {
        super();
        this.sprites = [];
        this.map = new sprites.SpriteMap();
        this.maxSpeed = maxVelocity;
        this.maxStep = maxSingleStep;
        this.minStep = minSingleStep;
    }

    get maxSpeed(): number {
        return Fx.toInt(this.maxVelocity);
    }

    set maxSpeed(v: number) {
        this.maxVelocity = Fx8(v);
        this.maxNegativeVelocity = Fx.neg(this.maxVelocity);
    }

    get minStep(): number {
        return Fx.toInt(this.minSingleStep);
    }

    set minStep(v: number) {
        this.minSingleStep = Fx8(v);
    }

    get maxStep(): number {
        return Fx.toInt(this.maxSingleStep);
    }

    set maxStep(v: number) {
        this.maxSingleStep = Fx8(v);
    }

    setMaxSpeed(v: number) {
        this.maxSpeed = v;
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

        const scene = game.currentScene();

        const movingSprites = this.sprites
            .map(sprite => this.createMovingSprite(sprite, dtSec, dt2));
        const tileMap = scene.tileMap;

        // clear obstacles if moving on that axis
        this.sprites.forEach(s => {
            if (s.vx || s.vy) s.clearObstacles();
        });

        this.map.clear();
        this.map.resizeBuckets(this.sprites);

        const MAX_STEP_COUNT = Fx.toInt(
            Fx.mul(
                Fx.div(
                    this.maxVelocity,
                    this.minSingleStep
                ),
                dtSec
            )
        );
        const overlapHandlers = scene.overlapHandlers.slice();

        // buffers store the moving sprites on each step; switch back and forth between the two
        let selected = 0;
        let buffers = [movingSprites, []];
        for (let count = 0; count < MAX_STEP_COUNT && buffers[selected].length !== 0; ++count) {
            const currMovers = buffers[selected];
            selected ^= 1;
            const remainingMovers = buffers[selected];

            for (let ms of currMovers) {
                const s = ms.sprite;
                // if still moving and speed has changed from a collision or overlap;
                // reverse direction if speed has reversed
                if (ms.cachedVx !== s._vx) {
                    if (s._vx == Fx.zeroFx8) {
                        ms.dx = Fx.zeroFx8;
                    } else if (s._vx < Fx.zeroFx8 && ms.cachedVx > Fx.zeroFx8
                            || s._vx > Fx.zeroFx8 && ms.cachedVx < Fx.zeroFx8) {
                        ms.dx = Fx.neg(ms.dx);
                        ms.xStep = Fx.neg(ms.xStep);
                    }

                    ms.cachedVx = s._vx;
                }
                if (ms.cachedVy !== s._vy) {
                    if (s._vy == Fx.zeroFx8) {
                        ms.dy = Fx.zeroFx8;
                    } else if (s._vy < Fx.zeroFx8 && ms.cachedVy > Fx.zeroFx8
                            || s._vy > Fx.zeroFx8 && ms.cachedVy < Fx.zeroFx8) {
                        ms.dy = Fx.neg(ms.dy);
                        ms.yStep = Fx.neg(ms.yStep);
                    }

                    ms.cachedVy = s._vy;
                }

                // identify how much to move in this step
                const stepX = Fx.abs(ms.xStep) > Fx.abs(ms.dx) ? ms.dx : ms.xStep;
                const stepY = Fx.abs(ms.yStep) > Fx.abs(ms.dy) ? ms.dy : ms.yStep;
                ms.dx = Fx.sub(ms.dx, stepX);
                ms.dy = Fx.sub(ms.dy, stepY);

                s._lastX = s._x;
                s._lastY = s._y;
                s._x = Fx.add(s._x, stepX);
                s._y = Fx.add(s._y, stepY);

                // if the sprite can collide with things, check tile map
                // and add to collision detection
                if (!(s.flags & SPRITE_CANNOT_COLLIDE)) {
                    this.map.insertAABB(s);
                    if (tileMap && tileMap.enabled) {
                        this.tilemapCollisions(ms, tileMap);
                    }
                }

                // if sprite still needs to move, add it to the next step of movements
                if (Fx.abs(ms.dx) > MIN_MOVE_GAP || Fx.abs(ms.dy) > MIN_MOVE_GAP) {
                    remainingMovers.push(ms);
                }
            }

            // this step is done; check collisions between sprites
            this.spriteCollisions(currMovers, overlapHandlers);
            // clear moving sprites buffer for next step
            while (currMovers.length) currMovers.pop();
        }
    }

    private createMovingSprite(sprite: Sprite, dtSec: Fx8, dt2: Fx8): MovingSprite {
        const ovx = this.constrain(sprite._vx);
        const ovy = this.constrain(sprite._vy);
        sprite._lastX = sprite._x;
        sprite._lastY = sprite._y;

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

        // make step increments smaller until under max step size
        while (Fx.abs(xStep) > this.maxSingleStep || Fx.abs(yStep) > this.maxSingleStep) {
            if (Fx.abs(xStep) > this.minSingleStep) {
                xStep = Fx.idiv(xStep, 2);
            }
            if (Fx.abs(yStep) > this.minSingleStep) {
                yStep = Fx.idiv(yStep, 2);
            }
        }

        return new MovingSprite(
            sprite,
            sprite._vx,
            sprite._vy,
            dx,
            dy,
            xStep,
            yStep
        );
    }

    private spriteCollisions(movedSprites: MovingSprite[], handlers: scene.OverlapHandler[]) {
        control.enablePerfCounter("phys_collisions");
        if (!handlers.length) return;

        // sprites that have moved this step
        for (const ms of movedSprites) {
            const sprite = ms.sprite;
            if (sprite.flags & SPRITE_CANNOT_COLLIDE) continue;
            const overSprites = this.map.overlaps(ms.sprite);

            for (const overlapper of overSprites) {
                if (overlapper.flags & SPRITE_CANNOT_COLLIDE) continue;
                const thisKind = sprite.kind();
                const otherKind = overlapper.kind();

                // skip if no overlap event between these two kinds of sprites
                if (sprite._kindsOverlappedWith.indexOf(otherKind) === -1) continue;

                // Maintaining invariant that the sprite with the higher ID has the other sprite as an overlapper
                const higher = sprite.id > overlapper.id ? sprite : overlapper;
                const lower = higher === sprite ? overlapper : sprite;

                // if the two sprites are not currently engaged in an overlap event,
                // apply all matching overlap events
                if (higher._overlappers.indexOf(lower.id) === -1) {
                    handlers
                        .filter(h => (h.kind === thisKind && h.otherKind === otherKind)
                                    || (h.kind === otherKind && h.otherKind === thisKind)
                        )
                        .forEach(h => {
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
                        Fx.iadd(-1, sprite._hitbox.left),
                    Fx.oneHalfFx8
                ),
                tileScale
            );
            const collidedTiles: sprites.StaticObstacle[] = [];

            // check collisions with tiles sprite is moving towards horizontally
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
                    const obstacle = tm.getObstacle(x0, y0);
                    if (!collidedTiles.some(o => o.tileIndex === obstacle.tileIndex)) {
                        collidedTiles.push(obstacle);
                    }
                }
            }

            if (collidedTiles.length) {
                const collisionDirection = right ? CollisionDirection.Right : CollisionDirection.Left;
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

                for (const tile of collidedTiles) {
                    sprite.registerObstacle(collisionDirection, tile);
                }

                if (sprite.flags & sprites.Flag.DestroyOnWall) {
                    sprite.destroy();
                } else if (sprite._vx === movingSprite.cachedVx){
                    // sprite collision event didn't change velocity in this direction;
                    // apply normal updates
                    if (sprite.flags & sprites.Flag.BounceOnWall) {
                        if ((!right && sprite.vx < 0) || (right && sprite.vx > 0)) {
                            sprite._vx = Fx.neg(sprite._vx);
                            movingSprite.xStep = Fx.neg(movingSprite.xStep);
                            movingSprite.dx = Fx.neg(movingSprite.dx);
                        }
                    } else {
                        movingSprite.dx = Fx.zeroFx8;
                        sprite._vx = Fx.zeroFx8;
                    }
                } else if (Math.sign(Fx.toInt(sprite._vx)) === Math.sign(Fx.toInt(movingSprite.cachedVx))) {
                    // sprite collision event changed velocity,
                    // but still facing same direction; prevent further movement this update.
                    movingSprite.dx = Fx.zeroFx8;
                }
            }
        }

        if (yDiff !== Fx.zeroFx8) {
            const down = yDiff > Fx.zeroFx8;
            const y0 = Fx.toIntShifted(
                Fx.add(
                    down ?
                        Fx.iadd(1, sprite._hitbox.bottom)
                        :
                        Fx.iadd(-1, sprite._hitbox.top),
                    Fx.oneHalfFx8
                ),
                tileScale
            );
            const collidedTiles: sprites.StaticObstacle[] = [];

            // check collisions with tiles sprite is moving towards vertically
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
                    const obstacle = tm.getObstacle(x0, y0);
                    if (!collidedTiles.some(o => o.tileIndex === obstacle.tileIndex)) {
                        collidedTiles.push(obstacle);
                    }
                }
            }

            if (collidedTiles.length) {
                const collisionDirection = down ? CollisionDirection.Bottom : CollisionDirection.Top;
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

                for (const tile of collidedTiles) {
                    sprite.registerObstacle(collisionDirection, tile);
                }

                if (sprite.flags & sprites.Flag.DestroyOnWall) {
                    sprite.destroy();
                } else if (sprite._vy === movingSprite.cachedVy) {
                    // sprite collision event didn't change velocity in this direction;
                    // apply normal updates
                    if (sprite.flags & sprites.Flag.BounceOnWall) {
                        if ((!down && sprite.vy < 0) || (down && sprite.vy > 0)) {
                            sprite._vy = Fx.neg(sprite._vy);
                            movingSprite.yStep = Fx.neg(movingSprite.yStep);
                            movingSprite.dy = Fx.neg(movingSprite.dy);
                        }
                    } else {
                        movingSprite.dy = Fx.zeroFx8;
                        sprite._vy = Fx.zeroFx8;
                    }
                } else if (Math.sign(Fx.toInt(sprite._vy)) === Math.sign(Fx.toInt(movingSprite.cachedVy))) {
                    // sprite collision event changed velocity,
                    // but still facing same direction; prevent further movement this update.
                    movingSprite.dy = Fx.zeroFx8;
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

    /** moves a sprite explicitly outside of the normal velocity changes **/
    public moveSprite(s: Sprite, dx: Fx8, dy: Fx8) {
        s._lastX = s._x;
        s._lastY = s._y;
        s._x = Fx.add(s._x, dx);
        s._y = Fx.add(s._y, dy);

        // if the sprite can collide with things, check tile map
        if (!(s.flags & SPRITE_CANNOT_COLLIDE)) {
            const tm = game.currentScene().tileMap;
            if (!(tm && tm.enabled)) return;

            const tileSize = 1 << tm.scale;
            // only check tile map if moving within a single tile
            if (Math.abs(Fx.toInt(dx)) < tileSize && Math.abs(Fx.toInt(dy)) < tileSize) {
                const ms = new MovingSprite(
                    s,
                    s._vx,
                    s._vy,
                    dx,
                    dy,
                    dx,
                    dy
                );
                this.tilemapCollisions(ms, tm);
            }
        }
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
