interface IPhysicsEngine {
    /**
     * Adds sprite to the physics
     * @param sprite sprite to add
     */
    addSprite(sprite: Sprite): void;

    /**
     * Removes the sprite from being tracked by the physics engine
     * @param sprite sprite to remove
     */
    removeSprite(sprite: Sprite): void;

    /**
     * Moves a sprite explicitly outside of the normal velocity changes
     * @param sprite sprite to move
     * @param dx distance to move in x
     * @param dy distance to move in y
     */
    moveSprite(sprite: Sprite, dx: Fx8, dy: Fx8): void;

    /**
     * Draws the buckets used in the sprite map
     */
    draw(): void;

    /**
     * Apply physics and collisions to all sprites
     * @param dt time since last update
     */
    move(dt: number): void;

    /**
     * Allows consumers to change the max speed
     * @param maxSpeed the new max speed
     */
    setMaxSpeed(maxSpeed: number): void;
}

type TileMapCollisionHandler = (ms: MovingSprite, tm: tiles.TileMap, onXAxisCollisionHandler: OnXAxisCollisionHandler, OnYAxisCollisionHandler: OnYAxisCollisionHandler) => void;
type ScreenEdgeCollisionHandler = (ms: MovingSprite, bounce: number, camera: scene.Camera) => void;
type CanResolveClippingHandler = (s: Sprite, tm: tiles.TileMap, maxStep: number) => boolean;
type SpriteCollisionHandler = (movedSprites: MovingSprite[], handlers: scene.OverlapHandler[], spriteMap: sprites.SpriteMap) => void;
type OnXAxisCollisionHandler = (collisionDirection: CollisionDirection, collidedTiles: sprites.StaticObstacle[], s: Sprite, tm: tiles.TileMap, movingSprite: MovingSprite) => void;
type OnYAxisCollisionHandler = (collisionDirection: CollisionDirection, collidedTiles: sprites.StaticObstacle[], s: Sprite, tm: tiles.TileMap, movingSprite: MovingSprite) => void;

class NewArcadePhysicsEngineBuilder {
    private tilemapCollisions: TileMapCollisionHandler;
    private screenEdgeCollisions: ScreenEdgeCollisionHandler;
    private canResolveClipping: CanResolveClippingHandler;
    private spriteCollisions: SpriteCollisionHandler;
    private OnXAxisCollision: OnXAxisCollisionHandler;
    private OnYAxisCollision: OnYAxisCollisionHandler;

    private maxVelocity: number;
    private minSingleStep: number;
    private maxSingleStep: number;

    constructor() {
        this.tilemapCollisions = defaultTilemapCollisions;
        this.screenEdgeCollisions = defaultScreenEdgeCollisions;
        this.canResolveClipping = defaultCanResolveClipping;
        this.spriteCollisions = defaultSpriteCollisions;
        this.OnXAxisCollision = defaultOnXAxisCollision;
        this.OnYAxisCollision = defaultOnYAxisCollision;
        this.maxVelocity = 500;
        this.minSingleStep = 2;
        this.maxSingleStep = 4;
    }

    withTilemapCollisions(tilemapCollisions: TileMapCollisionHandler) {
        this.tilemapCollisions = tilemapCollisions;
        return this;
    }

    withScreenEdgeCollisions(screenEdgeCollisions: ScreenEdgeCollisionHandler) {
        this.screenEdgeCollisions = screenEdgeCollisions;
        return this;
    }

    withCanResolveClipping(canResolveClipping: CanResolveClippingHandler) {
        this.canResolveClipping = canResolveClipping;
        return this;
    }

    withSpriteCollisions(spriteCollisions: SpriteCollisionHandler) {
        this.spriteCollisions = spriteCollisions;
        return this;
    }

    withOnXAxisCollision(OnXAxisCollision: OnXAxisCollisionHandler) {
        this.OnXAxisCollision = OnXAxisCollision;
        return this;
    }

    withMaxVelocity(maxVelocity: number) {
        this.maxVelocity = maxVelocity;
        return this;
    }

    withMinSingleStep(minSingleStep: number) {
        this.minSingleStep = minSingleStep;
        return this;
    }

    withMaxSingleStep(maxSingleStep: number) {
        this.maxSingleStep = maxSingleStep;
        return this;
    }

    /**
     * Creates a new physics engine
     */
    create(): IPhysicsEngine {
        return new NewArcadePhysicsEngine(
            this.tilemapCollisions,
            this.screenEdgeCollisions,
            this.canResolveClipping,
            this.spriteCollisions,
            this.OnXAxisCollision,
            this.OnYAxisCollision,
            this.maxVelocity,
            this.minSingleStep,
            this.maxSingleStep,
        );
    }
}

class NewArcadePhysicsEngine implements IPhysicsEngine {
    private sprites: Sprite[];
    private map: sprites.SpriteMap;
    private maxVelocity: Fx8;
    private maxNegativeVelocity: Fx8;
    private minSingleStep: Fx8;
    private maxSingleStep: Fx8;

    constructor(
        private readonly tilemapCollisions: TileMapCollisionHandler,
        private readonly screenEdgeCollisions: ScreenEdgeCollisionHandler,
        private readonly canResolveClipping: CanResolveClippingHandler,
        private readonly spriteCollisions: SpriteCollisionHandler,
        private readonly onXAxisCollision: OnXAxisCollisionHandler,
        private readonly onYAxisCollision: OnYAxisCollisionHandler,
        maxVelocity = 500,
        minSingleStep = 2,
        maxSingleStep = 4
    ) {
        this.sprites = [];
        this.map = new sprites.SpriteMap();
        this.maxSpeed = maxVelocity;
        this.maxStep = maxSingleStep;
        this.minStep = minSingleStep;
    }

    //#region helpers
    private get maxSpeed(): number {
        return Fx.toInt(this.maxVelocity);
    }

    private set maxSpeed(v: number) {
        this.maxVelocity = Fx8(v);
        this.maxNegativeVelocity = Fx.neg(this.maxVelocity);
    }

    private get minStep(): number {
        return Fx.toInt(this.minSingleStep);
    }

    private set minStep(v: number) {
        this.minSingleStep = Fx8(v);
    }

    private get maxStep(): number {
        return Fx.toInt(this.maxSingleStep);
    }

    private set maxStep(v: number) {
        this.maxSingleStep = Fx8(v);
    }
    //#endregion

    setMaxSpeed(maxSpeed: number): void {
        this.maxSpeed = maxSpeed;
    }

    addSprite(sprite: Sprite): void {
        this.sprites.push(sprite);
        const tilemap = game.currentScene().tileMap;

        if (tilemap && tilemap.isOnWall(sprite)) {
            sprite.flags |= sprites.Flag.IsClipping;
        }
    }

    removeSprite(sprite: Sprite): void {
        this.sprites.removeElement(sprite);
    }

    draw(): void {
        this.map.draw();
    }

    moveSprite(sprite: Sprite, dx: Fx8, dy: Fx8): void {
        sprite._lastX = sprite._x;
        sprite._lastY = sprite._y;
        sprite._x = Fx.add(sprite._x, dx);
        sprite._y = Fx.add(sprite._y, dy);

        // if the sprite can collide with things, check tile map
        const tm = game.currentScene().tileMap;
        if (tm && tm.enabled) {
            const maxDist = Fx.toInt(this.maxSingleStep);
            // only check tile map if moving within a single step
            if (Math.abs(Fx.toInt(dx)) <= maxDist && Math.abs(Fx.toInt(dy)) <= maxDist) {
                const ms = new MovingSprite(
                    sprite,
                    sprite._vx,
                    sprite._vy,
                    dx,
                    dy,
                    dx,
                    dy
                );
                this.tilemapCollisions(ms, tm, this.onXAxisCollision, this.onYAxisCollision);
                // otherwise, accept movement...
            } else if (tm.isOnWall(sprite) && !this.canResolveClipping(sprite, tm, this.maxStep)) {
                // if no luck, flag as clipping into a wall
                sprite.flags |= sprites.Flag.IsClipping;
            } else {
                // or clear clipping if no longer clipping
                sprite.flags &= ~sprites.Flag.IsClipping;
            }
        }
    }

    move(dt: number): void {
        // Sprite movement logic is done in milliseconds to avoid rounding errors with Fx8 numbers
        const dtMs = Math.min(MAX_TIME_STEP, dt * 1000);
        const dt2 = Math.idiv(dtMs, 2);

        const scene = game.currentScene();

        const tileMap = scene.tileMap;
        const movingSprites = this.sprites
            .map(sprite => this.createMovingSprite(sprite, dtMs, dt2));

        // clear obstacles if moving on that axis
        this.sprites.forEach(s => {
            if (s.vx || s.vy) s.clearObstacles();
        });

        this.map.clear();
        this.map.resizeBuckets(this.sprites);

        const MAX_STEP_COUNT = Fx.toInt(
            Fx.idiv(
                Fx.imul(
                    Fx.div(
                        this.maxVelocity,
                        this.minSingleStep
                    ),
                    dtMs
                ),
                1000
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

                if (!(s.flags & SPRITE_NO_SPRITE_OVERLAPS)) {
                    this.map.insertAABB(s);
                }
                if (tileMap && tileMap.enabled) {
                    this.tilemapCollisions(ms, tileMap, this.onXAxisCollision, this.onYAxisCollision);
                }

                // check for screen edge collisions
                const bounce = s.flags & sprites.Flag.BounceOnWall;
                if (s.flags & sprites.Flag.StayInScreen || (bounce && !tileMap)) {
                    this.screenEdgeCollisions(ms, bounce, scene.camera);
                }

                // if sprite still needs to move, add it to the next step of movements
                if (Fx.abs(ms.dx) > MIN_MOVE_GAP || Fx.abs(ms.dy) > MIN_MOVE_GAP) {
                    remainingMovers.push(ms);
                }
            }

            // this step is done; check collisions between sprites
            this.spriteCollisions(currMovers, overlapHandlers, this.map);
            // clear moving sprites buffer for next step
            while (currMovers.length) currMovers.pop();
        }
    }

    private createMovingSprite(sprite: Sprite, dtMs: number, dt2: number): MovingSprite {
        const ovx = this.constrain(sprite._vx);
        const ovy = this.constrain(sprite._vy);
        sprite._lastX = sprite._x;
        sprite._lastY = sprite._y;

        if (sprite._ax) {
            sprite._vx = Fx.add(
                sprite._vx,
                Fx.idiv(
                    Fx.imul(
                        sprite._ax,
                        dtMs
                    ),
                    1000
                )
            );
        } else if (sprite._fx) {
            const fx = Fx.idiv(
                Fx.imul(
                    sprite._fx,
                    dtMs
                ),
                1000
            );
            const c = Fx.compare(sprite._vx, fx);
            if (c < 0) // v < f, v += f
                sprite._vx = Fx.min(Fx.zeroFx8, Fx.add(sprite._vx, fx));
            else if (c > 0) // v > f, v -= f
                sprite._vx = Fx.max(Fx.zeroFx8, Fx.sub(sprite._vx, fx));
            else
                sprite._vx = Fx.zeroFx8
        }

        if (sprite._ay) {
            sprite._vy = Fx.add(
                sprite._vy,
                Fx.idiv(
                    Fx.imul(
                        sprite._ay,
                        dtMs
                    ),
                    1000
                )
            );
        } else if (sprite._fy) {
            const fy = Fx.idiv(
                Fx.imul(
                    sprite._fy,
                    dtMs
                ),
                1000
            );
            const c = Fx.compare(sprite._vy, fy);
            if (c < 0) // v < f, v += f
                sprite._vy = Fx.min(Fx.zeroFx8, Fx.add(sprite._vy, fy));
            else if (c > 0) // v > f, v -= f
                sprite._vy = Fx.max(Fx.zeroFx8, Fx.sub(sprite._vy, fy));
            else
                sprite._vy = Fx.zeroFx8;
        }

        sprite._vx = this.constrain(sprite._vx);
        sprite._vy = this.constrain(sprite._vy);

        const dx = Fx8(Fx.toFloat(Fx.add(sprite._vx, ovx)) * dt2 / 1000);
        const dy = Fx8(Fx.toFloat(Fx.add(sprite._vy, ovy)) * dt2 / 1000);

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

 function defaultTilemapCollisions(
    movingSprite: MovingSprite,
    tm: tiles.TileMap,
    onXAxisCollisionHandler: OnXAxisCollisionHandler,
    OnYAxisCollisionHandler: OnYAxisCollisionHandler
) {
    const s = movingSprite.sprite;
    // if the sprite is already clipping into a wall,
    // allow free movement rather than randomly 'fixing' it
    if (s.flags & sprites.Flag.IsClipping) {
        if (!tm.isOnWall(s)) {
            s.flags &= ~sprites.Flag.IsClipping;
        }
    }

    // get hitbox
    if (!s.isStatic()) s.setHitbox();
    const hbox = s._hitbox;

    // get tile map scale and size
    const tileScale = tm.scale;
    const tileSize = 1 << tileScale;

    // get the difference in x and y
    const xDiff = Fx.sub(
        s._x,
        s._lastX
    );

    const yDiff = Fx.sub(
        s._y,
        s._lastY
    );

    // check for collisions with walls
    if (!(s.flags & SPRITE_NO_WALL_COLLISION)) {

        // check for collisions with tiles sprite is moving towards horizontally
        if (xDiff !== Fx.zeroFx8) {
            const right = xDiff > Fx.zeroFx8;

            const tileColumn = Fx.toIntShifted(
                Fx.add(
                    right ?
                        Fx.add(hbox.right, Fx.oneFx8)
                        :
                        Fx.sub(hbox.left, Fx.oneFx8),
                    Fx.oneHalfFx8
                ),
                tileScale
            );

            const collidedTiles = tm.getXAxisCollisions(tileColumn, yDiff, hbox, tileScale, tileSize);

            // if there are collisions, resolve them and update sprite velocity
            if (collidedTiles.length) {
                const collisionDirection = right ? CollisionDirection.Right : CollisionDirection.Left;

                s._x = Fx.sub(
                    right ?
                        Fx.sub(
                            Fx8(tileColumn << tileScale),
                            hbox.width
                        )
                        :
                        Fx8((tileColumn + 1) << tileScale),
                    hbox.ox
                );

                onXAxisCollisionHandler(collisionDirection, collidedTiles, s, tm, movingSprite);
            }
        }

        if (yDiff !== Fx.zeroFx8) {
            const down = yDiff > Fx.zeroFx8;
            const tileRow = Fx.toIntShifted(
                Fx.add(
                    down ?
                        Fx.add(hbox.bottom, Fx.oneFx8)
                        :
                        Fx.sub(hbox.top, Fx.oneFx8),
                    Fx.oneHalfFx8
                ),
                tileScale
            );

            const collidedTiles: sprites.StaticObstacle[] = tm.getYAxisCollisions(
                tileRow,
                Fx.zeroFx8, // we have already moved in x, so the diff isn't applied
                hbox,
                tileScale,
                tileSize
            );

            if (collidedTiles.length) {
                const collisionDirection = down ? CollisionDirection.Bottom : CollisionDirection.Top;
                s._y = Fx.sub(
                    down ?
                        Fx.sub(
                            Fx8(tileRow << tileScale),
                            hbox.height
                        )
                        :
                        Fx8((tileRow + 1) << tileScale),
                    hbox.oy
                );

               OnYAxisCollisionHandler(collisionDirection, collidedTiles, s, tm, movingSprite);
            }
        }
    }
}

// Attempt to resolve clipping by moving the sprite slightly up / down / left / right
function defaultCanResolveClipping(
    s: Sprite,
    tm: tiles.TileMap,
    maxStep: number
) {
    if (!s.isStatic()) s.setHitbox();
    const hbox = s._hitbox;
    const sz = 1 << tm.scale;
    const maxMove = maxStep;
    const origY = s._y;
    const origX = s._x;
    const l = Fx.toInt(hbox.left);
    const r = Fx.toInt(hbox.right);
    const t = Fx.toInt(hbox.top);
    const b = Fx.toInt(hbox.bottom);

    {   // bump up and test;
        const offset = (b + 1) % sz;
        if (offset <= maxMove) {
            s._y = Fx.sub(
                s._y,
                Fx8(offset)
            );
            if (!tm.isOnWall(s)) {
                return true;
            } else {
                s._y = origY;
            }
        }
    }
    {   // bump down and test;
        const offset = (Math.floor(t / sz) + 1) * sz - t;
        if (offset <= maxMove) {
            s._y = Fx.add(
                s._y,
                Fx8(offset)
            );
            if (!tm.isOnWall(s)) {
                return true;
            } else {
                s._y = origY;
            }
        }
    }
    {   // bump left and test;
        const offset = (r + 1) % sz;
        if (offset <= maxMove) {
            s._x = Fx.sub(
                s._x,
                Fx8(offset)
            );
            if (!tm.isOnWall(s)) {
                return true;
            } else {
                s._x = origX;
            }
        }
    }
    {   // bump right and test;
        const offset = (Math.floor(l / sz) + 1) * sz - l;
        if (offset <= maxMove) {
            s._x = Fx.add(
                s._x,
                Fx8(offset)
            );
            if (!tm.isOnWall(s)) {
                return true;
            } else {
                s._x = origX;
            }
        }
    }

    // no trivial adjustment worked; it's going to clip for now
    return false;
}

function defaultScreenEdgeCollisions(movingSprite: MovingSprite, bounce: number, camera: scene.Camera) {
    let s = movingSprite.sprite;
    if (!s.isStatic()) s.setHitbox();
    if (!camera.isUpdated()) camera.update();

    let offset = Fx.toFloat(s._hitbox.left) - camera.offsetX;
    if (offset < 0) {
        s.left -= offset;
        if (bounce) s.vx = -s.vx;
    }
    else if ((offset = Fx.toFloat(s._hitbox.right) - camera.offsetX - screen.width) > 0) {
        s.right -= offset;
        if (bounce) s.vx = -s.vx;
    }
    if ((offset = Fx.toFloat(s._hitbox.top) - camera.offsetY) < 0) {
        s.top -= offset;
        if (bounce) s.vy = -s.vy;
    }
    else if ((offset = Fx.toFloat(s._hitbox.bottom) - camera.offsetY - screen.height) > 0) {
        s.bottom -= offset;
        if (bounce) s.vy = -s.vy;
    }
}

 function defaultSpriteCollisions (
    movedSprites: MovingSprite[],
    handlers: scene.OverlapHandler[],
    map: sprites.SpriteMap
) {
    control.enablePerfCounter("phys_collisions");
    if (!handlers.length) return;

    // sprites that have moved this step
    for (const ms of movedSprites) {
        const sprite = ms.sprite;
        if (sprite.flags & SPRITE_NO_SPRITE_OVERLAPS) continue;
        const overSprites = map.overlaps(ms.sprite);

        for (const overlapper of overSprites) {
            if (overlapper.flags & SPRITE_NO_SPRITE_OVERLAPS) continue;
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
                            if (!((sprite.flags | overlapper.flags) & SPRITE_NO_SPRITE_OVERLAPS)) {
                                h.handler(
                                    thisKind === h.kind ? sprite : overlapper,
                                    thisKind === h.kind ? overlapper : sprite
                                );
                            }
                            higher._overlappers.removeElement(lower.id);
                        });
                    });
            }
        }
    }
}

function defaultOnXAxisCollision (
    collisionDirection: CollisionDirection,
    collidedTiles: sprites.StaticObstacle[],
    s: Sprite,
    tm: tiles.TileMap,
    movingSprite: MovingSprite
) {
    for (const tile of collidedTiles) {
        // We must check the flag again, as the sprite may have changed it in a collision handler
        if(!(s.flags & SPRITE_NO_WALL_COLLISION)) {
            s.runUserCollisionHandlers(collisionDirection, tile, tm);
        }
    }

    if (s.flags & sprites.Flag.DestroyOnWall) {
        s.destroy();
    } else if (s._vx === movingSprite.cachedVx && !(s.flags & SPRITE_NO_WALL_COLLISION)) {
        // sprite collision event didn't change velocity in this direction;
        // apply normal updates

        if (s.flags & sprites.Flag.BounceOnWall) {
            // If the sprite can bounce, reverse the velocity
            if (
                (!(collisionDirection === CollisionDirection.Right) && s.vx < 0) || (collisionDirection === CollisionDirection.Right && s.vx > 0)
            ) {
                s._vx = Fx.neg(s._vx);
                movingSprite.xStep = Fx.neg(movingSprite.xStep);
                movingSprite.dx = Fx.neg(movingSprite.dx);
            }
        } else {
            movingSprite.dx = Fx.zeroFx8;
            s._vx = Fx.zeroFx8;
        }
    } else if (Math.sign(Fx.toInt(s._vx)) === Math.sign(Fx.toInt(movingSprite.cachedVx))) {
        // sprite collision event changed velocity,
        // but still facing same direction; prevent further movement this update.
        movingSprite.dx = Fx.zeroFx8;
    }
}

function defaultOnYAxisCollision(collisionDirection: CollisionDirection, collidedTiles: sprites.StaticObstacle[], s: Sprite, tm: tiles.TileMap, movingSprite: MovingSprite) {
    for (const tile of collidedTiles) {
        if(!(s.flags & SPRITE_NO_WALL_COLLISION)) {
            s.runUserCollisionHandlers(collisionDirection, tile, tm);
        }
    }

    if (s.flags & sprites.Flag.DestroyOnWall) {
        s.destroy();
    } else if (s._vy === movingSprite.cachedVy && !(s.flags & SPRITE_NO_WALL_COLLISION)) {
        // sprite collision event didn't change velocity in this direction;
        // apply normal updates
        if (s.flags & sprites.Flag.BounceOnWall) {
            if (
                (!(collisionDirection === CollisionDirection.Bottom) && s.vy < 0) ||
                (collisionDirection === CollisionDirection.Bottom && s.vy > 0)
            ) {
                s._vy = Fx.neg(s._vy);
                movingSprite.yStep = Fx.neg(movingSprite.yStep);
                movingSprite.dy = Fx.neg(movingSprite.dy);
            }
        } else {
            movingSprite.dy = Fx.zeroFx8;
            s._vy = Fx.zeroFx8;
        }
    } else if (Math.sign(Fx.toInt(s._vy)) === Math.sign(Fx.toInt(movingSprite.cachedVy))) {
        // sprite collision event changed velocity,
        // but still facing same direction; prevent further movement this update.
        movingSprite.dy = Fx.zeroFx8;
    }
}