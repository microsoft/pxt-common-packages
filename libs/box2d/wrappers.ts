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
        constructor(private _handle: box2dNative.Handle) {}

        /** For interoperation with the low-level primitive API. */
        get handle(): box2dNative.Handle {
            return this._handle;
        }

        /** Consults native state, including destruction through the low-level API. */
        get valid(): boolean {
            return box2dNative.isValid(this._handle);
        }
    }

    /** An explicitly owned native physics world. */
    export class World extends NativeObject {
        constructor(gravityX: number = 0, gravityY: number = 9.8) {
            super(box2dNative.createWorld(gravityX, gravityY));
        }

        /** Also invalidates all bodies, fixtures, and joints in this world. */
        destroy(): void {
            box2dNative.destroyWorld(this.handle);
        }

        step(seconds: number = 0.016666666666666666, velocityIterations: number = 8, positionIterations: number = 3): void {
            box2dNative.step(this.handle, seconds, velocityIterations, positionIterations);
        }

        setGravity(x: number, y: number): void {
            box2dNative.setGravity(this.handle, x, y);
        }

        setSleepingAllowed(allowed: boolean): void {
            box2dNative.setWorldSleepingAllowed(this.handle, allowed);
        }

        createBody(type: BodyType, x: number = 0, y: number = 0, angle: number = 0): Body {
            return new Body(box2dNative.createBody(this.handle, type, x, y, angle));
        }

        /** Touching fixture pairs, including sensors; not begin/end events. */
        getContacts(): Contact[] {
            const pairs = box2dNative.getContacts(this.handle);
            const result: Contact[] = [];
            for (let i = 0; i < pairs.length; i += 2) {
                result.push(new Contact(new Fixture(pairs[i]), new Fixture(pairs[i + 1])));
            }
            return result;
        }

        /** Broad-phase candidates, not exact shape overlap tests. */
        queryAABB(minX: number, minY: number, maxX: number, maxY: number): Fixture[] {
            const handles = box2dNative.queryAABB(this.handle, minX, minY, maxX, maxY);
            const result: Fixture[] = [];
            for (let i = 0; i < handles.length; ++i) {
                result.push(new Fixture(handles[i]));
            }
            return result;
        }

        /** The closest hit, or null if the ray misses. */
        rayCast(x1: number, y1: number, x2: number, y2: number): RayCastHit {
            const hit = box2dNative.rayCast(this.handle, x1, y1, x2, y2);
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
        constructor(handle: box2dNative.Handle) {
            super(handle);
        }

        /** Also invalidates attached fixtures and joints. */
        destroy(): void {
            box2dNative.destroyBody(this.handle);
        }

        getState(): BodySnapshot {
            return new BodySnapshot(box2dNative.getBodyState(this.handle));
        }

        /** Overwrite the first three entries of a reusable array with [x, y, angle]. */
        readTransform(output: number[]): void {
            box2dNative.readBodyTransform(this.handle, output);
        }

        /**
         * Write eight integer pixel coordinates into a reusable output array.
         * Box: [halfWidth, halfHeight, localCenterX, localCenterY].
         * View: [pixelsPerMeter, originX, originY]. Reuse all three arrays when rendering.
         */
        readBoxVertices(box: number[], view: number[], output: number[]): void {
            box2dNative.readBodyBoxVertices(this.handle, box, view, output);
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
            box2dNative.setTransform(this.handle, state.x, state.y, value);
        }

        get linearVelocity(): Vec2 {
            const state = this.getState();
            return new Vec2(state.velocityX, state.velocityY);
        }

        get angularVelocity(): number {
            return this.getState().angularVelocity;
        }

        set angularVelocity(value: number) {
            box2dNative.setAngularVelocity(this.handle, value);
        }

        get mass(): number {
            return this.getState().mass;
        }

        get inertia(): number {
            return this.getState().inertia;
        }

        setPosition(x: number, y: number): void {
            box2dNative.setTransform(this.handle, x, y, this.angle);
        }

        setTransform(x: number, y: number, angle: number): void {
            box2dNative.setTransform(this.handle, x, y, angle);
        }

        setLinearVelocity(x: number, y: number): void {
            box2dNative.setLinearVelocity(this.handle, x, y);
        }

        setType(type: BodyType): void {
            box2dNative.setBodyType(this.handle, type);
        }

        setDamping(linear: number, angular: number): void {
            box2dNative.setDamping(this.handle, linear, angular);
        }

        setGravityScale(scale: number): void {
            box2dNative.setGravityScale(this.handle, scale);
        }

        setFlag(flag: BodyFlag, enabled: boolean): void {
            box2dNative.setBodyFlag(this.handle, flag, enabled);
        }

        getFlag(flag: BodyFlag): boolean {
            return box2dNative.getBodyFlag(this.handle, flag);
        }

        /** The fixture owns a copy of the shape; the template remains independently owned. */
        createFixture(shape: Shape, density: number = 1, friction: number = 0.2, restitution: number = 0, sensor: boolean = false): Fixture {
            return new Fixture(box2dNative.createFixture(this.handle, shape.handle, density, friction, restitution, sensor));
        }

        applyForce(x: number, y: number, pointX: number, pointY: number, wake: boolean = true): void {
            box2dNative.applyForce(this.handle, x, y, pointX, pointY, wake);
        }

        applyForceToCenter(x: number, y: number, wake: boolean = true): void {
            box2dNative.applyForceToCenter(this.handle, x, y, wake);
        }

        applyLinearImpulse(x: number, y: number, pointX: number, pointY: number, wake: boolean = true): void {
            box2dNative.applyLinearImpulse(this.handle, x, y, pointX, pointY, wake);
        }

        applyLinearImpulseToCenter(x: number, y: number, wake: boolean = true): void {
            box2dNative.applyLinearImpulseToCenter(this.handle, x, y, wake);
        }

        applyTorque(torque: number, wake: boolean = true): void {
            box2dNative.applyTorque(this.handle, torque, wake);
        }

        applyAngularImpulse(impulse: number, wake: boolean = true): void {
            box2dNative.applyAngularImpulse(this.handle, impulse, wake);
        }

        getWorldPoint(x: number, y: number): Vec2 {
            const point = box2dNative.getWorldPoint(this.handle, x, y);
            return new Vec2(point[0], point[1]);
        }

        getLocalPoint(x: number, y: number): Vec2 {
            const point = box2dNative.getLocalPoint(this.handle, x, y);
            return new Vec2(point[0], point[1]);
        }

        /** Anchors are world-space points; both bodies must belong to the same world. */
        createDistanceJoint(other: Body, anchorX: number, anchorY: number, otherAnchorX: number, otherAnchorY: number, collideConnected: boolean = false): DistanceJoint {
            return new DistanceJoint(box2dNative.createDistanceJoint(
                this.handle, other.handle, anchorX, anchorY, otherAnchorX, otherAnchorY, collideConnected
            ));
        }

        /** Create a hinge at a world-space anchor, with another body in the same world. */
        createRevoluteJoint(other: Body, anchorX: number, anchorY: number, collideConnected: boolean = false): RevoluteJoint {
            return new RevoluteJoint(box2dNative.createRevoluteJoint(this.handle, other.handle, anchorX, anchorY, collideConnected));
        }

        /** World-space anchor and finite nonzero axis; the normalized axis stays fixed in this body. */
        createWheelJoint(other: Body, anchorX: number, anchorY: number, axisX: number, axisY: number, collideConnected: boolean = false): WheelJoint {
            return new WheelJoint(box2dNative.createWheelJoint(
                this.handle, other.handle, anchorX, anchorY, axisX, axisY, collideConnected
            ));
        }

        /** Create a mouse joint whose local anchor on the dynamic other body starts at the world-space anchor. */
        createMouseJoint(other: Body, anchorX: number, anchorY: number, maxForce: number, stiffness: number, damping: number): MouseJoint {
            return new MouseJoint(box2dNative.createMouseJoint(
                this.handle, other.handle, anchorX, anchorY, maxForce, stiffness, damping
            ));
        }
    }

    /** A reusable, independently owned native shape template. */
    export class Shape extends NativeObject {
        /** Wrap an existing shape handle. Prefer the static circle/box/polygon/edge/chain factories. */
        constructor(handle: box2dNative.Handle) {
            super(handle);
        }

        static circle(radius: number, centerX: number = 0, centerY: number = 0): Shape {
            return new Shape(box2dNative.createCircleShape(radius, centerX, centerY));
        }

        /** Dimensions are half extents in meters. */
        static box(halfWidth: number, halfHeight: number, centerX: number = 0, centerY: number = 0, angle: number = 0): Shape {
            return new Shape(box2dNative.createBoxShape(halfWidth, halfHeight, centerX, centerY, angle));
        }

        /** 3-8 strictly convex local vertices: [x0, y0, x1, y1, ...]. */
        static polygon(vertices: number[]): Shape {
            return new Shape(box2dNative.createPolygonShape(vertices));
        }

        static edge(x1: number, y1: number, x2: number, y2: number): Shape {
            return new Shape(box2dNative.createEdgeShape(x1, y1, x2, y2));
        }

        static chain(vertices: number[], loop: boolean = false): Shape {
            return new Shape(box2dNative.createChainShape(vertices, loop));
        }

        /** Existing fixtures keep their copies. */
        destroy(): void {
            box2dNative.destroyShape(this.handle);
        }
    }

    export class Fixture extends NativeObject {
        /** Wrap an existing fixture handle. Prefer Body.createFixture for creation. */
        constructor(handle: box2dNative.Handle) {
            super(handle);
        }

        /** A fresh wrapper of the owning body; compare handles rather than object identity. */
        get body(): Body {
            return new Body(box2dNative.getFixtureBody(this.handle));
        }

        destroy(): void {
            box2dNative.destroyFixture(this.handle);
        }

        setMaterial(density: number, friction: number, restitution: number): void {
            box2dNative.setFixtureMaterial(this.handle, density, friction, restitution);
        }

        setSensor(sensor: boolean): void {
            box2dNative.setFixtureSensor(this.handle, sensor);
        }

        setFilter(categoryBits: number = 1, maskBits: number = 65535, groupIndex: number = 0): void {
            box2dNative.setFixtureFilter(this.handle, categoryBits, maskBits, groupIndex);
        }

        testPoint(x: number, y: number): boolean {
            return box2dNative.testPoint(this.handle, x, y);
        }
    }

    export class Joint extends NativeObject {
        /** Wrap an existing joint handle. */
        constructor(handle: box2dNative.Handle) {
            super(handle);
        }

        /** Current world-space anchors: [anchorAX, anchorAY, anchorBX, anchorBY]. */
        getAnchors(): number[] {
            return box2dNative.getJointAnchors(this.handle);
        }

        destroy(): void {
            box2dNative.destroyJoint(this.handle);
        }
    }

    export class DistanceJoint extends Joint {
        /** Wrap an existing distance-joint handle. */
        constructor(handle: box2dNative.Handle) {
            super(handle);
        }

        /** Length and range are meters, stiffness N/m, and damping N*s/m. */
        configure(length: number, minLength: number, maxLength: number, stiffness: number = 0, damping: number = 0): void {
            box2dNative.setDistanceJoint(this.handle, length, minLength, maxLength, stiffness, damping);
        }
    }

    export class RevoluteJoint extends Joint {
        /** Wrap an existing revolute-joint handle. */
        constructor(handle: box2dNative.Handle) {
            super(handle);
        }

        setMotor(enabled: boolean, speed: number, maxTorque: number): void {
            box2dNative.setRevoluteJointMotor(this.handle, enabled, speed, maxTorque);
        }

        setLimits(enabled: boolean, lower: number, upper: number): void {
            box2dNative.setRevoluteJointLimits(this.handle, enabled, lower, upper);
        }
    }

    export class WheelJoint extends Joint {
        /** Wrap an existing wheel-joint handle. */
        constructor(handle: box2dNative.Handle) {
            super(handle);
        }

        /** Speed is radians/second; torque is nonnegative N*m. Enabled zero speed brakes. */
        setMotor(enabled: boolean, speed: number, maxTorque: number): void {
            box2dNative.setWheelJointMotor(this.handle, enabled, speed, maxTorque);
        }

        /** Translation limits in meters along the suspension axis, relative to creation. */
        setLimits(enabled: boolean, lower: number, upper: number): void {
            box2dNative.setWheelJointLimits(this.handle, enabled, lower, upper);
        }

        /** Nonnegative stiffness in N/m and damping in N*s/m, not frequency/damping ratio. */
        setSuspension(stiffness: number, damping: number): void {
            box2dNative.setWheelJointSuspension(this.handle, stiffness, damping);
        }
    }

    export class MouseJoint extends Joint {
        constructor(handle: box2dNative.Handle) {
            super(handle);
        }

        setTarget(x: number, y: number): void {
            box2dNative.setMouseJointTarget(this.handle, x, y);
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
