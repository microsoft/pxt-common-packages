/**
 * Box2D 2.4.1 physics. Objects are positive numeric handles, not pointers.
 * Distances are meters, angles radians, and time seconds.
 */
//% color=#426b9a weight=80
namespace box2d {
    export enum BodyType {
        Static = 0,
        Kinematic = 1,
        Dynamic = 2
    }

    export enum BodyFlag {
        Bullet = 0,
        FixedRotation = 1,
        SleepingAllowed = 2,
        Awake = 3,
        Enabled = 4
    }

    /** Indices in the array returned by getBodyState. */
    export enum BodyState {
        X = 0,
        Y = 1,
        Angle = 2,
        VelocityX = 3,
        VelocityY = 4,
        AngularVelocity = 5,
        Mass = 6,
        Inertia = 7
    }

    /** Indices in a nonempty rayCast result. */
    export enum RayHit {
        Fixture = 0,
        X = 1,
        Y = 2,
        NormalX = 3,
        NormalY = 4,
        Fraction = 5
    }

    /** Create an independently owned physics world. Positive Y gravity points down. */
    // Native wrapper: box2d::createWorld
    export function createWorld(gravityX: number = 0, gravityY: number = 9.8): number {
        return box2dNative.createWorld(gravityX, gravityY);
    }

    /** Destroy a world and invalidate all its body, fixture, and joint handles. */
    // Native wrapper: box2d::destroyWorld
    export function destroyWorld(world: number): void {
        box2dNative.destroyWorld(world);
    }

    /** Check whether a handle still identifies a live object of any kind. */
    // Native wrapper: box2d::isValid
    export function isValid(handle: number): boolean {
        return box2dNative.isValid(handle);
    }

    /** Change the world's gravity in meters per second squared. */
    // Native wrapper: box2d::setGravity
    export function setGravity(world: number, x: number, y: number): void {
        box2dNative.setGravity(world, x, y);
    }

    /** Advance a world. Use a fixed time step, typically 1 / 60 second. */
    // Native wrapper: box2d::step
    export function step(world: number, seconds: number = 0.016666666666666666, velocityIterations: number = 8, positionIterations: number = 3): void {
        box2dNative.step(world, seconds, velocityIterations, positionIterations);
    }

    // Native wrapper: box2d::setWorldSleepingAllowed
    export function setWorldSleepingAllowed(world: number, allowed: boolean): void {
        box2dNative.setWorldSleepingAllowed(world, allowed);
    }

    /** Create a body without fixtures. Angles are in radians. */
    // Native wrapper: box2d::createBody
    export function createBody(world: number, type: BodyType, x: number = 0, y: number = 0, angle: number = 0): number {
        return box2dNative.createBody([world, type, x, y, angle]);
    }

    /** Also destroys this body's fixtures and all joints connected to it. */
    // Native wrapper: box2d::destroyBody
    export function destroyBody(body: number): void {
        box2dNative.destroyBody(body);
    }

    /** Snapshot: [x, y, angle, velocityX, velocityY, angularVelocity, mass, inertia]. */
    // Native wrapper: box2d::getBodyState
    export function getBodyState(body: number): number[] {
        return box2dNative.getBodyState(body);
    }

    /**
     * Overwrite output[0..2] with [x, y, angle] without creating or resizing an array.
     * Output must already contain at least three entries; any trailing entries are unchanged.
     */
    // Native wrapper: box2d::readBodyTransform
    export function readBodyTransform(body: number, output: number[]): void {
        box2dNative.readBodyTransform(body, output);
    }

    /**
     * Write rounded screen corners [x0, y0, ..., x3, y3] into an existing array.
     * Box is [halfWidth, halfHeight, localCenterX, localCenterY].
     * View is [pixelsPerMeter, originX, originY], with positive Y pointing down.
     * Output needs at least eight entries. Rounded coordinates must be within +/-30000.
     */
    // Native wrapper: box2d::readBodyBoxVertices
    export function readBodyBoxVertices(body: number, box: number[], view: number[], output: number[]): void {
        box2dNative.readBodyBoxVertices(body, box, view, output);
    }

    // Native wrapper: box2d::setTransform
    export function setTransform(body: number, x: number, y: number, angle: number): void {
        box2dNative.setTransform(body, x, y, angle);
    }

    // Native wrapper: box2d::setLinearVelocity
    export function setLinearVelocity(body: number, x: number, y: number): void {
        box2dNative.setLinearVelocity(body, x, y);
    }

    // Native wrapper: box2d::setAngularVelocity
    export function setAngularVelocity(body: number, velocity: number): void {
        box2dNative.setAngularVelocity(body, velocity);
    }

    // Native wrapper: box2d::setBodyType
    export function setBodyType(body: number, type: BodyType): void {
        box2dNative.setBodyType(body, type);
    }

    // Native wrapper: box2d::setDamping
    export function setDamping(body: number, linear: number, angular: number): void {
        box2dNative.setDamping(body, linear, angular);
    }

    // Native wrapper: box2d::setGravityScale
    export function setGravityScale(body: number, scale: number): void {
        box2dNative.setGravityScale(body, scale);
    }

    // Native wrapper: box2d::setBodyFlag
    export function setBodyFlag(body: number, flag: BodyFlag, enabled: boolean): void {
        box2dNative.setBodyFlag(body, flag, enabled);
    }

    // Native wrapper: box2d::getBodyFlag
    export function getBodyFlag(body: number, flag: BodyFlag): boolean {
        return box2dNative.getBodyFlag(body, flag);
    }

    /** Apply a force at a world-space point. Forces clear automatically after step. */
    // Native wrapper: box2d::applyForce
    export function applyForce(body: number, x: number, y: number, pointX: number, pointY: number, wake: boolean = true): void {
        box2dNative.applyForce([body, x, y, pointX, pointY, wake ? 1 : 0]);
    }

    // Native wrapper: box2d::applyForceToCenter
    export function applyForceToCenter(body: number, x: number, y: number, wake: boolean = true): void {
        box2dNative.applyForceToCenter(body, x, y, wake);
    }

    /** Apply a linear impulse at a world-space point. */
    // Native wrapper: box2d::applyLinearImpulse
    export function applyLinearImpulse(body: number, x: number, y: number, pointX: number, pointY: number, wake: boolean = true): void {
        box2dNative.applyLinearImpulse([body, x, y, pointX, pointY, wake ? 1 : 0]);
    }

    // Native wrapper: box2d::applyLinearImpulseToCenter
    export function applyLinearImpulseToCenter(body: number, x: number, y: number, wake: boolean = true): void {
        box2dNative.applyLinearImpulseToCenter(body, x, y, wake);
    }

    // Native wrapper: box2d::applyTorque
    export function applyTorque(body: number, torque: number, wake: boolean = true): void {
        box2dNative.applyTorque(body, torque, wake);
    }

    // Native wrapper: box2d::applyAngularImpulse
    export function applyAngularImpulse(body: number, impulse: number, wake: boolean = true): void {
        box2dNative.applyAngularImpulse(body, impulse, wake);
    }

    /** Convert a body-local point to world coordinates; returns [x, y]. */
    // Native wrapper: box2d::getWorldPoint
    export function getWorldPoint(body: number, x: number, y: number): number[] {
        return box2dNative.getWorldPoint(body, x, y);
    }

    /** Convert a world point to body-local coordinates; returns [x, y]. */
    // Native wrapper: box2d::getLocalPoint
    export function getLocalPoint(body: number, x: number, y: number): number[] {
        return box2dNative.getLocalPoint(body, x, y);
    }

    /** Create a reusable circle shape, with its center in body-local coordinates. */
    // Native wrapper: box2d::createCircleShape
    export function createCircleShape(radius: number, centerX: number = 0, centerY: number = 0): number {
        return box2dNative.createCircleShape(radius, centerX, centerY);
    }

    /** Dimensions are HALF extents in meters. Center and angle are body-local. */
    // Native wrapper: box2d::createBoxShape
    export function createBoxShape(halfWidth: number, halfHeight: number, centerX: number = 0, centerY: number = 0, angle: number = 0): number {
        return box2dNative.createBoxShape([halfWidth, halfHeight, centerX, centerY, angle]);
    }

    /** 3-8 strictly convex vertices in boundary order: [x0, y0, x1, y1, ...]. */
    // Native wrapper: box2d::createPolygonShape
    export function createPolygonShape(vertices: number[]): number {
        return box2dNative.createPolygonShape(vertices);
    }

    /** Create a two-sided edge in body-local coordinates; use on static bodies. */
    // Native wrapper: box2d::createEdgeShape
    export function createEdgeShape(x1: number, y1: number, x2: number, y2: number): number {
        return box2dNative.createEdgeShape(x1, y1, x2, y2);
    }

    /**
     * Create a one-sided chain from 2-128 local vertices (3+ for loops).
     * The front face is to the right of each directed edge.
     * Do not repeat the first vertex when closing a loop.
     */
    // Native wrapper: box2d::createChainShape
    export function createChainShape(vertices: number[], loop: boolean = false): number {
        return box2dNative.createChainShape(vertices, loop);
    }

    /** Fixtures own copies, so destroying a shape never affects existing fixtures. */
    // Native wrapper: box2d::destroyShape
    export function destroyShape(shape: number): void {
        box2dNative.destroyShape(shape);
    }

    /** Copy a shape onto a body. Density is kg/m^2; sensors detect without collision response. */
    // Native wrapper: box2d::createFixture
    export function createFixture(body: number, shape: number, density: number = 1, friction: number = 0.2, restitution: number = 0, sensor: boolean = false): number {
        return box2dNative.createFixture([body, shape, density, friction, restitution, sensor ? 1 : 0]);
    }

    // Native wrapper: box2d::destroyFixture
    export function destroyFixture(fixture: number): void {
        box2dNative.destroyFixture(fixture);
    }

    // Native wrapper: box2d::getFixtureBody
    export function getFixtureBody(fixture: number): number {
        return box2dNative.getFixtureBody(fixture);
    }

    /** Update density, friction, and restitution; recompute body mass and contact materials. */
    // Native wrapper: box2d::setFixtureMaterial
    export function setFixtureMaterial(fixture: number, density: number, friction: number, restitution: number): void {
        box2dNative.setFixtureMaterial(fixture, density, friction, restitution);
    }

    // Native wrapper: box2d::setFixtureSensor
    export function setFixtureSensor(fixture: number, sensor: boolean): void {
        box2dNative.setFixtureSensor(fixture, sensor);
    }

    /** 16-bit category/mask bits and signed 16-bit collision group. */
    // Native wrapper: box2d::setFixtureFilter
    export function setFixtureFilter(fixture: number, categoryBits: number = 1, maskBits: number = 65535, groupIndex: number = 0): void {
        box2dNative.setFixtureFilter(fixture, categoryBits, maskBits, groupIndex);
    }

    /** Test a world-space point against a fixture. Edges and chains always return false. */
    // Native wrapper: box2d::testPoint
    export function testPoint(fixture: number, x: number, y: number): boolean {
        return box2dNative.testPoint(fixture, x, y);
    }

    /** Create a rigid distance joint using world-space anchors on two different bodies in one world. */
    // Native wrapper: box2d::createDistanceJoint
    export function createDistanceJoint(bodyA: number, bodyB: number, anchorAX: number, anchorAY: number, anchorBX: number, anchorBY: number, collideConnected: boolean = false): number {
        return box2dNative.createDistanceJoint([bodyA, bodyB, anchorAX, anchorAY, anchorBX, anchorBY, collideConnected ? 1 : 0]);
    }

    /** Set length/range in meters, stiffness in N/m, and damping in N*s/m. */
    // Native wrapper: box2d::setDistanceJoint
    export function setDistanceJoint(joint: number, length: number, minLength: number, maxLength: number, stiffness: number = 0, damping: number = 0): void {
        box2dNative.setDistanceJoint([joint, length, minLength, maxLength, stiffness, damping]);
    }

    /** Create a hinge at a world-space anchor on two different bodies in one world. */
    // Native wrapper: box2d::createRevoluteJoint
    export function createRevoluteJoint(bodyA: number, bodyB: number, anchorX: number, anchorY: number, collideConnected: boolean = false): number {
        return box2dNative.createRevoluteJoint([bodyA, bodyB, anchorX, anchorY, collideConnected ? 1 : 0]);
    }

    // Native wrapper: box2d::setRevoluteJointMotor
    export function setRevoluteJointMotor(joint: number, enabled: boolean, speed: number, maxTorque: number): void {
        box2dNative.setRevoluteJointMotor(joint, enabled, speed, maxTorque);
    }

    /** Limits are radians relative to the bodies' angle difference at joint creation. */
    // Native wrapper: box2d::setRevoluteJointLimits
    export function setRevoluteJointLimits(joint: number, enabled: boolean, lower: number, upper: number): void {
        box2dNative.setRevoluteJointLimits(joint, enabled, lower, upper);
    }

    /**
     * Create a wheel suspension between different bodies in one world.
     * Anchor and axis are world-space; the finite, nonzero axis is normalized and fixed in bodyA.
     * Motor, limits, and spring are initially disabled.
     */
    // Native wrapper: box2d::createWheelJoint
    export function createWheelJoint(bodyA: number, bodyB: number, anchorX: number, anchorY: number, axisX: number, axisY: number, collideConnected: boolean = false): number {
        return box2dNative.createWheelJoint([bodyA, bodyB, anchorX, anchorY, axisX, axisY, collideConnected ? 1 : 0]);
    }

    /** Motor speed is radians/second, maxTorque is nonnegative N*m. Enabled zero speed brakes. */
    // Native wrapper: box2d::setWheelJointMotor
    export function setWheelJointMotor(joint: number, enabled: boolean, speed: number, maxTorque: number): void {
        box2dNative.setWheelJointMotor(joint, enabled, speed, maxTorque);
    }

    /** Translation limits in meters along the axis, relative to the creation anchor; lower <= upper. */
    // Native wrapper: box2d::setWheelJointLimits
    export function setWheelJointLimits(joint: number, enabled: boolean, lower: number, upper: number): void {
        box2dNative.setWheelJointLimits(joint, enabled, lower, upper);
    }

    /** Nonnegative spring stiffness in N/m and damping in N*s/m (not frequency/damping ratio). */
    // Native wrapper: box2d::setWheelJointSuspension
    export function setWheelJointSuspension(joint: number, stiffness: number, damping: number): void {
        box2dNative.setWheelJointSuspension(joint, stiffness, damping);
    }

    /** Create a mouse joint anchored on a dynamic body. */
    // Native wrapper: box2d::createMouseJoint
    export function createMouseJoint(bodyA: number, bodyB: number, anchorX: number, anchorY: number, maxForce: number, stiffness: number, damping: number): number {
        return box2dNative.createMouseJoint([bodyA, bodyB, anchorX, anchorY, maxForce, stiffness, damping]);
    }

    // Native wrapper: box2d::setMouseJointTarget
    export function setMouseJointTarget(joint: number, x: number, y: number): void {
        box2dNative.setMouseJointTarget(joint, x, y);
    }

    // Native wrapper: box2d::destroyJoint
    export function destroyJoint(joint: number): void {
        box2dNative.destroyJoint(joint);
    }

    /** Touching pairs from the last step: [fixtureA, fixtureB, ...], including sensors. */
    // Native wrapper: box2d::getContacts
    export function getContacts(world: number): number[] {
        return box2dNative.getContacts(world);
    }

    /** Unique fixture handles whose broad-phase bounds overlap the world-space rectangle. */
    // Native wrapper: box2d::queryAABB
    export function queryAABB(world: number, minX: number, minY: number, maxX: number, maxY: number): number[] {
        return box2dNative.queryAABB([world, minX, minY, maxX, maxY]);
    }

    /** Closest hit: [fixture, x, y, normalX, normalY, fraction], or [] if no hit. */
    // Native wrapper: box2d::rayCast
    export function rayCast(world: number, x1: number, y1: number, x2: number, y2: number): number[] {
        return box2dNative.rayCast([world, x1, y1, x2, y2]);
    }
}