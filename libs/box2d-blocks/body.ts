namespace box2dblocks {
    export class Body extends Destroyable {
        public fixtures: _FixtureDrawing[] = [];
        public connectedBodies: Body[] = [];
        public destroyed = false;
        public collisionGroup = 0;
        public data: any = {};

        constructor(
            public nativeBody: box2d.Body,
            public id: number,
            public kind: number,
            public type: box2d.BodyType,
            private owner: _SceneState
        ) {
            super();
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="x" callInDebugger
        get x(): number {
            return this.nativeBody.getState().x * PIXELS_PER_METER;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="x"
        set x(value: number) {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setTransform(value / PIXELS_PER_METER, snapshot.y, snapshot.angle);
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="y" callInDebugger
        get y(): number {
            return this.nativeBody.getState().y * PIXELS_PER_METER;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="y"
        set y(value: number) {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setTransform(snapshot.x, value / PIXELS_PER_METER, snapshot.angle);
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="vx" callInDebugger
        get vx(): number {
            return this.nativeBody.getState().velocityX * PIXELS_PER_METER;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="vx"
        set vx(value: number) {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setLinearVelocity(value / PIXELS_PER_METER, snapshot.velocityY);
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="vy" callInDebugger
        get vy(): number {
            return this.nativeBody.getState().velocityY * PIXELS_PER_METER;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="vy"
        set vy(value: number) {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setLinearVelocity(snapshot.velocityX, value / PIXELS_PER_METER);
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="angle (radians)" callInDebugger
        get angle(): number {
            return this.nativeBody.getState().angle;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="angle (radians)"
        set angle(value: number) {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setTransform(snapshot.x, snapshot.y, value);
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="angular velocity" callInDebugger
        get angularVelocity(): number {
            return this.nativeBody.angularVelocity;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="angular velocity"
        set angularVelocity(value: number) {
            this.nativeBody.angularVelocity = value;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="left" callInDebugger
        get left(): number {
            return this.worldBounds()[0] * PIXELS_PER_METER;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="left"
        set left(value: number) {
            this.moveBy(value - this.left, 0);
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="top" callInDebugger
        get top(): number {
            return this.worldBounds()[1] * PIXELS_PER_METER;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="top"
        set top(value: number) {
            this.moveBy(0, value - this.top);
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="right" callInDebugger
        get right(): number {
            return this.worldBounds()[2] * PIXELS_PER_METER;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="right"
        set right(value: number) {
            this.moveBy(value - this.right, 0);
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="bottom" callInDebugger
        get bottom(): number {
            return this.worldBounds()[3] * PIXELS_PER_METER;
        }

        //% group="Physics" blockSetVariable="myBody"
        //% blockCombine block="bottom"
        set bottom(value: number) {
            this.moveBy(0, value - this.bottom);
        }

        destroy(): void {
            if (this.destroyed) return;
            this.destroyed = true;
            this.owner.destroyMouseJointsForBody(this);
            for (let i = 0; i < this.connectedBodies.length; ++i)
                this.connectedBodies[i].connectedBodies.removeElement(this);
            this.connectedBodies = [];
            if (this.nativeBody.valid)
                this.nativeBody.destroy();
            this.fixtures = [];
            this.owner.removeBody(this);
        }

        belongsTo(owner: _SceneState): boolean {
            return this.owner == owner;
        }

        private moveBy(dx: number, dy: number): void {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setTransform(
                snapshot.x + dx / PIXELS_PER_METER,
                snapshot.y + dy / PIXELS_PER_METER,
                snapshot.angle
            );
        }

        private worldBounds(): number[] {
            const snapshot = this.nativeBody.getState();
            let left = snapshot.x;
            let top = snapshot.y;
            let right = snapshot.x;
            let bottom = snapshot.y;
            let hasBounds = false;

            const include = function (x: number, y: number) {
                if (!hasBounds) {
                    left = right = x;
                    top = bottom = y;
                    hasBounds = true;
                } else {
                    left = Math.min(left, x);
                    right = Math.max(right, x);
                    top = Math.min(top, y);
                    bottom = Math.max(bottom, y);
                }
            };

            for (let i = 0; i < this.fixtures.length; ++i) {
                const shape = this.fixtures[i].shape;
                const values = shape.values;
                if (shape.type == ShapeType.Circle) {
                    const x = pointX(snapshot, values[1], values[2]);
                    const y = pointY(snapshot, values[1], values[2]);
                    include(x - values[0], y - values[0]);
                    include(x + values[0], y + values[0]);
                } else if (shape.type == ShapeType.Box) {
                    const halfWidth = values[0];
                    const halfHeight = values[1];
                    const centerX = values[2];
                    const centerY = values[3];
                    const cosine = Math.cos(values[4]);
                    const sine = Math.sin(values[4]);
                    const corners = [-1, -1, 1, -1, 1, 1, -1, 1];
                    for (let j = 0; j < corners.length; j += 2) {
                        const x = corners[j] * halfWidth;
                        const y = corners[j + 1] * halfHeight;
                        const localX = centerX + cosine * x - sine * y;
                        const localY = centerY + sine * x + cosine * y;
                        include(pointX(snapshot, localX, localY), pointY(snapshot, localX, localY));
                    }
                } else {
                    for (let j = 0; j < values.length; j += 2)
                        include(
                            pointX(snapshot, values[j], values[j + 1]),
                            pointY(snapshot, values[j], values[j + 1])
                        );
                }
            }
            return [left, top, right, bottom];
        }

        localAnchor(anchor: JointAnchor): number[] {
            if (anchor.anchor === undefined)
                return [anchor.dx / PIXELS_PER_METER, anchor.dy / PIXELS_PER_METER];

            let left = 0;
            let right = 0;
            let top = 0;
            let bottom = 0;
            let hasBounds = false;

            const include = function (x: number, y: number) {
                if (!hasBounds) {
                    left = right = x;
                    top = bottom = y;
                    hasBounds = true;
                } else {
                    left = Math.min(left, x);
                    right = Math.max(right, x);
                    top = Math.min(top, y);
                    bottom = Math.max(bottom, y);
                }
            };

            for (let i = 0; i < this.fixtures.length; ++i) {
                const shape = this.fixtures[i].shape;
                const values = shape.values;
                if (shape.type == ShapeType.Circle) {
                    include(values[1] - values[0], values[2] - values[0]);
                    include(values[1] + values[0], values[2] + values[0]);
                } else if (shape.type == ShapeType.Box) {
                    const halfWidth = values[0];
                    const halfHeight = values[1];
                    const centerX = values[2];
                    const centerY = values[3];
                    const cosine = Math.cos(values[4]);
                    const sine = Math.sin(values[4]);
                    const corners = [-1, -1, 1, -1, 1, 1, -1, 1];
                    for (let j = 0; j < corners.length; j += 2) {
                        const x = corners[j] * halfWidth;
                        const y = corners[j + 1] * halfHeight;
                        include(centerX + cosine * x - sine * y, centerY + sine * x + cosine * y);
                    }
                } else {
                    for (let j = 0; j < values.length; j += 2)
                        include(values[j], values[j + 1]);
                }
            }

            let x = (left + right) / 2;
            let y = (top + bottom) / 2;
            switch (anchor.anchor) {
                case BodyAnchor.Top:
                    y = top;
                    break;
                case BodyAnchor.Bottom:
                    y = bottom;
                    break;
                case BodyAnchor.Left:
                    x = left;
                    break;
                case BodyAnchor.Right:
                    x = right;
                    break;
                case BodyAnchor.TopLeft:
                    x = left;
                    y = top;
                    break;
                case BodyAnchor.TopRight:
                    x = right;
                    y = top;
                    break;
                case BodyAnchor.BottomLeft:
                    x = left;
                    y = bottom;
                    break;
                case BodyAnchor.BottomRight:
                    x = right;
                    y = bottom;
                    break;
            }
            return [x, y];
        }
    }

    /**
     * Create a body at the center of the screen in the current scene's physics world.
     */
    //% blockId=box2d_blocks_create_body
    //% block="create $type body of kind $kind with $shape"
    //% type.defl=box2d.BodyType.Dynamic
    //% kind.shadow=box2d_blocks_body_kind
    //% kind.defl=PhysicsBodyKind.Body
    //% shape.shadow=box2d_blocks_circle_shape
    //% blockSetVariable=myBody
    //% group="Body" weight=100
    //% blockGap=8
    export function createBody(type: box2d.BodyType, kind: number, shape: PhysicsShape): Body {
        const body = _state().createBody(type, screen.width / 2, screen.height / 2, 0, kind);
        if (shape)
            addShape(body, shape, new PhysicsPoint(0, 0), 0);
        return body;
    }

    /**
     * Creates an empty body at the center of the screen in the current scene's physics world.
     * You can attach shapes to this body later using the addShape function.
     */
    //% blockId=box2d_blocks_create_empty_body
    //% block="create empty $type body of kind $kind"
    //% type.defl=box2d.BodyType.Dynamic
    //% kind.shadow=box2d_blocks_body_kind
    //% kind.defl=PhysicsBodyKind.Body
    //% blockSetVariable=myBody
    //% group="Body" weight=95
    //% blockGap=8
    export function createEmptyBody(type: box2d.BodyType, kind: number): Body {
        return _state().createBody(type, screen.width / 2, screen.height / 2, 0, kind);
    }

    /**
     * Create static ground and walls through a list of world-space points.
     */
    //% blockId=box2d_blocks_create_ground
    //% block="create walls connecting positions $positions||color $color"
    //% positions.shadow=lists_create_with
    //% positions.defl=box2d_blocks_xy_point
    //% color.shadow=colorindexpicker
    //% color.defl=1
    //% blockSetVariable=ground
    //% group="Body" weight=90
    export function createGround(positions: PhysicsPoint[], color: number = 1): Body {
        if (!positions || positions.length < 2)
            throw "Ground and walls need at least two positions.";

        for (let i = 0; i < positions.length; ++i) {
            if (!positions[i])
                throw "Ground and wall positions cannot be empty.";
        }

        const body = _state().createBody(box2d.BodyType.Static, 0, 0, 0, PhysicsBodyKind.Wall);
        addShape(body, chain(positions, false, color), new PhysicsPoint(0, 0), 0, 0, 1, 0, false);
        return body;
    }

    /**
     * Create a static Wall-kind body that follows the current tilemap walls.
     * Destroying the returned body disables tilemap wall synchronization.
     */
    //% blockId=box2d_blocks_create_tilemap_walls
    //% block="create walls from tilemap"
    //% blockSetVariable=tilemapWalls
    //% group="Body" weight=85
    export function createTilemapWalls(): Body {
        return _state().createTilemapWalls();
    }

    //% blockId=box2d_blocks_set_body_flag
    //% block="set $body $flag $enabled"
    //% body.shadow=variables_get body.defl=myBody enabled.shadow=toggleOnOff
    //% group="Body" weight=60
    export function setBodyFlag(body: Body, flag: box2d.BodyFlag, enabled: boolean): void {
        body.nativeBody.setFlag(flag, enabled);
    }

    //% blockId=box2d_blocks_body_kind_of
    //% block="$body kind"
    //% body.shadow=variables_get body.defl=myBody
    //% group="Body" weight=50
    //% blockGap=8
    export function kindOf(body: Body): number {
        return body.kind;
    }

    //% blockId=box2d_blocks_set_body_kind
    //% block="set $body kind $kind=box2d_blocks_body_kind"
    //% body.shadow=variables_get body.defl=myBody
    //% group="Body" weight=45
    export function setBodyKind(body: Body, kind: number): void {
        body.kind = kind;
        _state().updateBodyFilter(body);
    }

    //% blockId=box2d_blocks_destroy_body
    //% block="destroy $body"
    //% body.shadow=variables_get body.defl=myBody
    //% group="Body" weight=30
    //% blockGap=8
    export function destroyBody(body: Body): void {
        if (body) body.destroy();
    }

    //% blockId=box2d_blocks_is_destroyed
    //% block="$body is destroyed"
    //% body.shadow=variables_get body.defl=myBody
    //% group="Body" weight=25
    export function isDestroyed(body: Body): boolean {
        return !body || body.destroyed || !body.nativeBody.valid;
    }


    /**
     * Return the first body whose fixture contains the world-space pixel coordinate.
     */
    //% blockId=box2d_blocks_body_at
    //% block="body at $point"
    //% point.shadow=box2d_blocks_xy_point
    //% group="Body" weight=20
    export function bodyAt(point: PhysicsPoint | Sprite | tiles.Location | Body): Body {
        const owner = _state();
        const worldX = point.x / PIXELS_PER_METER;
        const worldY = point.y / PIXELS_PER_METER;
        for (let i = 0; i < owner.bodies.length; ++i) {
            const body = owner.bodies[i];
            if (body.destroyed || !body.nativeBody.valid)
                continue;
            for (let j = 0; j < body.fixtures.length; ++j) {
                const fixture = body.fixtures[j].fixture;
                if (fixture.valid && fixture.testPoint(worldX, worldY))
                    return body;
            }
        }
        return null;
    }

    /**
     * Run when two bodies begin touching.
     */
    //% blockId=box2d_blocks_on_collision
    //% block="on $body of kind $kind=box2d_blocks_body_kind collides with $otherBody of kind $otherKind=box2d_blocks_body_kind"
    //% draggableParameters="reporter"
    //% blockAllowMultiple=1
    //% group="Collisions" weight=100
    export function onCollision(kind: number, otherKind: number, handler: (body: Body, otherBody: Body) => void): void {
        if (!handler) return;
        _state().handlers.push(new _CollisionHandler(kind, otherKind, handler));
    }

    /**
     * Return whether two bodies have at least one pair of touching fixtures.
     * Sensor contacts count as touching.
     */
    //% blockId=box2d_blocks_bodies_touching
    //% block="$body is touching $otherBody"
    //% body.shadow=variables_get body.defl=myBody
    //% otherBody.shadow=variables_get otherBody.defl=otherBody
    //% group="Collisions" weight=95
    export function bodiesTouching(body: Body, otherBody: Body): boolean {
        const owner = validateBodyPair(body, otherBody);
        if (body == otherBody) return false;

        const contacts = owner.world.getContacts();
        for (let i = 0; i < contacts.length; ++i) {
            const bodyA = owner.findFixture(contacts[i].fixtureA.handle);
            const bodyB = owner.findFixture(contacts[i].fixtureB.handle);
            if ((bodyA == body && bodyB == otherBody) ||
                (bodyA == otherBody && bodyB == body))
                return true;
        }
        return false;
    }

    /**
     * Return whether a physical contact supports this body against gravity.
     * The maximum slope angle is measured in degrees from level ground.
     */
    //% blockId=box2d_blocks_is_on_ground
    //% block="$body is on ground || with maximum slope $maxSlopeAngle degrees"
    //% body.shadow=variables_get body.defl=myBody
    //% maxSlopeAngle.defl=45 maxSlopeAngle.min=0 maxSlopeAngle.max=90
    //% group="Collisions" weight=92
    export function isOnGround(body: Body, maxSlopeAngle: number = 45): boolean {
        const owner = validateBody(body);
        if (maxSlopeAngle < 0 || maxSlopeAngle > 90)
            throw "Maximum slope angle must be from 0 to 90 degrees.";

        const gravityLength = Math.sqrt(
            owner.gravityX * owner.gravityX +
            owner.gravityY * owner.gravityY
        );
        if (gravityLength == 0) return false;
        const gravityX = owner.gravityX / gravityLength;
        const gravityY = owner.gravityY / gravityLength;
        const threshold = -Math.cos(maxSlopeAngle * Math.PI / 180);

        const contacts = owner.world.getContacts();
        for (let i = 0; i < contacts.length; ++i) {
            const bodyA = owner.findFixture(contacts[i].fixtureA.handle);
            const bodyB = owner.findFixture(contacts[i].fixtureB.handle);
            if (bodyA != body && bodyB != body)
                continue;

            const direction = bodyA == body ? -1 : 1;
            const normals = contacts[i].getNormals();
            for (let j = 0; j < normals.length; ++j) {
                const supportX = normals[j].x * direction;
                const supportY = normals[j].y * direction;
                if (supportX * gravityX + supportY * gravityY <= threshold)
                    return true;
            }
        }
        return false;
    }

    /**
     * Return whether a dynamic body is touching two distinct static or
     * kinematic bodies on approximately opposite sides.
     */
    //% blockId=box2d_blocks_is_being_squished
    //% block="$body is being squished||with angle tolerance $angleTolerance degrees"
    //% body.shadow=variables_get body.defl=myBody
    //% angleTolerance.defl=15 angleTolerance.min=0 angleTolerance.max=90
    //% group="Collisions" weight=91
    export function isBeingSquished(body: Body, angleTolerance: number = 15): boolean {
        const owner = validateBody(body);
        if (body.type != box2d.BodyType.Dynamic)
            return false;
        if (angleTolerance < 0 || angleTolerance > 90 || angleTolerance != angleTolerance)
            throw "Squish angle tolerance must be from 0 to 90 degrees.";

        const normals: number[] = [];
        const otherBodies: Body[] = [];
        const contacts = owner.world.getContacts();
        for (let i = 0; i < contacts.length; ++i) {
            const bodyA = owner.findFixture(contacts[i].fixtureA.handle);
            const bodyB = owner.findFixture(contacts[i].fixtureB.handle);
            let otherBody: Body;
            let direction: number;
            if (bodyA == body) {
                otherBody = bodyB;
                direction = -1;
            }
            else if (bodyB == body) {
                otherBody = bodyA;
                direction = 1;
            }
            else {
                continue;
            }
            if (!otherBody || otherBody.destroyed ||
                otherBody.type == box2d.BodyType.Dynamic)
                continue;

            const contactNormals = contacts[i].getNormals();
            for (let j = 0; j < contactNormals.length; ++j) {
                normals.push(contactNormals[j].x * direction);
                normals.push(contactNormals[j].y * direction);
                otherBodies.push(otherBody);
            }
        }

        const threshold = -Math.cos(angleTolerance * Math.PI / 180);
        for (let i = 0; i < otherBodies.length; ++i) {
            for (let j = i + 1; j < otherBodies.length; ++j) {
                if (otherBodies[i] == otherBodies[j])
                    continue;
                if (normals[i * 2] * normals[j * 2] +
                    normals[i * 2 + 1] * normals[j * 2 + 1] <= threshold)
                    return true;
            }
        }
        return false;
    }

    /**
     * Return all current contact manifold points between two bodies in
     * world-space pixels. Sensor contacts may have no points.
     */
    //% blockId=box2d_blocks_contact_points
    //% block="contact points between $body and $otherBody"
    //% body.shadow=variables_get body.defl=myBody
    //% otherBody.shadow=variables_get otherBody.defl=otherBody
    //% group="Collisions" weight=90
    export function contactPoints(body: Body, otherBody: Body): PhysicsPoint[] {
        const owner = validateBodyPair(body, otherBody);
        const result: PhysicsPoint[] = [];
        if (body == otherBody) return result;

        const contacts = owner.world.getContacts();
        for (let i = 0; i < contacts.length; ++i) {
            const bodyA = owner.findFixture(contacts[i].fixtureA.handle);
            const bodyB = owner.findFixture(contacts[i].fixtureB.handle);
            if (!((bodyA == body && bodyB == otherBody) ||
                  (bodyA == otherBody && bodyB == body)))
                continue;

            const points = contacts[i].getPoints();
            for (let j = 0; j < points.length; ++j)
                result.push(new PhysicsPoint(
                    points[j].x * PIXELS_PER_METER,
                    points[j].y * PIXELS_PER_METER
                ));
        }
        return result;
    }

    function validateBodyPair(body: Body, otherBody: Body): _SceneState {
        const owner = _state();
        if (!isValidBody(body, owner) || !isValidBody(otherBody, owner))
            throw "One or both Box2D bodies are invalid.";
        return owner;
    }

    function validateBody(body: Body): _SceneState {
        const owner = _state();
        if (!isValidBody(body, owner))
            throw "This Box2D body is invalid.";
        return owner;
    }

    function isValidBody(body: Body, owner: _SceneState): boolean {
        return !!body && !body.destroyed && body.belongsTo(owner) && body.nativeBody.valid;
    }

    /**
     * Configure whether two body kinds collide. All pairs collide by default.
     */
    //% blockId=box2d_blocks_set_kinds_collide
    //% block="set kind $kind=box2d_blocks_body_kind collides with kind $otherKind=box2d_blocks_body_kind to $collide"
    //% collide.shadow=toggleOnOff
    //% group="Collisions" weight=90
    export function setKindsCollide(kind: number, otherKind: number, collide: boolean): void {
        _state().setKindsCollide(kind, otherKind, collide);
    }

    /**
     * Equal positive groups always collide; equal negative groups never collide.
     * Group zero uses the normal category and mask rules.
     */
    //% blockId=box2d_blocks_set_collision_group
    //% block="set $body collision group $group"
    //% body.shadow=variables_get body.defl=myBody
    //% group.defl=0
    //% group="Collisions" weight=55
    export function setCollisionGroup(body: Body, group: number): void {
        const owner = _state();
        if (!body || body.destroyed || !body.belongsTo(owner) || !body.nativeBody.valid)
            throw "This Box2D body is invalid.";
        if (group < -32768 || group > 32767 || group != Math.floor(group))
            throw "Collision groups must be integers from -32768 to 32767.";

        for (let i = 0; i < body.fixtures.length; ++i)
            body.fixtures[i].fixture.setGroup(group);
        body.collisionGroup = group;
    }
}