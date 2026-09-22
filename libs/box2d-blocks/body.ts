namespace box2dblocks {
    export class Body extends Destroyable {
        public fixtures: _FixtureDrawing[] = [];
        public connectedBodies: Body[] = [];
        public destroyed = false;

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
}