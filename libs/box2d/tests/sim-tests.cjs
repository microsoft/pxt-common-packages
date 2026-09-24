const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "..", "sim", "wasm.ts"), "utf8");
const base64 = [...source.matchAll(/"([A-Za-z0-9+/=]+)"/g)]
    .map(match => match[1])
    .join("");
const wasmModule = new WebAssembly.Module(Buffer.from(base64, "base64"));
let instance;
let wasiOutput = "";
instance = new WebAssembly.Instance(wasmModule, {
    env: {
        box2d_panic(code) {
            throw new Error(`Box2D panic ${code}`);
        },
        emscripten_notify_memory_growth() {}
    },
    wasi_snapshot_preview1: {
        fd_write(_fd, iovecs, length, written) {
            const view = new DataView(instance.exports.memory.buffer);
            let count = 0;
            for (let i = 0; i < length; ++i) {
                const pointer = view.getUint32(iovecs + i * 8, true);
                const size = view.getUint32(iovecs + i * 8 + 4, true);
                wasiOutput += Buffer.from(instance.exports.memory.buffer, pointer, size).toString();
                count += size;
            }
            view.setUint32(written, count, true);
            return 0;
        },
        fd_close() { return 8; },
        fd_seek() { return 8; },
        proc_exit(code) { throw new Error(`Box2D exited with code ${code}: ${wasiOutput.trim()}`); }
    }
});
const api = instance.exports;
api._initialize();

function result(length) {
    return [...new Float64Array(api.memory.buffer, api.bx_result(), length)];
}

const world = api.bx_createWorld(0, 9.8);
const ground = api.bx_createBody(world, 0, 0, 5, 0);
const groundShape = api.bx_createBoxShape(10, 0.5, 0, 0, 0);
const groundFixture = api.bx_createFixture(ground, groundShape, 0, 0.2, 0, 0);
const ball = api.bx_createBody(world, 2, 0, 0, 0);
const ballShape = api.bx_createCircleShape(0.5, 0, 0);
const ballFixture = api.bx_createFixture(ball, ballShape, 1, 0.2, 0, 0);
const follower = api.bx_createBody(world, 0, 0, 0, 0);
const mouseJoint = api.bx_createMouseJoint(follower, ball, 0, 0, 100, 10, 1);
api.bx_setMouseJointTarget(mouseJoint, 1, 2);
assert.equal(api.bx_isValid(mouseJoint), 1);
api.bx_destroyJoint(mouseJoint);

for (let i = 0; i < 120; ++i)
    api.bx_step(world, 1 / 60, 8, 3);

const state = result(api.bx_getBodyState(ball));
assert.ok(Math.abs(state[1] - 4) < 0.02, `ball stopped at y=${state[1]}`);
const contactPoints = result(api.bx_getContactPoints(groundFixture, ballFixture));
assert.equal(contactPoints.length, 2);
assert.ok(Math.abs(contactPoints[0]) < 0.001);
assert.ok(Math.abs(contactPoints[1] - 4.5) < 0.02);
const contactNormals = result(api.bx_getContactNormals(groundFixture, ballFixture));
assert.equal(contactNormals.length, 2);
assert.ok(Math.abs(contactNormals[0]) < 0.001);
assert.ok(Math.abs(contactNormals[1] + 1) < 0.001);

const hits = result(api.bx_queryAABB(world, -1, 3, 1, 6));
assert.deepEqual(new Set(hits), new Set([groundFixture, ballFixture]));
const ray = result(api.bx_rayCast(world, 0, -1, 0, 6));
assert.equal(ray.length, 6);
assert.equal(ray[0], ballFixture);

api.bx_destroyShape(groundShape);
api.bx_destroyShape(ballShape);
api.bx_destroyWorld(world);
assert.equal(api.bx_isValid(ball), 0);
assert.throws(() => api.bx_getBodyState(ball), /Box2D panic 906/);

const simulatorSource = source + "\n" +
    fs.readFileSync(path.join(__dirname, "..", "sim", "box2d.ts"), "utf8");
const simulatorJavaScript = ts.transpileModule(simulatorSource, {
    compilerOptions: {
        module: ts.ModuleKind.None,
        target: ts.ScriptTarget.ES2017
    }
}).outputText;
class MockRefCollection {
    constructor(values = []) {
        this.values = values.slice();
    }
    getLength() {
        return this.values.length;
    }
    getAt(index) {
        return this.values[index];
    }
    setAt(index, value) {
        this.values[index] = value;
    }
    push(value) {
        this.values.push(value);
    }
}
const collection = values => new MockRefCollection(values);
const context = vm.createContext({
    pxsim: { RefCollection: MockRefCollection },
    RefCollection: MockRefCollection,
    WebAssembly,
    Uint8Array,
    Float64Array,
    Array,
    Math,
    atob,
    U: {
        userError(message) {
            return new Error(message);
        }
    }
});
vm.runInContext(simulatorJavaScript, context);
const sim = context.pxsim.box2dNative;
for (const name of [
    "createBody", "applyForce", "applyLinearImpulse", "createBoxShape",
    "createFixture", "setFixtureDensity", "setFixtureFriction", "setFixtureRestitution",
    "setFixtureGroup", "setFixtureCategoryMask",
    "createDistanceJoint", "setDistanceJoint",
    "createRevoluteJoint", "createWheelJoint", "createMouseJoint",
    "getJointAnchors", "getContactPoints", "getContactNormals", "queryAABB", "rayCast"
]) {
    assert.equal(typeof sim[name], "function", `${name} must be registered in pxsim.box2dNative`);
}

const simWorld = sim.createWorld(0, 9.8);
const simGround = sim.createBody(collection([simWorld, 0, 0, 5, 0]));
const simGroundShape = sim.createBoxShape(collection([10, 0.5, 0, 0, 0]));
const simGroundFixture = sim.createFixture(collection([simGround, simGroundShape, 0, 0.2, 0, 0]));
const simBall = sim.createBody(collection([simWorld, 2, 0, 0, 0]));
const simBallShape = sim.createCircleShape(0.5, 0, 0);
const simBallFixture = sim.createFixture(collection([simBall, simBallShape, 1, 0.2, 0, 0]));
sim.setFixtureDensity(simBallFixture, 2);
sim.setFixtureFriction(simBallFixture, 0.4);
sim.setFixtureRestitution(simBallFixture, 0.1);
sim.setFixtureGroup(simBallFixture, -7);
sim.setFixtureCategoryMask(simBallFixture, 8, 16);
sim.setFixtureCategoryMask(simBallFixture, 1, 65535);
const simDistance = sim.createDistanceJoint(collection([
    simGround, simBall, 0, 0, 0, 0, false
]));
assert.equal(sim.isValid(simDistance), true);
assert.deepEqual(sim.getJointAnchors(simDistance).values, [0, 0, 0, 0]);
sim.setDistanceJoint(collection([simDistance, 1, 0, 2, 0, 0]));
sim.destroyJoint(simDistance);
for (let i = 0; i < 120; ++i)
    sim.step(simWorld, 1 / 60, 8, 3);
assert.ok(Math.abs(sim.getBodyState(simBall).getAt(1) - 4) < 0.02);
const simContactPoints = sim.getContactPoints(simBallFixture, simGroundFixture);
assert.equal(simContactPoints.getLength(), 2);
assert.ok(Math.abs(simContactPoints.getAt(0)) < 0.001);
assert.ok(Math.abs(simContactPoints.getAt(1) - 4.5) < 0.02);
const simContactNormals = sim.getContactNormals(simGroundFixture, simBallFixture);
assert.equal(simContactNormals.getLength(), 2);
assert.ok(Math.abs(simContactNormals.getAt(0)) < 0.001);
assert.ok(Math.abs(simContactNormals.getAt(1) + 1) < 0.001);
const simTransform = collection([0, 0, 0]);
sim.readBodyTransform(simBall, simTransform);
assert.ok(Math.abs(simTransform.getAt(1) - 4) < 0.02);
const simVertices = collection([0, 0, 0, 0, 0, 0, 0, 0]);
sim.readBodyBoxVertices(
    simBall,
    collection([0.5, 0.5, 0, 0]),
    collection([10, 0, 0]),
    simVertices
);
assert.ok(simVertices.values.every(Number.isInteger));
const simPolygon = sim.createPolygonShape(collection([-1, 0, 1, 0, 0, -1]));
const simChain = sim.createChainShape(collection([-2, 5, 0, 4, 2, 5]), false);
sim.destroyShape(simPolygon);
sim.destroyShape(simChain);
assert.ok(sim.queryAABB(collection([simWorld, -1, 3, 1, 6])).getLength() > 0);

const boundaryWorld = sim.createWorld(0, 0);
const boundaryBody = sim.createBody(collection([boundaryWorld, 0, 0, 0, 0]));
const boundaryShape = sim.createChainShape(collection([
    0, 0,
    0, 8,
    8, 8,
    8, 0
]), true);
sim.createFixture(collection([boundaryBody, boundaryShape, 0, 0.2, 0, 0]));
const boundaryMover = sim.createBody(collection([boundaryWorld, 2, 4, 1, 0]));
const boundaryCircle = sim.createCircleShape(0.5, 0, 0);
sim.createFixture(collection([boundaryMover, boundaryCircle, 1, 0.2, 0, 0]));
sim.setLinearVelocity(boundaryMover, 0, -5);
for (let i = 0; i < 30; ++i)
    sim.step(boundaryWorld, 1 / 60, 8, 3);
assert.ok(
    sim.getBodyState(boundaryMover).getAt(1) >= 0.49,
    "Clockwise screen-space tilemap boundaries collide from inside the map"
);
sim.destroyWorld(boundaryWorld);

console.log("Box2D simulator WebAssembly and TypeScript shim tests passed");
