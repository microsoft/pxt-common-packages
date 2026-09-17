namespace box2d {
    /** A detached TypeScript vector; editing it does not change native physics. */
    export class Vec2 {
        constructor(public x: number = 0, public y: number = 0) {}
    }

    /** One native read of a body's state, with named fields instead of array indices. */
    export class BodySnapshot {
        public x: number;
        public y: number;
        public angle: number;
        public velocityX: number;
        public velocityY: number;
        public angularVelocity: number;
        public mass: number;
        public inertia: number;

        constructor(state: number[]) {
            this.x = state[box2d.BodyState.X];
            this.y = state[box2d.BodyState.Y];
            this.angle = state[box2d.BodyState.Angle];
            this.velocityX = state[box2d.BodyState.VelocityX];
            this.velocityY = state[box2d.BodyState.VelocityY];
            this.angularVelocity = state[box2d.BodyState.AngularVelocity];
            this.mass = state[box2d.BodyState.Mass];
            this.inertia = state[box2d.BodyState.Inertia];
        }
    }

    class NativeObject {
        constructor(private _handle: number) {}

        /** For interoperation with the low-level primitive API. */
        get handle(): number {
            return this._handle;
        }

        /** Consults native state, including destruction through the low-level API. */
        get valid(): boolean {
            return box2d.isValid(this._handle);
        }
    }

    /** An explicitly owned native physics world. */
    export class World extends NativeObject {
        constructor(gravityX: number = 0, gravityY: number = 9.8) {
            super(box2d.createWorld(gravityX, gravityY));
        }

        /** Also invalidates all bodies, fixtures, and joints in this world. */
        destroy(): void {
            box2d.destroyWorld(this.handle);
        }

        step(seconds: number = 0.016666666666666666, velocityIterations: number = 8, positionIterations: number = 3): void {
            box2d.step(this.handle, seconds, velocityIterations, positionIterations);
        }

        setGravity(x: number, y: number): void {
            box2d.setGravity(this.handle, x, y);
        }

        setSleepingAllowed(allowed: boolean): void {
            box2d.setWorldSleepingAllowed(this.handle, allowed);
        }

        createBody(type: BodyType, x: number = 0, y: number = 0, angle: number = 0): Body {
            return new Body(box2d.createBody(this.handle, type, x, y, angle));
        }

        /** Touching fixture pairs, including sensors; not begin/end events. */
        getContacts(): Contact[] {
            const pairs = box2d.getContacts(this.handle);
            const result: Contact[] = [];
            for (let i = 0; i < pairs.length; i += 2) {
                result.push(new Contact(new Fixture(pairs[i]), new Fixture(pairs[i + 1])));
            }
            return result;
        }

        /** Broad-phase candidates, not exact shape overlap tests. */
        queryAABB(minX: number, minY: number, maxX: number, maxY: number): Fixture[] {
            const handles = box2d.queryAABB(this.handle, minX, minY, maxX, maxY);
            const result: Fixture[] = [];
            for (let i = 0; i < handles.length; ++i) {
                result.push(new Fixture(handles[i]));
            }
            return result;
        }

        /** The closest hit, or null if the ray misses. */
        rayCast(x1: number, y1: number, x2: number, y2: number): RayCastHit {
            const hit = box2d.rayCast(this.handle, x1, y1, x2, y2);
            if (hit.length == 0) return null;
            return new RayCastHit(
                new Fixture(hit[box2d.RayHit.Fixture]),
                new Vec2(hit[box2d.RayHit.X], hit[box2d.RayHit.Y]),
                new Vec2(hit[box2d.RayHit.NormalX], hit[box2d.RayHit.NormalY]),
                hit[box2d.RayHit.Fraction]
            );
        }
    }

    export class Body extends NativeObject {
        /** Wrap an existing body handle without creating or taking ownership of another body. */
        constructor(handle: number) {
            super(handle);
        }

        /** Also invalidates attached fixtures and joints. */
        destroy(): void {
            box2d.destroyBody(this.handle);
        }

        getState(): BodySnapshot {
            return new BodySnapshot(box2d.getBodyState(this.handle));
        }

        /** Overwrite the first three entries of a reusable array with [x, y, angle]. */
        readTransform(output: number[]): void {
            box2d.readBodyTransform(this.handle, output);
        }

        /**
         * Write eight integer pixel coordinates into a reusable output array.
         * Box: [halfWidth, halfHeight, localCenterX, localCenterY].
         * View: [pixelsPerMeter, originX, originY]. Reuse all three arrays when rendering.
         */
        readBoxVertices(box: number[], view: number[], output: number[]): void {
            box2d.readBodyBoxVertices(this.handle, box, view, output);
        }

        /** A detached snapshot. Use setPosition to move the native body. */
        get position(): Vec2 {
            const state = this.getState();
            return new Vec2(state.x, state.y);
        }

        get angle(): number {
            return this.getState().angle;
        }

        set angle(value: number) {
            const state = this.getState();
            box2d.setTransform(this.handle, state.x, state.y, value);
        }

        get linearVelocity(): Vec2 {
            const state = this.getState();
            return new Vec2(state.velocityX, state.velocityY);
        }

        get angularVelocity(): number {
            return this.getState().angularVelocity;
        }

        set angularVelocity(value: number) {
            box2d.setAngularVelocity(this.handle, value);
        }

        get mass(): number {
            return this.getState().mass;
        }

        get inertia(): number {
            return this.getState().inertia;
        }

        setPosition(x: number, y: number): void {
            box2d.setTransform(this.handle, x, y, this.angle);
        }

        setTransform(x: number, y: number, angle: number): void {
            box2d.setTransform(this.handle, x, y, angle);
        }

        setLinearVelocity(x: number, y: number): void {
            box2d.setLinearVelocity(this.handle, x, y);
        }

        setType(type: BodyType): void {
            box2d.setBodyType(this.handle, type);
        }

        setDamping(linear: number, angular: number): void {
            box2d.setDamping(this.handle, linear, angular);
        }

        setGravityScale(scale: number): void {
            box2d.setGravityScale(this.handle, scale);
        }

        setFlag(flag: BodyFlag, enabled: boolean): void {
            box2d.setBodyFlag(this.handle, flag, enabled);
        }

        getFlag(flag: BodyFlag): boolean {
            return box2d.getBodyFlag(this.handle, flag);
        }

        /** The fixture owns a copy of the shape; the template remains independently owned. */
        createFixture(shape: Shape, density: number = 1, friction: number = 0.2, restitution: number = 0, sensor: boolean = false): Fixture {
            return new Fixture(box2d.createFixture(this.handle, shape.handle, density, friction, restitution, sensor));
        }

        applyForce(x: number, y: number, pointX: number, pointY: number, wake: boolean = true): void {
            box2d.applyForce(this.handle, x, y, pointX, pointY, wake);
        }

        applyForceToCenter(x: number, y: number, wake: boolean = true): void {
            box2d.applyForceToCenter(this.handle, x, y, wake);
        }

        applyLinearImpulse(x: number, y: number, pointX: number, pointY: number, wake: boolean = true): void {
            box2d.applyLinearImpulse(this.handle, x, y, pointX, pointY, wake);
        }

        applyLinearImpulseToCenter(x: number, y: number, wake: boolean = true): void {
            box2d.applyLinearImpulseToCenter(this.handle, x, y, wake);
        }

        applyTorque(torque: number, wake: boolean = true): void {
            box2d.applyTorque(this.handle, torque, wake);
        }

        applyAngularImpulse(impulse: number, wake: boolean = true): void {
            box2d.applyAngularImpulse(this.handle, impulse, wake);
        }

        getWorldPoint(x: number, y: number): Vec2 {
            const point = box2d.getWorldPoint(this.handle, x, y);
            return new Vec2(point[0], point[1]);
        }

        getLocalPoint(x: number, y: number): Vec2 {
            const point = box2d.getLocalPoint(this.handle, x, y);
            return new Vec2(point[0], point[1]);
        }

        /** Anchors are world-space points; both bodies must belong to the same world. */
        createDistanceJoint(other: Body, anchorX: number, anchorY: number, otherAnchorX: number, otherAnchorY: number, collideConnected: boolean = false): DistanceJoint {
            return new DistanceJoint(box2d.createDistanceJoint(
                this.handle, other.handle, anchorX, anchorY, otherAnchorX, otherAnchorY, collideConnected
            ));
        }

        /** Create a hinge at a world-space anchor, with another body in the same world. */
        createRevoluteJoint(other: Body, anchorX: number, anchorY: number, collideConnected: boolean = false): RevoluteJoint {
            return new RevoluteJoint(box2d.createRevoluteJoint(this.handle, other.handle, anchorX, anchorY, collideConnected));
        }

        /** World-space anchor and finite nonzero axis; the normalized axis stays fixed in this body. */
        createWheelJoint(other: Body, anchorX: number, anchorY: number, axisX: number, axisY: number, collideConnected: boolean = false): WheelJoint {
            return new WheelJoint(box2d.createWheelJoint(
                this.handle, other.handle, anchorX, anchorY, axisX, axisY, collideConnected
            ));
        }

        /** Create a mouse joint whose local anchor on the dynamic other body starts at the world-space anchor. */
        createMouseJoint(other: Body, anchorX: number, anchorY: number, maxForce: number, stiffness: number, damping: number): MouseJoint {
            return new MouseJoint(box2d.createMouseJoint(
                this.handle, other.handle, anchorX, anchorY, maxForce, stiffness, damping
            ));
        }
    }

    /** A reusable, independently owned native shape template. */
    export class Shape extends NativeObject {
        /** Wrap an existing shape handle. Prefer the static circle/box/polygon/edge/chain factories. */
        constructor(handle: number) {
            super(handle);
        }

        static circle(radius: number, centerX: number = 0, centerY: number = 0): Shape {
            return new Shape(box2d.createCircleShape(radius, centerX, centerY));
        }

        /** Dimensions are half extents in meters. */
        static box(halfWidth: number, halfHeight: number, centerX: number = 0, centerY: number = 0, angle: number = 0): Shape {
            return new Shape(box2d.createBoxShape(halfWidth, halfHeight, centerX, centerY, angle));
        }

        /** 3-8 strictly convex local vertices: [x0, y0, x1, y1, ...]. */
        static polygon(vertices: number[]): Shape {
            return new Shape(box2d.createPolygonShape(vertices));
        }

        static edge(x1: number, y1: number, x2: number, y2: number): Shape {
            return new Shape(box2d.createEdgeShape(x1, y1, x2, y2));
        }

        static chain(vertices: number[], loop: boolean = false): Shape {
            return new Shape(box2d.createChainShape(vertices, loop));
        }

        /** Existing fixtures keep their copies. */
        destroy(): void {
            box2d.destroyShape(this.handle);
        }
    }

    export class Fixture extends NativeObject {
        /** Wrap an existing fixture handle. Prefer Body.createFixture for creation. */
        constructor(handle: number) {
            super(handle);
        }

        /** A fresh wrapper of the owning body; compare handles rather than object identity. */
        get body(): Body {
            return new Body(box2d.getFixtureBody(this.handle));
        }

        destroy(): void {
            box2d.destroyFixture(this.handle);
        }

        setMaterial(density: number, friction: number, restitution: number): void {
            box2d.setFixtureMaterial(this.handle, density, friction, restitution);
        }

        setSensor(sensor: boolean): void {
            box2d.setFixtureSensor(this.handle, sensor);
        }

        setFilter(categoryBits: number = 1, maskBits: number = 65535, groupIndex: number = 0): void {
            box2d.setFixtureFilter(this.handle, categoryBits, maskBits, groupIndex);
        }

        testPoint(x: number, y: number): boolean {
            return box2d.testPoint(this.handle, x, y);
        }
    }

    export class Joint extends NativeObject {
        /** Wrap an existing joint handle. */
        constructor(handle: number) {
            super(handle);
        }

        destroy(): void {
            box2d.destroyJoint(this.handle);
        }
    }

    export class DistanceJoint extends Joint {
        /** Wrap an existing distance-joint handle. */
        constructor(handle: number) {
            super(handle);
        }

        /** Length and range are meters, stiffness N/m, and damping N*s/m. */
        configure(length: number, minLength: number, maxLength: number, stiffness: number = 0, damping: number = 0): void {
            box2d.setDistanceJoint(this.handle, length, minLength, maxLength, stiffness, damping);
        }
    }

    export class RevoluteJoint extends Joint {
        /** Wrap an existing revolute-joint handle. */
        constructor(handle: number) {
            super(handle);
        }

        setMotor(enabled: boolean, speed: number, maxTorque: number): void {
            box2d.setRevoluteJointMotor(this.handle, enabled, speed, maxTorque);
        }

        setLimits(enabled: boolean, lower: number, upper: number): void {
            box2d.setRevoluteJointLimits(this.handle, enabled, lower, upper);
        }
    }

    export class WheelJoint extends Joint {
        /** Wrap an existing wheel-joint handle. */
        constructor(handle: number) {
            super(handle);
        }

        /** Speed is radians/second; torque is nonnegative N*m. Enabled zero speed brakes. */
        setMotor(enabled: boolean, speed: number, maxTorque: number): void {
            box2d.setWheelJointMotor(this.handle, enabled, speed, maxTorque);
        }

        /** Translation limits in meters along the suspension axis, relative to creation. */
        setLimits(enabled: boolean, lower: number, upper: number): void {
            box2d.setWheelJointLimits(this.handle, enabled, lower, upper);
        }

        /** Nonnegative stiffness in N/m and damping in N*s/m, not frequency/damping ratio. */
        setSuspension(stiffness: number, damping: number): void {
            box2d.setWheelJointSuspension(this.handle, stiffness, damping);
        }
    }

    export class MouseJoint extends Joint {
        constructor(handle: number) {
            super(handle);
        }

        setTarget(x: number, y: number): void {
            box2d.setMouseJointTarget(this.handle, x, y);
        }
    }

    /** A detached pair from the world's latest contact snapshot. */
    export class Contact {
        constructor(public fixtureA: Fixture, public fixtureB: Fixture) {}
    }

    /** A detached closest-hit result. Fraction is in the range 0-1 along the ray. */
    export class RayCastHit {
        constructor(public fixture: Fixture, public point: Vec2, public normal: Vec2, public fraction: number) {}
    }
}
