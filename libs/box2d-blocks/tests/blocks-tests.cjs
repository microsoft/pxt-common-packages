const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require(path.resolve(__dirname, "../../../../pxt-arcade/node_modules/typescript"));

let now = 0;
let sceneIndex = 0;
let nextHandle = 1;
const worlds = [];
const shapes = [];
const scenes = [{ frames: [], renderers: [] }];
const pushHandlers = [];
const popHandlers = [];
const drawings = [];

class NativeShape {
    constructor(type, values) {
        Object.assign(this, { type, values, valid: true });
        shapes.push(this);
    }
    destroy() {
        assert.equal(this.valid, true);
        this.valid = false;
    }
}

class Fixture {
    constructor(body, shape) {
        Object.assign(this, { body, shape, handle: nextHandle++, valid: true });
    }
    testPoint(x, y) {
        const cosine = Math.cos(this.body.angle);
        const sine = Math.sin(this.body.angle);
        const dx = x - this.body.x;
        const dy = y - this.body.y;
        const localX = cosine * dx + sine * dy;
        const localY = -sine * dx + cosine * dy;
        if (this.shape.type === "circle") {
            const [radius, centerX, centerY] = this.shape.values;
            const circleX = localX - centerX;
            const circleY = localY - centerY;
            return circleX * circleX + circleY * circleY <= radius * radius;
        }
        if (this.shape.type === "box") {
            const [halfWidth, halfHeight, centerX, centerY, angle] = this.shape.values;
            const boxCosine = Math.cos(angle);
            const boxSine = Math.sin(angle);
            const boxX = localX - centerX;
            const boxY = localY - centerY;
            const xInBox = boxCosine * boxX + boxSine * boxY;
            const yInBox = -boxSine * boxX + boxCosine * boxY;
            return Math.abs(xInBox) <= halfWidth && Math.abs(yInBox) <= halfHeight;
        }
        return false;
    }
}

class NativeBody {
    constructor(world, type, x, y, angle) {
        Object.assign(this, {
            world, type, x, y, angle, velocityX: 0, velocityY: 0,
            angularVelocity: 0, fixtures: [], joints: [], valid: true
        });
    }
    createFixture(shape, density, friction, restitution, sensor) {
        assert.equal(shape.valid, true);
        const fixture = new Fixture(this, shape);
        Object.assign(fixture, { density, friction, restitution, sensor });
        this.fixtures.push(fixture);
        return fixture;
    }
    getState() {
        return {
            x: this.x, y: this.y, angle: this.angle,
            velocityX: this.velocityX, velocityY: this.velocityY,
            angularVelocity: this.angularVelocity, mass: 1, inertia: 2
        };
    }
    setTransform(x, y, angle) { Object.assign(this, { x, y, angle }); }
    setLinearVelocity(x, y) { Object.assign(this, { velocityX: x, velocityY: y }); }
    set angularVelocity(value) { this._angularVelocity = value; }
    get angularVelocity() { return this._angularVelocity || 0; }
    setDamping() {}
    setGravityScale() {}
    setFlag() {}
    applyForceToCenter() {}
    applyLinearImpulseToCenter(x, y) { this.impulse = [x, y]; }
    applyTorque() {}
    applyAngularImpulse() {}
    createDistanceJoint(other) { return this.createJoint(other, "distance"); }
    createRevoluteJoint(other) { return this.createJoint(other, "revolute"); }
    createWheelJoint(other) { return this.createJoint(other, "wheel"); }
    createMouseJoint(other, ...args) {
        const joint = this.createJoint(other, "mouse");
        joint.mouseArgs = args;
        return joint;
    }
    createJoint(other, type) {
        const joint = {
            type, valid: true,
            configure() {},
            setMotor(...args) { this.motor = args; },
            setLimits(...args) { this.limits = args; },
            setSuspension(...args) { this.suspension = args; },
            setTarget(...args) { this.target = args; },
            destroy() { this.valid = false; }
        };
        this.joints.push(joint);
        other.joints.push(joint);
        return joint;
    }
    destroy() {
        assert.equal(this.valid, true);
        this.valid = false;
        this.fixtures.forEach(fixture => fixture.valid = false);
        this.joints.forEach(joint => joint.valid = false);
    }
}

class World {
    constructor(x, y) {
        Object.assign(this, { gravity: [x, y], bodies: [], contacts: [], steps: 0, valid: true });
        worlds.push(this);
    }
    createBody(type, x, y, angle) {
        const body = new NativeBody(this, type, x, y, angle);
        this.bodies.push(body);
        return body;
    }
    setGravity(x, y) { this.gravity = [x, y]; }
    step(dt) {
        assert.equal(dt, 1 / 60);
        ++this.steps;
    }
    getContacts() { return this.contacts; }
    destroy() {
        assert.equal(this.valid, true);
        this.valid = false;
        this.bodies.forEach(body => {
            body.valid = false;
            body.fixtures.forEach(fixture => fixture.valid = false);
            body.joints.forEach(joint => joint.valid = false);
        });
    }
}

const target = {
    fillCircle(...args) { drawings.push(["fillCircle", ...args]); },
    drawCircle(...args) { drawings.push(["drawCircle", ...args]); },
    fillTriangle(...args) { drawings.push(["fillTriangle", ...args]); },
    drawLine(...args) { drawings.push(["drawLine", ...args]); }
};

const context = vm.createContext({
    Math,
    control: { fail(message) { throw new Error(message); } },
    box2d: {
        World,
        BodyType: { Static: 0, Kinematic: 1, Dynamic: 2 },
        BodyFlag: {},
        Shape: {
            circle: (...args) => new NativeShape("circle", args),
            box: (...args) => new NativeShape("box", args),
            polygon: args => new NativeShape("polygon", args),
            edge: (...args) => new NativeShape("edge", args),
            chain: (...args) => new NativeShape("chain", args)
        }
    },
    game: {
        runtime: () => now,
        eventContext: () => ({
            registerFrameHandler(priority, handler) {
                assert.equal(priority, 15);
                scenes[sceneIndex].frames.push(handler);
            }
        }),
        addScenePushHandler(handler) { pushHandlers.push(handler); },
        addScenePopHandler(handler) { popHandlers.push(handler); }
    },
    scene: {
        PHYSICS_PRIORITY: 15,
        SPRITE_Z: 0,
        createRenderable(z, handler) {
            assert.equal(z, 0);
            scenes[sceneIndex].renderers.push(handler);
        }
    },
    sprites: { Flag: { Destroyed: 1 << 1 } },
    screen: { width: 160, height: 120 }
});
vm.runInContext("Array.prototype.removeElement = function (value) { const i = this.indexOf(value); if (i >= 0) this.splice(i, 1); };", context);

const source = fs.readFileSync(path.join(__dirname, "../blocks.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None }
}).outputText;
vm.runInContext(compiled, context, { filename: "blocks.ts" });

const api = context.box2dBlocks;
const kinds = context.PhysicsBodyKind;
assert.equal(worlds.length, 0, "Loading the package must not initialize physics");

const circle = api.circleShape(6);
assert.equal(worlds.length, 1, "The first API call initializes the scene world");
assert.deepEqual(worlds[0].gravity, [0, 10]);
const body = api.createBody(2, kinds.Body, circle);
assert.equal(circle.nativeShape.valid, false, "Attaching consumes the native shape template");
assert.deepEqual([body.nativeBody.x, body.nativeBody.y], [8, 6], "Bodies start at the center of the screen");
body.x = 80;
body.y = 20;

scenes[0].renderers[0](target, { drawOffsetX: 0, drawOffsetY: 0 });
assert.deepEqual(drawings[0], ["fillCircle", 80, 20, 6, 6]);
assert.deepEqual(drawings[1], ["drawCircle", 80, 20, 6, 1]);

const verticalEdge = api.edgeShape(20, Math.PI / 2);
assert.ok(Math.abs(verticalEdge.values[0]) < 0.001, "A vertical edge starts at the body's x coordinate");
assert.ok(Math.abs(verticalEdge.values[1] + 1) < 0.001, "The first endpoint is half the length above center");
assert.ok(Math.abs(verticalEdge.values[2]) < 0.001, "A vertical edge ends at the body's x coordinate");
assert.ok(Math.abs(verticalEdge.values[3] - 1) < 0.001, "The second endpoint is half the length below center");
verticalEdge.destroy();

const boundsBody = api.createBody(2, kinds.Body, api.boxShape(10, 5));
assert.ok(Math.abs(boundsBody.left - 70) < 0.001, "Body left uses attached shape bounds");
assert.ok(Math.abs(boundsBody.top - 55) < 0.001, "Body top uses attached shape bounds");
assert.ok(Math.abs(boundsBody.right - 90) < 0.001, "Body right uses attached shape bounds");
assert.ok(Math.abs(boundsBody.bottom - 65) < 0.001, "Body bottom uses attached shape bounds");
boundsBody.left = 20;
assert.ok(Math.abs(boundsBody.right - 40) < 0.001, "Setting left translates the body");
boundsBody.top = 30;
assert.ok(Math.abs(boundsBody.bottom - 40) < 0.001, "Setting top translates the body");
boundsBody.right = 100;
assert.ok(Math.abs(boundsBody.left - 80) < 0.001, "Setting right translates the body");
boundsBody.bottom = 90;
assert.ok(Math.abs(boundsBody.top - 80) < 0.001, "Setting bottom translates the body");
boundsBody.angle = Math.PI / 2;
assert.ok(Math.abs(boundsBody.left - 85) < 0.001, "Bounds account for body rotation");
assert.ok(Math.abs(boundsBody.top - 75) < 0.001, "Rotated bounds use world coordinates");
assert.ok(Math.abs(boundsBody.right - 95) < 0.001, "Rotated width reflects attached shapes");
assert.ok(Math.abs(boundsBody.bottom - 95) < 0.001, "Rotated height reflects attached shapes");

const multiShapeBody = api.createBody(2, kinds.Body, api.boxShape(5, 5));
api.attachShape(multiShapeBody, api.circleShape(2, 10, 0));
assert.ok(Math.abs(multiShapeBody.left - 75) < 0.001, "Bounds include the leftmost attached shape");
assert.ok(Math.abs(multiShapeBody.right - 92) < 0.001, "Bounds include offset attached shapes");
multiShapeBody.right = 100;
assert.ok(Math.abs(multiShapeBody.x - 88) < 0.001, "Edge setters account for all attached shapes");

const firstAtPoint = api.createBody(2, kinds.Body, api.boxShape(5, 5));
firstAtPoint.x = 30;
firstAtPoint.y = 30;
const secondAtPoint = api.createBody(2, kinds.Body, api.circleShape(5));
secondAtPoint.x = 30;
secondAtPoint.y = 30;
assert.equal(api.bodyAt(30, 30), firstAtPoint, "Point queries return the first matching body");
assert.equal(api.bodyAt(35, 35), firstAtPoint, "Point queries include fixture boundaries");
assert.equal(api.bodyAt(50, 50), null, "Point queries return null when no body contains the point");

const ground = api.createGround([
    api.point(0, 100),
    api.point(40, 80),
    api.point(160, 100)
]);
assert.equal(ground.type, 0, "Ground uses a static body");
assert.equal(ground.kind, kinds.Wall, "Ground uses the Wall body kind");
assert.equal(ground.fixtures.length, 1, "Ground uses one connected edge chain");
assert.ok(Math.abs(ground.left) < 0.001, "Ground bounds include the first x position");
assert.ok(Math.abs(ground.top - 80) < 0.001, "Ground bounds include the highest position");
assert.ok(Math.abs(ground.right - 160) < 0.001, "Ground bounds include the last x position");
assert.ok(Math.abs(ground.bottom - 100) < 0.001, "Ground bounds include the lowest position");
assert.throws(
    () => api.createGround([api.point(0, 100)]),
    /at least two positions/,
    "Ground requires at least two point blocks"
);
assert.throws(
    () => api.createGround([api.point(0, 100), null]),
    /positions cannot be empty/,
    "Ground rejects empty point entries"
);
let collisions = 0;
api.onCollision(kinds.Body, kinds.Wall, (hit, wall) => {
    assert.equal(hit, body);
    assert.equal(wall, ground);
    ++collisions;
});
worlds[0].contacts = [{
    fixtureA: body.nativeBody.fixtures[0],
    fixtureB: ground.nativeBody.fixtures[0]
}];

function frame(milliseconds = 17) {
    now += milliseconds;
    scenes[sceneIndex].frames.forEach(handler => handler());
}

frame();
assert.equal(worlds[0].steps, 1);
assert.equal(collisions, 1);
frame();
assert.equal(collisions, 1, "A persistent contact must not repeatedly fire begin events");
worlds[0].contacts = [];
frame();
worlds[0].contacts = [{
    fixtureA: body.nativeBody.fixtures[0],
    fixtureB: ground.nativeBody.fixtures[0]
}];
frame();
assert.equal(collisions, 2, "A contact beginning again must fire another event");

api.setPaused(true);
const pausedAt = worlds[0].steps;
frame(100);
assert.equal(worlds[0].steps, pausedAt);
api.setPaused(false);
api.setSimulationSpeed(2);
frame(34);
assert.equal(worlds[0].steps - pausedAt, 4, "Catch-up work is bounded");

const leftBody = api.createBody(0, kinds.Body);
leftBody.x = 20;
leftBody.y = 20;
api.attachShape(leftBody, api.boxShape(5, 5));
const middleBody = api.createBody(2, kinds.Body);
middleBody.x = 100;
middleBody.y = 50;
api.attachShape(middleBody, api.boxShape(10, 10));
const rightBody = api.createBody(2, kinds.Body);
rightBody.x = 140;
rightBody.y = 50;
api.attachShape(rightBody, api.boxShape(5, 5));

const wheelJoint = api.attachBodies(
    middleBody,
    api.bodyAnchor(api.BodyAnchor.Right),
    rightBody,
    api.bodyAnchor(api.BodyAnchor.Left),
    api.AttachmentJointType.Wheel
);
assert.equal(wheelJoint.type, api.AttachmentJointType.Wheel, "The attach block returns the common joint type");
assert.equal(wheelJoint.nativeJoint.type, "wheel", "The common joint wraps a native wheel joint");
const connectedOffset = rightBody.x - middleBody.x;
const revoluteJoint = api.attachBodies(
    leftBody,
    api.bodyAnchor(api.BodyAnchor.BottomRight),
    middleBody,
    api.bodyAnchor(api.BodyAnchor.TopLeft)
);
assert.equal(revoluteJoint.type, api.AttachmentJointType.Revolute, "The common joint records revolute joints");
assert.equal(revoluteJoint.nativeJoint.type, "revolute", "The common joint wraps a native revolute joint");
api.setJointMotor(wheelJoint, true, 2, 3);
assert.deepEqual(wheelJoint.nativeJoint.motor, [true, 2, 3], "The common motor block configures wheel joints");
api.setJointMotor(revoluteJoint, true, -1, 4);
assert.deepEqual(revoluteJoint.nativeJoint.motor, [true, -1, 4], "The common motor block configures revolute joints");
api.setJointLimits(wheelJoint, true, -10, 20);
assert.deepEqual(wheelJoint.nativeJoint.limits, [true, -1, 2], "Wheel limits convert pixels to meters");
api.setJointLimits(revoluteJoint, true, -0.5, 0.5);
assert.deepEqual(revoluteJoint.nativeJoint.limits, [true, -0.5, 0.5], "Revolute limits remain radians");
api.setWheelSuspension(wheelJoint, 5, 0.7);
assert.deepEqual(wheelJoint.nativeJoint.suspension, [5, 0.7], "Wheel suspension configures wheel joints");
assert.throws(
    () => api.setWheelSuspension(revoluteJoint, 5, 0.7),
    /not a wheel joint/,
    "Wheel suspension rejects revolute joints"
);
assert.ok(Math.abs(middleBody.x - 35) < 0.001, "Named anchors align attached bodies horizontally");
assert.ok(Math.abs(middleBody.y - 35) < 0.001, "Named anchors align attached bodies vertically");
assert.ok(
    Math.abs(rightBody.x - middleBody.x - connectedOffset) < 0.001,
    "Bodies already attached to the moved body retain their relative positions"
);

middleBody.x = 45;
middleBody.y = 55;
middleBody.angle = Math.PI / 4;
assert.ok(Math.abs(middleBody.x - 45) < 0.001, "The x property preserves y and angle");
assert.ok(Math.abs(middleBody.y - 55) < 0.001, "The y property preserves x and angle");
assert.ok(Math.abs(middleBody.angle - Math.PI / 4) < 0.001, "The angle property preserves position");

const offsetBody = api.createBody(2, kinds.Body);
offsetBody.x = 100;
offsetBody.y = 100;
api.attachBodies(leftBody, api.jointOffset(3, 4), offsetBody, api.jointOffset(-2, -1));
assert.ok(Math.abs(offsetBody.x - 25) < 0.001, "Custom body-local offsets align horizontally");
assert.ok(Math.abs(offsetBody.y - 25) < 0.001, "Custom body-local offsets align vertically");

const staticBase = api.createBody(0, kinds.Wall);
staticBase.x = 120;
staticBase.y = 90;
const anchoredBody = api.createBody(2, kinds.Body);
anchoredBody.x = 140;
anchoredBody.y = 90;
api.attachBodies(staticBase, api.bodyAnchor(api.BodyAnchor.Center), anchoredBody, api.bodyAnchor(api.BodyAnchor.Center));
const staticX = staticBase.x;
const staticY = staticBase.y;

const freeBody = api.createBody(2, kinds.Body);
freeBody.x = 20;
freeBody.y = 20;
api.attachBodies(freeBody, api.bodyAnchor(api.BodyAnchor.Center), anchoredBody, api.bodyAnchor(api.BodyAnchor.Center));
assert.ok(Math.abs(staticBase.x - staticX) < 0.001, "Connected static bodies must not move horizontally");
assert.ok(Math.abs(staticBase.y - staticY) < 0.001, "Connected static bodies must not move vertically");
assert.ok(Math.abs(anchoredBody.x - freeBody.x) < 0.001, "Dynamic bodies connected to static bodies can move");
assert.ok(Math.abs(anchoredBody.y - freeBody.y) < 0.001, "Static connections do not prevent dynamic alignment");

const kinematicBody = api.createBody(1, kinds.Body);
kinematicBody.x = 150;
kinematicBody.y = 100;
const kinematicTarget = api.createBody(0, kinds.Wall);
kinematicTarget.x = 30;
kinematicTarget.y = 40;
api.attachBodies(kinematicTarget, api.bodyAnchor(api.BodyAnchor.Center), kinematicBody, api.bodyAnchor(api.BodyAnchor.Center));
assert.ok(Math.abs(kinematicBody.x - 30) < 0.001, "Kinematic bodies can be repositioned");
assert.ok(Math.abs(kinematicBody.y - 40) < 0.001, "Kinematic bodies align in both axes");

const immovableA = api.createBody(0, kinds.Wall);
immovableA.x = 10;
immovableA.y = 10;
const immovableB = api.createBody(0, kinds.Wall);
immovableB.x = 50;
immovableB.y = 50;
assert.throws(
    () => api.attachBodies(immovableA, api.bodyAnchor(api.BodyAnchor.Center), immovableB, api.bodyAnchor(api.BodyAnchor.Center)),
    /Static Box2D bodies cannot be moved/,
    "Two immovable assemblies cannot be attached at misaligned anchors"
);

const dragBody = api.createBody(2, kinds.Body, api.boxShape(5, 5));
dragBody.x = 60;
dragBody.y = 60;
const dragSprite = { x: 100, y: 70, flags: 0 };
const mouseJoint = api.createMouseJoint(
    dragSprite,
    dragBody,
    api.bodyAnchor(api.BodyAnchor.Center),
    500,
    20,
    2
);
const follower = worlds[0].bodies[worlds[0].bodies.length - 1];
assert.equal(follower.type, 0, "Mouse joints create a hidden static follower body");
assert.deepEqual(mouseJoint.nativeJoint.mouseArgs, [6, 6, 500, 20, 2], "Mouse joints anchor on the selected body point");
assert.deepEqual(mouseJoint.nativeJoint.target, [10, 7], "Mouse joints initially target the sprite");
dragSprite.x = 120;
dragSprite.y = 90;
frame();
assert.deepEqual([follower.x, follower.y], [12, 9], "The hidden body follows the sprite");
assert.deepEqual(mouseJoint.nativeJoint.target, [12, 9], "The mouse target follows the sprite");
api.destroyMouseJoint(mouseJoint);
assert.equal(mouseJoint.nativeJoint.valid, false, "Destroying a mouse joint destroys the native joint");
assert.equal(follower.valid, false, "Destroying a mouse joint destroys its hidden body");

const bodyCleanupSprite = { x: 30, y: 30, flags: 0 };
const bodyCleanupJoint = api.createMouseJoint(
    bodyCleanupSprite,
    dragBody,
    api.bodyAnchor(api.BodyAnchor.Center)
);
const bodyCleanupFollower = worlds[0].bodies[worlds[0].bodies.length - 1];
api.destroyBody(dragBody);
assert.equal(bodyCleanupJoint.destroyed, true, "Destroying the dragged body destroys its mouse joint");
assert.equal(bodyCleanupFollower.valid, false, "Body cleanup destroys the hidden follower");

const spriteCleanupBody = api.createBody(2, kinds.Body, api.circleShape(3));
const spriteCleanupSprite = { x: 40, y: 40, flags: 0 };
const spriteCleanupJoint = api.createMouseJoint(
    spriteCleanupSprite,
    spriteCleanupBody,
    api.bodyAnchor(api.BodyAnchor.Center)
);
const spriteCleanupFollower = worlds[0].bodies[worlds[0].bodies.length - 1];
spriteCleanupSprite.flags |= 1 << 1;
frame();
assert.equal(spriteCleanupJoint.destroyed, true, "Destroyed sprites release their mouse joints");
assert.equal(spriteCleanupFollower.valid, false, "Sprite cleanup destroys the hidden follower");

const joint = api.createDistanceJoint(body, ground, 80, 20, 80, 100);
api.destroyBody(body);
assert.equal(body.nativeBody.valid, false);
assert.equal(body.nativeBody.fixtures[0].valid, false);
assert.equal(joint.valid, false, "Destroying a body destroys connected joints");

pushHandlers.forEach(handler => handler());
scenes.push({ frames: [], renderers: [] });
sceneIndex = 1;
assert.equal(worlds.length, 1, "Pushing a scene does not initialize another world");
const unused = api.circleShape(3);
assert.equal(worlds.length, 2);
popHandlers.forEach(handler => handler());
assert.equal(worlds[1].valid, false, "Popping a scene destroys its world");
assert.equal(unused.nativeShape.valid, false, "Popping a scene destroys unused shape templates");
sceneIndex = 0;
assert.equal(api.isValid(ground), true, "The previous scene state is restored");

console.log("All Box2D blocks tests passed");
