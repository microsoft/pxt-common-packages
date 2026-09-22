const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({});
function load(file) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    vm.runInContext(stripTypeScriptTypes(source, { mode: "transform" }), context, { filename: file });
}

load("main.ts");
const api = context.box2d;
const nativeApi = context.box2dNative;
const nativeNames = Object.keys(nativeApi).filter(name => typeof nativeApi[name] === "function");
const covered = new Set();
let expected = [];
for (const name of nativeNames) {
    nativeApi[name] = (...args) => {
        const call = expected.shift();
        assert.ok(call, `Unexpected native call: ${name}`);
        assert.equal(name, call.name);
        assert.deepEqual(structuredClone(args), call.args);
        covered.add(name);
        if (call.error) throw call.error;
        if (call.effect) call.effect(args);
        return call.result;
    };
}
load("wrappers.ts");

function calls(sequence, operation) {
    assert.equal(expected.length, 0);
    expected = sequence;
    const result = operation();
    assert.equal(expected.length, 0, "Not all expected native calls were made");
    return result;
}
function call(name, args, result, operation) {
    return calls([{ name, args, result }], operation);
}
function command(name, args, operation) {
    call(name, args, undefined, operation);
}

const world = call("createWorld", [0, 9.8], 10, () => new api.World());
assert.equal(world.handle, 10);
const customWorld = call("createWorld", [-1, 2], 11, () => new api.World(-1, 2));
command("destroyWorld", [11], () => customWorld.destroy());
command("step", [10, 1 / 60, 8, 3], () => world.step());
command("step", [10, 0.02, 6, 2], () => world.step(0.02, 6, 2));
command("setGravity", [10, 2, 3], () => world.setGravity(2, 3));
command("setWorldSleepingAllowed", [10, false], () => world.setSleepingAllowed(false));
const body = call("createBody", [10, api.BodyType.Dynamic, 0, 0, 0], 20,
    () => world.createBody(api.BodyType.Dynamic));
const other = call("createBody", [10, api.BodyType.Static, 1, 2, 0.5], 21,
    () => world.createBody(api.BodyType.Static, 1, 2, 0.5));
assert.ok(body instanceof api.Body);
assert.equal(body.handle, 20);

const state = [1, 2, 0.5, 3, 4, 0.25, 5, 6];
const transform = [0, 0, 0];
calls([{
    name: "readBodyTransform", args: [20, [0, 0, 0]],
    effect: args => {
        assert.equal(args[1], transform, "The caller's buffer must be forwarded, not copied");
        args[1][0] = 1;
        args[1][1] = 2;
        args[1][2] = 0.5;
    }
}], () => assert.equal(body.readTransform(transform), undefined));
assert.deepEqual(transform, [1, 2, 0.5]);
const boxGeometry = [0.5, 0.25, 0, 0];
const renderView = [8, 80, 60];
const pixelVertices = [0, 0, 0, 0, 0, 0, 0, 0];
calls([{
    name: "readBodyBoxVertices", args: [20, boxGeometry, renderView, pixelVertices],
    effect: args => {
        assert.equal(args[1], boxGeometry);
        assert.equal(args[2], renderView);
        assert.equal(args[3], pixelVertices);
        args[3][0] = 76;
        args[3][1] = 58;
    }
}], () => assert.equal(body.readBoxVertices(boxGeometry, renderView, pixelVertices), undefined));
assert.deepEqual(pixelVertices, [76, 58, 0, 0, 0, 0, 0, 0]);
const snapshot = call("getBodyState", [20], state, () => body.getState());
assert.ok(snapshot instanceof api.BodySnapshot);
assert.deepEqual(
    [snapshot.x, snapshot.y, snapshot.angle, snapshot.velocityX, snapshot.velocityY,
        snapshot.angularVelocity, snapshot.mass, snapshot.inertia], state);
snapshot.x = 100;
assert.equal(state[0], 1);
const position = call("getBodyState", [20], state, () => body.position);
assert.ok(position instanceof api.Vec2);
assert.deepEqual([position.x, position.y], [1, 2]);
const velocity = call("getBodyState", [20], state, () => body.linearVelocity);
assert.deepEqual([velocity.x, velocity.y], [3, 4]);
for (const [property, value] of [["angle", 0.5], ["angularVelocity", 0.25], ["mass", 5], ["inertia", 6]]) {
    assert.equal(call("getBodyState", [20], state, () => body[property]), value);
}
calls([
    { name: "getBodyState", args: [20], result: state },
    { name: "setTransform", args: [20, 1, 2, 0.75] }
], () => { body.angle = 0.75; });
calls([
    { name: "getBodyState", args: [20], result: state },
    { name: "setTransform", args: [20, 7, 8, 0.5] }
], () => body.setPosition(7, 8));
command("setTransform", [20, 7, 8, 0.75], () => body.setTransform(7, 8, 0.75));
command("setAngularVelocity", [20, 0.5], () => { body.angularVelocity = 0.5; });
command("setLinearVelocity", [20, 1, 2], () => body.setLinearVelocity(1, 2));
command("setBodyType", [20, api.BodyType.Kinematic], () => body.setType(api.BodyType.Kinematic));
command("setDamping", [20, 0.1, 0.2], () => body.setDamping(0.1, 0.2));
command("setGravityScale", [20, 0.5], () => body.setGravityScale(0.5));
command("setBodyFlag", [20, api.BodyFlag.Bullet, true], () => body.setFlag(api.BodyFlag.Bullet, true));
assert.equal(call("getBodyFlag", [20, api.BodyFlag.Bullet], true, () => body.getFlag(api.BodyFlag.Bullet)), true);

const circle = call("createCircleShape", [0.5, 0, 0], 30, () => api.Shape.circle(0.5));
call("createCircleShape", [0.5, 1, 2], 31, () => api.Shape.circle(0.5, 1, 2));
call("createBoxShape", [1, 2, 0, 0, 0], 32, () => api.Shape.box(1, 2));
call("createBoxShape", [1, 2, 3, 4, 0.5], 33, () => api.Shape.box(1, 2, 3, 4, 0.5));
const vertices = [0, 0, 1, 0, 0, 1];
call("createPolygonShape", [vertices], 34, () => api.Shape.polygon(vertices));
call("createEdgeShape", [1, 2, 3, 4], 35, () => api.Shape.edge(1, 2, 3, 4));
call("createChainShape", [vertices, false], 36, () => api.Shape.chain(vertices));
call("createChainShape", [vertices, true], 37, () => api.Shape.chain(vertices, true));
const fixture = call("createFixture", [20, 30, 1, 0.2, 0, false], 40, () => body.createFixture(circle));
call("createFixture", [20, 30, 2, 0.3, 0.4, true], 41, () => body.createFixture(circle, 2, 0.3, 0.4, true));
assert.ok(fixture instanceof api.Fixture);
const owner = call("getFixtureBody", [40], 20, () => fixture.body);
assert.ok(owner instanceof api.Body);
assert.notEqual(owner, body);
assert.equal(owner.handle, body.handle);
command("setFixtureMaterial", [40, 2, 0.3, 0.4], () => fixture.setMaterial(2, 0.3, 0.4));
command("setFixtureSensor", [40, true], () => fixture.setSensor(true));
command("setFixtureFilter", [40, 1, 65535, 0], () => fixture.setFilter());
command("setFixtureFilter", [40, 2, 4, -1], () => fixture.setFilter(2, 4, -1));
assert.equal(call("testPoint", [40, 1, 2], true, () => fixture.testPoint(1, 2)), true);

for (const wake of [undefined, false]) {
    const nativeWake = wake === undefined ? true : wake;
    for (const method of ["applyForce", "applyLinearImpulse"]) {
        command(method, [20, 1, 2, 3, 4, nativeWake], () => body[method](1, 2, 3, 4, wake));
    }
    for (const method of ["applyForceToCenter", "applyLinearImpulseToCenter"]) {
        command(method, [20, 1, 2, nativeWake], () => body[method](1, 2, wake));
    }
    for (const method of ["applyTorque", "applyAngularImpulse"]) {
        command(method, [20, 0.5, nativeWake], () => body[method](0.5, wake));
    }
}
for (const method of ["getWorldPoint", "getLocalPoint"]) {
    const point = call(method, [20, 1, 2], [3, 4], () => body[method](1, 2));
    assert.ok(point instanceof api.Vec2);
    assert.deepEqual([point.x, point.y], [3, 4]);
}
const distance = call("createDistanceJoint", [20, 21, 1, 2, 3, 4, false], 50,
    () => body.createDistanceJoint(other, 1, 2, 3, 4));
assert.ok(distance instanceof api.DistanceJoint && distance instanceof api.Joint);
assert.deepEqual(
    call("getJointAnchors", [50], [1, 2, 3, 4], () => distance.getAnchors()),
    [1, 2, 3, 4]
);
command("setDistanceJoint", [50, 2, 1, 3, 0, 0], () => distance.configure(2, 1, 3));
command("setDistanceJoint", [50, 2, 1, 3, 4, 0.5], () => distance.configure(2, 1, 3, 4, 0.5));
const hinge = call("createRevoluteJoint", [20, 21, 1, 2, false], 51,
    () => body.createRevoluteJoint(other, 1, 2));
assert.ok(hinge instanceof api.RevoluteJoint);
command("setRevoluteJointMotor", [51, true, 1, 2], () => hinge.setMotor(true, 1, 2));
command("setRevoluteJointLimits", [51, true, -1, 1], () => hinge.setLimits(true, -1, 1));
call("createDistanceJoint", [20, 21, 1, 2, 3, 4, true], 52,
    () => body.createDistanceJoint(other, 1, 2, 3, 4, true));
call("createRevoluteJoint", [20, 21, 1, 2, true], 53, () => body.createRevoluteJoint(other, 1, 2, true));
const wheel = call("createWheelJoint", [20, 21, 1, 2, 0, 3, false], 54,
    () => body.createWheelJoint(other, 1, 2, 0, 3));
assert.ok(wheel instanceof api.WheelJoint && wheel instanceof api.Joint);
call("createWheelJoint", [20, 21, 1, 2, -2, 0, true], 55,
    () => body.createWheelJoint(other, 1, 2, -2, 0, true));
command("setWheelJointMotor", [54, true, 50, 20], () => wheel.setMotor(true, 50, 20));
command("setWheelJointMotor", [54, true, 0, 20], () => wheel.setMotor(true, 0, 20));
command("setWheelJointMotor", [54, false, -50, 0], () => wheel.setMotor(false, -50, 0));
command("setWheelJointLimits", [54, true, -0.25, 0.25], () => wheel.setLimits(true, -0.25, 0.25));
command("setWheelJointLimits", [54, false, 0, 0], () => wheel.setLimits(false, 0, 0));
command("setWheelJointSuspension", [54, 317.5, 17.7], () => wheel.setSuspension(317.5, 17.7));
command("setWheelJointSuspension", [54, 0, 0], () => wheel.setSuspension(0, 0));
const mouse = call("createMouseJoint", [21, 20, 1, 2, 100, 10, 1], 56,
    () => other.createMouseJoint(body, 1, 2, 100, 10, 1));
assert.ok(mouse instanceof api.MouseJoint && mouse instanceof api.Joint);
command("setMouseJointTarget", [56, 3, 4], () => mouse.setTarget(3, 4));

const contacts = call("getContacts", [10], [40, 41, 42, 43], () => world.getContacts());
assert.equal(contacts.length, 2);
assert.ok(contacts[0] instanceof api.Contact);
assert.deepEqual(Array.from(contacts, c => [c.fixtureA.handle, c.fixtureB.handle]), [[40, 41], [42, 43]]);
assert.equal(call("getContacts", [10], [], () => world.getContacts()).length, 0);
const candidates = call("queryAABB", [10, 1, 2, 3, 4], [40, 41], () => world.queryAABB(1, 2, 3, 4));
assert.deepEqual(Array.from(candidates, f => f.handle), [40, 41]);
assert.equal(call("queryAABB", [10, 1, 2, 3, 4], [], () => world.queryAABB(1, 2, 3, 4)).length, 0);
const hit = call("rayCast", [10, 1, 2, 3, 4], [40, 5, 6, -1, 0, 0.25], () => world.rayCast(1, 2, 3, 4));
assert.ok(hit instanceof api.RayCastHit);
assert.deepEqual([hit.fixture.handle, hit.point.x, hit.point.y, hit.normal.x, hit.normal.y, hit.fraction],
    [40, 5, 6, -1, 0, 0.25]);
assert.equal(call("rayCast", [10, 1, 2, 3, 4], [], () => world.rayCast(1, 2, 3, 4)), null);

// Wrappers are views, not a cache or a second lifetime manager.
assert.equal(new api.Body(20).handle, body.handle);
assert.equal(new api.Shape(30).handle, circle.handle);
assert.equal(new api.Fixture(40).handle, fixture.handle);
assert.equal(new api.WheelJoint(54).handle, wheel.handle);
assert.equal(new api.MouseJoint(56).handle, mouse.handle);
for (const object of [world, body, fixture, circle, distance, hinge, wheel, mouse]) {
    assert.equal(call("isValid", [object.handle], true, () => object.valid), true);
    assert.equal(call("isValid", [object.handle], false, () => object.valid), false);
}
command("destroyShape", [30], () => circle.destroy());
assert.equal(call("isValid", [40], true, () => fixture.valid), true);
command("destroyFixture", [40], () => fixture.destroy());
command("destroyJoint", [50], () => distance.destroy());
command("destroyJoint", [51], () => hinge.destroy());
command("destroyJoint", [54], () => wheel.destroy());
command("destroyJoint", [56], () => mouse.destroy());
command("destroyBody", [20], () => body.destroy());
command("destroyWorld", [10], () => world.destroy());
const nativeError = new Error("panic 906");
calls([{ name: "destroyBody", args: [20], error: nativeError }], () => {
    assert.throws(() => body.destroy(), error => error === nativeError);
});
calls([{ name: "setWheelJointSuspension", args: [54, 1, 2], error: nativeError }], () => {
    assert.throws(() => wheel.setSuspension(1, 2), error => error === nativeError);
});
assert.deepEqual([...covered].sort(), nativeNames.sort(), "Every low-level API must be covered");
console.log(`All wrapper tests passed (${covered.size} primitive APIs covered)`);
