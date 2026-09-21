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
}

namespace box2dNative {
    /** Create an independently owned physics world. Positive Y gravity points down. */
    // Native wrapper: box2dNative::createWorld
    export function createWorld(gravityX: number = 0, gravityY: number = 9.8): number {
        return box2dNativeShim.createWorld(gravityX, gravityY);
    }

    /** Destroy a world and invalidate all its body, fixture, and joint handles. */
    // Native wrapper: box2dNative::destroyWorld
    export function destroyWorld(world: number): void {
        box2dNativeShim.destroyWorld(world);
    }

    /** Check whether a handle still identifies a live object of any kind. */
    // Native wrapper: box2dNative::isValid
    export function isValid(handle: number): boolean {
        return box2dNativeShim.isValid(handle);
    }

    /** Change the world's gravity in meters per second squared. */
    // Native wrapper: box2dNative::setGravity
    export function setGravity(world: number, x: number, y: number): void {
        box2dNativeShim.setGravity(world, x, y);
    }

    /** Advance a world. Use a fixed time step, typically 1 / 60 second. */
    // Native wrapper: box2dNative::step
    export function step(world: number, seconds: number = 0.016666666666666666, velocityIterations: number = 8, positionIterations: number = 3): void {
        box2dNativeShim.step(world, seconds, velocityIterations, positionIterations);
    }

    // Native wrapper: box2dNative::setWorldSleepingAllowed
    export function setWorldSleepingAllowed(world: number, allowed: boolean): void {
        box2dNativeShim.setWorldSleepingAllowed(world, allowed);
    }

    /** Create a body without fixtures. Angles are in radians. */
    // Native wrapper: box2dNative::createBody
    export function createBody(world: number, type: box2d.BodyType, x: number = 0, y: number = 0, angle: number = 0): number {
        return box2dNativeShim.createBody([world, type, x, y, angle]);
    }

    /** Also destroys this body's fixtures and all joints connected to it. */
    // Native wrapper: box2dNative::destroyBody
    export function destroyBody(body: number): void {
        box2dNativeShim.destroyBody(body);
    }

    /** Snapshot: [x, y, angle, velocityX, velocityY, angularVelocity, mass, inertia]. */
    // Native wrapper: box2dNative::getBodyState
    export function getBodyState(body: number): number[] {
        return box2dNativeShim.getBodyState(body);
    }

    /**
     * Overwrite output[0..2] with [x, y, angle] without creating or resizing an array.
     * Output must already contain at least three entries; any trailing entries are unchanged.
     */
    // Native wrapper: box2dNative::readBodyTransform
    export function readBodyTransform(body: number, output: number[]): void {
        box2dNativeShim.readBodyTransform(body, output);
    }

    /**
     * Write rounded screen corners [x0, y0, ..., x3, y3] into an existing array.
     * Box is [halfWidth, halfHeight, localCenterX, localCenterY].
     * View is [pixelsPerMeter, originX, originY], with positive Y pointing down.
     * Output needs at least eight entries. Rounded coordinates must be within +/-30000.
     */
    // Native wrapper: box2dNative::readBodyBoxVertices
    export function readBodyBoxVertices(body: number, box: number[], view: number[], output: number[]): void {
        box2dNativeShim.readBodyBoxVertices(body, box, view, output);
    }

    // Native wrapper: box2dNative::setTransform
    export function setTransform(body: number, x: number, y: number, angle: number): void {
        box2dNativeShim.setTransform(body, x, y, angle);
    }

    // Native wrapper: box2dNative::setLinearVelocity
    export function setLinearVelocity(body: number, x: number, y: number): void {
        box2dNativeShim.setLinearVelocity(body, x, y);
    }

    // Native wrapper: box2dNative::setAngularVelocity
    export function setAngularVelocity(body: number, velocity: number): void {
        box2dNativeShim.setAngularVelocity(body, velocity);
    }

    // Native wrapper: box2dNative::setBodyType
    export function setBodyType(body: number, type: box2d.BodyType): void {
        box2dNativeShim.setBodyType(body, type);
    }

    // Native wrapper: box2dNative::setDamping
    export function setDamping(body: number, linear: number, angular: number): void {
        box2dNativeShim.setDamping(body, linear, angular);
    }

    // Native wrapper: box2dNative::setGravityScale
    export function setGravityScale(body: number, scale: number): void {
        box2dNativeShim.setGravityScale(body, scale);
    }

    // Native wrapper: box2dNative::setBodyFlag
    export function setBodyFlag(body: number, flag: box2d.BodyFlag, enabled: boolean): void {
        box2dNativeShim.setBodyFlag(body, flag, enabled);
    }

    // Native wrapper: box2dNative::getBodyFlag
    export function getBodyFlag(body: number, flag: box2d.BodyFlag): boolean {
        return box2dNativeShim.getBodyFlag(body, flag);
    }

    /** Apply a force at a world-space point. Forces clear automatically after step. */
    // Native wrapper: box2dNative::applyForce
    export function applyForce(body: number, x: number, y: number, pointX: number, pointY: number, wake: boolean = true): void {
        box2dNativeShim.applyForce([body, x, y, pointX, pointY, wake ? 1 : 0]);
    }

    // Native wrapper: box2dNative::applyForceToCenter
    export function applyForceToCenter(body: number, x: number, y: number, wake: boolean = true): void {
        box2dNativeShim.applyForceToCenter(body, x, y, wake);
    }

    /** Apply a linear impulse at a world-space point. */
    // Native wrapper: box2dNative::applyLinearImpulse
    export function applyLinearImpulse(body: number, x: number, y: number, pointX: number, pointY: number, wake: boolean = true): void {
        box2dNativeShim.applyLinearImpulse([body, x, y, pointX, pointY, wake ? 1 : 0]);
    }

    // Native wrapper: box2dNative::applyLinearImpulseToCenter
    export function applyLinearImpulseToCenter(body: number, x: number, y: number, wake: boolean = true): void {
        box2dNativeShim.applyLinearImpulseToCenter(body, x, y, wake);
    }

    // Native wrapper: box2dNative::applyTorque
    export function applyTorque(body: number, torque: number, wake: boolean = true): void {
        box2dNativeShim.applyTorque(body, torque, wake);
    }

    // Native wrapper: box2dNative::applyAngularImpulse
    export function applyAngularImpulse(body: number, impulse: number, wake: boolean = true): void {
        box2dNativeShim.applyAngularImpulse(body, impulse, wake);
    }

    /** Convert a body-local point to world coordinates; returns [x, y]. */
    // Native wrapper: box2dNative::getWorldPoint
    export function getWorldPoint(body: number, x: number, y: number): number[] {
        return box2dNativeShim.getWorldPoint(body, x, y);
    }

    /** Convert a world point to body-local coordinates; returns [x, y]. */
    // Native wrapper: box2dNative::getLocalPoint
    export function getLocalPoint(body: number, x: number, y: number): number[] {
        return box2dNativeShim.getLocalPoint(body, x, y);
    }

    /** Create a reusable circle shape, with its center in body-local coordinates. */
    // Native wrapper: box2dNative::createCircleShape
    export function createCircleShape(radius: number, centerX: number = 0, centerY: number = 0): number {
        return box2dNativeShim.createCircleShape(radius, centerX, centerY);
    }

    /** Dimensions are HALF extents in meters. Center and angle are body-local. */
    // Native wrapper: box2dNative::createBoxShape
    export function createBoxShape(halfWidth: number, halfHeight: number, centerX: number = 0, centerY: number = 0, angle: number = 0): number {
        return box2dNativeShim.createBoxShape([halfWidth, halfHeight, centerX, centerY, angle]);
    }

    /** 3-8 strictly convex vertices in boundary order: [x0, y0, x1, y1, ...]. */
    // Native wrapper: box2dNative::createPolygonShape
    export function createPolygonShape(vertices: number[]): number {
        return box2dNativeShim.createPolygonShape(vertices);
    }

    /** Create a two-sided edge in body-local coordinates; use on static bodies. */
    // Native wrapper: box2dNative::createEdgeShape
    export function createEdgeShape(x1: number, y1: number, x2: number, y2: number): number {
        return box2dNativeShim.createEdgeShape(x1, y1, x2, y2);
    }

    /**
     * Create a one-sided chain from 2-128 local vertices (3+ for loops).
     * The front face is to the right of each directed edge.
     * Do not repeat the first vertex when closing a loop.
     */
    // Native wrapper: box2dNative::createChainShape
    export function createChainShape(vertices: number[], loop: boolean = false): number {
        return box2dNativeShim.createChainShape(vertices, loop);
    }

    /** Fixtures own copies, so destroying a shape never affects existing fixtures. */
    // Native wrapper: box2dNative::destroyShape
    export function destroyShape(shape: number): void {
        box2dNativeShim.destroyShape(shape);
    }

    /** Copy a shape onto a body. Density is kg/m^2; sensors detect without collision response. */
    // Native wrapper: box2dNative::createFixture
    export function createFixture(body: number, shape: number, density: number = 1, friction: number = 0.2, restitution: number = 0, sensor: boolean = false): number {
        return box2dNativeShim.createFixture([body, shape, density, friction, restitution, sensor ? 1 : 0]);
    }

    // Native wrapper: box2dNative::destroyFixture
    export function destroyFixture(fixture: number): void {
        box2dNativeShim.destroyFixture(fixture);
    }

    // Native wrapper: box2dNative::getFixtureBody
    export function getFixtureBody(fixture: number): number {
        return box2dNativeShim.getFixtureBody(fixture);
    }

    /** Update density, friction, and restitution; recompute body mass and contact materials. */
    // Native wrapper: box2dNative::setFixtureMaterial
    export function setFixtureMaterial(fixture: number, density: number, friction: number, restitution: number): void {
        box2dNativeShim.setFixtureMaterial(fixture, density, friction, restitution);
    }

    // Native wrapper: box2dNative::setFixtureSensor
    export function setFixtureSensor(fixture: number, sensor: boolean): void {
        box2dNativeShim.setFixtureSensor(fixture, sensor);
    }

    /** 16-bit category/mask bits and signed 16-bit collision group. */
    // Native wrapper: box2dNative::setFixtureFilter
    export function setFixtureFilter(fixture: number, categoryBits: number = 1, maskBits: number = 65535, groupIndex: number = 0): void {
        box2dNativeShim.setFixtureFilter(fixture, categoryBits, maskBits, groupIndex);
    }

    /** Test a world-space point against a fixture. Edges and chains always return false. */
    // Native wrapper: box2dNative::testPoint
    export function testPoint(fixture: number, x: number, y: number): boolean {
        return box2dNativeShim.testPoint(fixture, x, y);
    }

    /** Create a rigid distance joint using world-space anchors on two different bodies in one world. */
    // Native wrapper: box2dNative::createDistanceJoint
    export function createDistanceJoint(bodyA: number, bodyB: number, anchorAX: number, anchorAY: number, anchorBX: number, anchorBY: number, collideConnected: boolean = false): number {
        return box2dNativeShim.createDistanceJoint([bodyA, bodyB, anchorAX, anchorAY, anchorBX, anchorBY, collideConnected ? 1 : 0]);
    }

    /** Set length/range in meters, stiffness in N/m, and damping in N*s/m. */
    // Native wrapper: box2dNative::setDistanceJoint
    export function setDistanceJoint(joint: number, length: number, minLength: number, maxLength: number, stiffness: number = 0, damping: number = 0): void {
        box2dNativeShim.setDistanceJoint([joint, length, minLength, maxLength, stiffness, damping]);
    }

    /** Create a hinge at a world-space anchor on two different bodies in one world. */
    // Native wrapper: box2dNative::createRevoluteJoint
    export function createRevoluteJoint(bodyA: number, bodyB: number, anchorX: number, anchorY: number, collideConnected: boolean = false): number {
        return box2dNativeShim.createRevoluteJoint([bodyA, bodyB, anchorX, anchorY, collideConnected ? 1 : 0]);
    }

    // Native wrapper: box2dNative::setRevoluteJointMotor
    export function setRevoluteJointMotor(joint: number, enabled: boolean, speed: number, maxTorque: number): void {
        box2dNativeShim.setRevoluteJointMotor(joint, enabled, speed, maxTorque);
    }

    /** Limits are radians relative to the bodies' angle difference at joint creation. */
    // Native wrapper: box2dNative::setRevoluteJointLimits
    export function setRevoluteJointLimits(joint: number, enabled: boolean, lower: number, upper: number): void {
        box2dNativeShim.setRevoluteJointLimits(joint, enabled, lower, upper);
    }

    /**
     * Create a wheel suspension between different bodies in one world.
     * Anchor and axis are world-space; the finite, nonzero axis is normalized and fixed in bodyA.
     * Motor, limits, and spring are initially disabled.
     */
    // Native wrapper: box2dNative::createWheelJoint
    export function createWheelJoint(bodyA: number, bodyB: number, anchorX: number, anchorY: number, axisX: number, axisY: number, collideConnected: boolean = false): number {
        return box2dNativeShim.createWheelJoint([bodyA, bodyB, anchorX, anchorY, axisX, axisY, collideConnected ? 1 : 0]);
    }

    /** Motor speed is radians/second, maxTorque is nonnegative N*m. Enabled zero speed brakes. */
    // Native wrapper: box2dNative::setWheelJointMotor
    export function setWheelJointMotor(joint: number, enabled: boolean, speed: number, maxTorque: number): void {
        box2dNativeShim.setWheelJointMotor(joint, enabled, speed, maxTorque);
    }

    /** Translation limits in meters along the axis, relative to the creation anchor; lower <= upper. */
    // Native wrapper: box2dNative::setWheelJointLimits
    export function setWheelJointLimits(joint: number, enabled: boolean, lower: number, upper: number): void {
        box2dNativeShim.setWheelJointLimits(joint, enabled, lower, upper);
    }

    /** Nonnegative spring stiffness in N/m and damping in N*s/m (not frequency/damping ratio). */
    // Native wrapper: box2dNative::setWheelJointSuspension
    export function setWheelJointSuspension(joint: number, stiffness: number, damping: number): void {
        box2dNativeShim.setWheelJointSuspension(joint, stiffness, damping);
    }

    /** Create a mouse joint anchored on a dynamic body. */
    // Native wrapper: box2dNative::createMouseJoint
    export function createMouseJoint(bodyA: number, bodyB: number, anchorX: number, anchorY: number, maxForce: number, stiffness: number, damping: number): number {
        return box2dNativeShim.createMouseJoint([bodyA, bodyB, anchorX, anchorY, maxForce, stiffness, damping]);
    }

    // Native wrapper: box2dNative::setMouseJointTarget
    export function setMouseJointTarget(joint: number, x: number, y: number): void {
        box2dNativeShim.setMouseJointTarget(joint, x, y);
    }

    // Native wrapper: box2dNative::destroyJoint
    export function destroyJoint(joint: number): void {
        box2dNativeShim.destroyJoint(joint);
    }

    /** Touching pairs from the last step: [fixtureA, fixtureB, ...], including sensors. */
    // Native wrapper: box2dNative::getContacts
    export function getContacts(world: number): number[] {
        return box2dNativeShim.getContacts(world);
    }

    /** Unique fixture handles whose broad-phase bounds overlap the world-space rectangle. */
    // Native wrapper: box2dNative::queryAABB
    export function queryAABB(world: number, minX: number, minY: number, maxX: number, maxY: number): number[] {
        return box2dNativeShim.queryAABB([world, minX, minY, maxX, maxY]);
    }

    /** Closest hit: [fixture, x, y, normalX, normalY, fraction], or [] if no hit. */
    // Native wrapper: box2dNative::rayCast
    export function rayCast(world: number, x1: number, y1: number, x2: number, y2: number): number[] {
        return box2dNativeShim.rayCast([world, x1, y1, x2, y2]);
    }
}